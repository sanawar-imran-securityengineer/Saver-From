import asyncio
import logging
import time
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from .config import settings
from .models import DownloadRequest, DownloadResponse, ErrorResponse
from .security import setup_logging, secure_log, resolve_safe_path
from .downloader.manager import DownloaderManager
from .downloader.ytdlp_downloader import DownloadError, YtDlpDownloader
from .services.validation import validate_url, normalize_url, resolve_reddit_url
from .services.cleanup import FileCleanupService
from .core.cache import MultiLayerCache
from .core.single_flight import AsyncSingleFlight

setup_logging()
logger = logging.getLogger("swiftfetch.main")

# ── Startup time for uptime tracking ─────────────────────────────────────────
_start_time = time.time()

# ── Rate limiter ──────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address, default_limits=[])

# ── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="ReddSave",
    description="Fast public Reddit video & audio downloader with sound — MP4 and MP3. Public content only.",
    version="2.0.0",
)

app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

# ── CORS ──────────────────────────────────────────────────────────────────────
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402

cors_origins = (
    [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
    if settings.cors_origins != "*"
    else ["*"]
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

# ── Services ──────────────────────────────────────────────────────────────────
downloads_path = Path(settings.downloads_dir)
downloads_path.mkdir(parents=True, exist_ok=True)

manager = DownloaderManager()
cleanup_service = FileCleanupService(downloads_path)

# Multi-layer cache singleton
_cache = MultiLayerCache(
    redis_url=settings.redis_url or None,
    l1_maxsize=settings.cache_l1_maxsize,
    l1_ttl=settings.cache_l1_ttl,
    l2_ttl=settings.cache_l2_ttl,
)

# SingleFlight deduplicator for info + download
_sf_info = AsyncSingleFlight()
_sf_download = AsyncSingleFlight()

# YtDlpDownloader for direct info-only calls
_ytdlp = YtDlpDownloader()


@app.on_event("startup")
async def on_startup():
    await _cache.connect()
    cleanup_service.start()
    logger.info(f"SwiftFetch v2 started. Downloads: {downloads_path.resolve()}")


@app.on_event("shutdown")
async def on_shutdown():
    await cleanup_service.stop()
    await _cache.disconnect()


# ── Exception handlers ────────────────────────────────────────────────────────
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content=ErrorResponse(message="The server is busy. Please try again later.").model_dump(),
    )


# ── /api/health ───────────────────────────────────────────────────────────────
@app.get("/api/health")
async def health():
    cache_stats = _cache.stats()
    uptime_seconds = int(time.time() - _start_time)
    try:
        disk = downloads_path.stat()
        disk_ok = True
    except Exception:
        disk_ok = False

    return {
        "status": "ok",
        "version": "2.0.0",
        "uptime_seconds": uptime_seconds,
        "redis_connected": cache_stats["redis_connected"],
        "disk_ok": disk_ok,
        "cache": cache_stats,
        "inflight": {
            "info": _sf_info.inflight_count,
            "download": _sf_download.inflight_count,
        },
    }


# ── /api/stats ────────────────────────────────────────────────────────────────
@app.get("/api/stats")
async def stats():
    """Cache hit rate statistics for monitoring."""
    return _cache.stats()


# ── /api/info ─────────────────────────────────────────────────────────────────
@app.get("/api/info")
@limiter.limit("30/minute")
async def video_info(request: Request, url: str):
    """
    Fast metadata-only endpoint — no download.
    Returns thumbnail, title, duration, views.
    Results cached aggressively (L1+L2).
    """
    url = normalize_url(url)
    valid, error_msg = validate_url(url)
    if not valid:
        return JSONResponse(
            status_code=400,
            content=ErrorResponse(message=error_msg).model_dump(),
        )

    url = await resolve_reddit_url(url)
    cache_key = f"info:{url}"

    cached = await _cache.get(cache_key)
    if cached:
        return cached

    async def _do_info():
        return await _ytdlp.extract_info(url)

    try:
        result = await _sf_info.do(cache_key, _do_info)
        await _cache.set(cache_key, result, ttl=settings.cache_info_ttl)
        return result
    except DownloadError as e:
        logger.warning(f"Info extraction failed: {e}")
        raise HTTPException(status_code=422, detail="This video could not be retrieved.")
    except Exception as e:
        logger.error(f"Info extraction error: {e}")
        raise HTTPException(status_code=500, detail="This video could not be retrieved.")


# ── /api/download ─────────────────────────────────────────────────────────────
@app.post("/api/download", response_model=DownloadResponse)
@limiter.limit(f"{settings.rate_limit_per_minute}/minute")
async def download_video(request: Request, body: DownloadRequest):
    """Download a public Reddit video in the selected format."""
    body.url = normalize_url(body.url)
    valid, error_msg = validate_url(body.url)
    if not valid:
        secure_log("URL validation failed", body.url)
        return JSONResponse(
            status_code=400,
            content=ErrorResponse(message=error_msg).model_dump(),
        )

    body.url = await resolve_reddit_url(body.url)
    secure_log("Download requested", body.url, option=body.option)

    # Check download result cache (keyed by url+option)
    cache_key = f"dl:{body.url}:{body.option}"
    cached = await _cache.get(cache_key)
    if cached:
        # Validate the file still exists before serving cached result
        cached_file = downloads_path / cached.get("filename", "")
        if cached_file.exists():
            return DownloadResponse(**cached)

    async def _do_download():
        return await manager.download(
            url=body.url.strip(),
            output_directory=str(downloads_path),
            option=body.option,
        )

    try:
        result = await asyncio.wait_for(
            _sf_download.do(cache_key, _do_download),
            timeout=settings.download_timeout_seconds,
        )
    except asyncio.TimeoutError:
        logger.warning("Download timed out")
        return JSONResponse(
            status_code=504,
            content=ErrorResponse(message="The download took too long and was stopped.").model_dump(),
        )
    except DownloadError as e:
        logger.warning(f"Download failed: {e}")
        return JSONResponse(
            status_code=500,
            content=ErrorResponse(message="This video could not be downloaded.").model_dump(),
        )
    except Exception as e:
        logger.error(f"Unexpected download error: {e}")
        return JSONResponse(
            status_code=500,
            content=ErrorResponse(message="This video could not be downloaded.").model_dump(),
        )

    # Check file size
    file_path = downloads_path / result.filename
    if file_path.exists():
        size = file_path.stat().st_size
        max_bytes = settings.max_file_size_mb * 1024 * 1024
        if size > max_bytes:
            try:
                file_path.unlink()
            except Exception:
                pass
            return JSONResponse(
                status_code=413,
                content=ErrorResponse(message="The file is too large to process.").model_dump(),
            )

    secure_log(
        "Download completed",
        body.url,
        option=body.option,
        filename=result.filename,
        quality=result.quality_selected,
    )

    response_data = DownloadResponse(
        success=True,
        title=result.title,
        filename=result.filename,
        option_requested=result.option_requested,
        quality_selected=result.quality_selected,
        downloader_used=result.downloader_used,
        download_url=result.download_url,
        file_size=result.file_size,
    )

    # Cache the successful download result (short TTL — file may be deleted)
    await _cache.set(cache_key, response_data.model_dump(), ttl=min(settings.file_ttl_minutes * 60, 1200))

    return response_data


# ── /api/file/{filename} ──────────────────────────────────────────────────────
@app.api_route("/api/file/{filename}", methods=["GET", "HEAD"])
async def serve_file(filename: str):
    """Serve a downloaded file. Only server-generated UUID filenames are allowed."""
    safe_path = resolve_safe_path(filename, downloads_path)
    if safe_path is None or not safe_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    max_bytes = settings.max_file_size_mb * 1024 * 1024
    if safe_path.stat().st_size > max_bytes:
        raise HTTPException(status_code=413, detail="File too large")

    media_type = "video/mp4" if safe_path.suffix.lower() == ".mp4" else "audio/mpeg"
    return FileResponse(
        path=str(safe_path),
        media_type=media_type,
        filename=safe_path.name,
        headers={
            "Cache-Control": "public, max-age=1800",  # L3 CDN cache 30 min
            "Content-Disposition": f"attachment; filename=\"{safe_path.name}\"",
        },
    )


# ── Static frontend (mounted last so API routes take priority) ─────────────────
static_dir = Path(__file__).parent.parent / "static"
if static_dir.exists():
    app.mount("/", StaticFiles(directory=str(static_dir), html=True), name="static")
