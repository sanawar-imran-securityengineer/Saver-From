from fastapi import APIRouter, Query, HTTPException
import structlog

from app.config import settings
from app.core.exceptions import InvalidInstagramURLError
from app.core.single_flight import single_flight
from app.models.schemas import InfoResponse, MediaFormat
from app.services.cache import cache_service
from app.services.instagram import instagram_service
from app.utils.formatters import format_duration
from app.utils.helpers import get_cache_key
from app.utils.validators import (
    validate_instagram_url,
    clean_instagram_url,
    extract_instagram_code
)

logger = structlog.get_logger()
router = APIRouter()


async def _extract_info_raw(clean_url: str) -> dict:
    info = await instagram_service.extract_media_info(clean_url)
    formats_data = instagram_service.parse_formats(info)

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

    duration = info.get("duration")

    return {
        "success": True,
        "id": info.get("id") or extract_instagram_code(clean_url) or "unknown",
        "shortcode": extract_instagram_code(clean_url),
        "title": info.get("title") or info.get("description", "Instagram Video"),
        "description": info.get("description", ""),
        "thumbnail": info.get("thumbnail"),
        "duration": duration,
        "duration_formatted": format_duration(duration),
        "uploader": info.get("uploader") or info.get("channel") or "Instagram User",
        "views": info.get("view_count"),
        "likes": info.get("like_count"),
        "formats": [f.model_dump() for f in formats],
    }


@router.get("/info", response_model=InfoResponse)
async def get_url_info(
    url: str = Query(..., description="Instagram URL for metadata extraction")
):
    """
    Metadata-only inspection for Instagram media:
    Returns titles, captions, thumbnails, view/like statistics and available resolutions.
    """
    if not validate_instagram_url(url):
        raise InvalidInstagramURLError(f"Provided URL '{url}' is not a valid Instagram link.")

    clean_url = clean_instagram_url(url)
    cache_key = get_cache_key(f"info:{clean_url}")

    # Check cache
    cached_data, _ = await cache_service.get(cache_key)
    if cached_data:
        return InfoResponse(**cached_data)

    try:
        data = await single_flight.execute(cache_key, _extract_info_raw, clean_url)
        await cache_service.set(cache_key, data, ttl=settings.CACHE_TTL)
        return InfoResponse(**data)
    except Exception as e:
        logger.error("info_extraction_error", url=url, error=str(e))
        raise HTTPException(status_code=500, detail=str(e))
