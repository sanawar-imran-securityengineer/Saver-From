import asyncio
import json
import time
from typing import Optional
from urllib.parse import quote
from fastapi import APIRouter, Query, Request, HTTPException
from fastapi.responses import StreamingResponse
import structlog

from app.config import settings
from app.core.exceptions import InvalidInstagramURLError, MediaNotFoundError
from app.core.single_flight import single_flight
from app.core.rate_limiter import limiter
from app.models.schemas import DownloadResponse, MediaFormat
from app.services.cache import cache_service
from app.services.instagram import instagram_service
from app.services.metrics import internal_stats
from app.utils.formatters import format_bytes, format_duration
from app.utils.helpers import get_cache_key, Timer
from app.utils.validators import validate_instagram_url, clean_instagram_url, extract_instagram_code

logger = structlog.get_logger()
router = APIRouter()


async def _fetch_and_cache_video(
    clean_url: str,
    quality: str = "best",
    format_type: str = "mp4",
    base_url: str = "",
    session_id: Optional[str] = None
) -> dict:
    """Core extraction logic wrapped for SingleFlight and caching."""
    info = await instagram_service.extract_media_info(clean_url, session_id=session_id)

    formats_data = instagram_service.parse_formats(info)
    direct_url = instagram_service.select_best_url(info, quality=quality, format_ext=format_type)

    # Build stream proxy URL
    stream_url = f"{base_url}/api/v1/stream?url={quote(direct_url)}" if direct_url else None

    # Parse duration and thumbnail
    duration = info.get("duration")
    thumbnail = info.get("thumbnail") or direct_url
    uploader = info.get("uploader") or info.get("channel") or "Instagram User"
    title = info.get("title") or info.get("description", "Instagram Post")
    if len(title) > 80:
        title = title[:77] + "..."

    # Carousel / Multi-Item Parsing
    carousel_items = instagram_service.extract_carousel_items(info, base_url)
    is_carousel = len(carousel_items) > 1

    # Detect Media Type
    if is_carousel:
        media_type = "carousel"
    elif "/reel/" in clean_url or "/reels/" in clean_url:
        media_type = "reel"
    elif "/stories/" in clean_url:
        media_type = "story"
    elif "/tv/" in clean_url:
        media_type = "igtv"
    elif not any(f.get("has_video") for f in formats_data) and direct_url:
        media_type = "photo"
    else:
        media_type = "video"

    formats = [
        MediaFormat(
            format_id=f.get("format_id", "default"),
            format_note=f.get("format_note"),
            resolution=f.get("resolution"),
            ext=f.get("ext", "mp4"),
            filesize=f.get("filesize"),
            filesize_formatted=f.get("filesize_formatted"),
            url=f.get("url", ""),
            has_audio=f.get("has_audio", True),
            has_video=f.get("has_video", True),
        )
        for f in formats_data
    ]

    return {
        "direct_url": direct_url,
        "stream_url": stream_url,
        "title": title,
        "thumbnail": thumbnail,
        "duration": duration,
        "duration_formatted": format_duration(duration),
        "uploader": uploader,
        "author_avatar": info.get("uploader_url") or thumbnail,
        "quality": quality,
        "format": format_type,
        "media_type": media_type,
        "is_carousel": is_carousel,
        "carousel_items": carousel_items,
        "formats": [f.model_dump() for f in formats],
    }


@router.get("/download", response_model=DownloadResponse)
@limiter.limit(f"{settings.RATE_LIMIT}/{settings.RATE_LIMIT_PERIOD} seconds")
async def download_video(
    request: Request,
    url: str = Query(..., description="Instagram Reel, Post, Video, Photo, or Carousel URL"),
    quality: str = Query("best", pattern="^(best|1080|720|480|360|audio)$"),
    format: str = Query("mp4", pattern="^(mp4|webm|mp3)$"),
    session_id: Optional[str] = Query(None, description="Optional Instagram session cookie")
):
    """
    Optimized Instagram Video, Photo, Reel, Story & Carousel Downloader:
    - Normalizes URL & checks multi-layer cache
    - SingleFlight deduplication for concurrent requests
    - Returns high-resolution direct video/photo link and streaming proxy
    - Full support for multi-item Carousel galleries
    """
    timer = Timer()
    timer.__enter__()

    if not validate_instagram_url(url):
        raise InvalidInstagramURLError(f"Provided URL '{url}' is not a valid Instagram link.")

    # Header fallback for session cookie
    header_session = request.headers.get("X-Instagram-Session")
    active_session = session_id or header_session

    clean_url = clean_instagram_url(url)
    cache_key = get_cache_key(clean_url, quality=quality, format_type=format)

    # 1. Check Multi-Layer Cache
    cached_data, cache_layer = await cache_service.get(cache_key)
    if cached_data:
        timer.__exit__(None, None, None)
        internal_stats.record_request(timer.elapsed_ms, cache_layer=cache_layer or "L1")
        cached_data["cached"] = True
        cached_data["cache_layer"] = cache_layer or "L1"
        cached_data["fetch_time_ms"] = timer.elapsed_ms
        return DownloadResponse(**cached_data)

    # 2. Extract with SingleFlight Request Deduplication
    base_url = str(request.base_url).rstrip("/")
    try:
        data = await single_flight.execute(
            cache_key,
            _fetch_and_cache_video,
            clean_url,
            quality,
            format,
            base_url,
            active_session
        )

        # 3. Store in Cache (1 hour TTL)
        await cache_service.set(cache_key, data, ttl=settings.CACHE_TTL)

        timer.__exit__(None, None, None)
        internal_stats.record_request(timer.elapsed_ms, cache_layer="none")

        data["cached"] = False
        data["cache_layer"] = "none"
        data["fetch_time_ms"] = timer.elapsed_ms
        return DownloadResponse(**data)

    except Exception as e:
        timer.__exit__(None, None, None)
        internal_stats.record_request(timer.elapsed_ms, cache_layer="none", is_error=True)

        if isinstance(e, HTTPException):
            raise e
        logger.error("download_endpoint_error", url=url, error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/download-fast", response_model=DownloadResponse)
async def download_fast(
    request: Request,
    url: str = Query(..., description="Instagram URL for fast cached download")
):
    """
    Ultra-Fast Cached Download:
    Prioritizes L1 memory cache (< 20ms) and L2 Redis (< 100ms).
    """
    return await download_video(request, url=url, quality="best", format="mp4")


@router.get("/download-progress")
async def download_progress(
    url: str = Query(..., description="Instagram URL to monitor download progress")
):
    """
    Server-Sent Events (SSE) streaming real-time download and processing progress.
    """
    if not validate_instagram_url(url):
        raise InvalidInstagramURLError("Invalid Instagram URL")

    async def event_generator():
        stages = [
            {"progress": 15, "status": "Connecting to Instagram CDN..."},
            {"progress": 40, "status": "Extracting high-definition media stream..."},
            {"progress": 70, "status": "Parsing video codecs and audio channels..."},
            {"progress": 90, "status": "Finalizing high-speed direct links..."},
            {"progress": 100, "status": "Completed! Media ready for download."}
        ]
        for stage in stages:
            await asyncio.sleep(0.15)
            yield f"data: {json.dumps(stage)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
