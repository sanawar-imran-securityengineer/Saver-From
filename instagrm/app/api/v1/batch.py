import asyncio
import time
from fastapi import APIRouter, Request
import structlog

from app.api.v1.download import _fetch_and_cache_video
from app.config import settings
from app.core.exceptions import InvalidInstagramURLError
from app.core.single_flight import single_flight
from app.models.schemas import (
    BatchDownloadRequest,
    BatchDownloadResponse,
    BatchItemResult,
    DownloadResponse
)
from app.services.cache import cache_service
from app.utils.helpers import get_cache_key, Timer
from app.utils.validators import validate_instagram_url, clean_instagram_url

logger = structlog.get_logger()
router = APIRouter()


async def _process_single_url(
    url: str,
    semaphore: asyncio.Semaphore,
    quality: str,
    format_type: str,
    base_url: str,
    timeout: int
) -> BatchItemResult:
    """Processes a single URL within semaphore concurrency limits."""
    async with semaphore:
        timer = Timer()
        timer.__enter__()

        if not validate_instagram_url(url):
            return BatchItemResult(
                url=url,
                success=False,
                error="Invalid Instagram URL format"
            )

        clean_url = clean_instagram_url(url)
        cache_key = get_cache_key(clean_url, quality=quality, format_type=format_type)

        try:
            # Check cache first
            cached_data, cache_layer = await cache_service.get(cache_key)
            if cached_data:
                timer.__exit__(None, None, None)
                cached_data["cached"] = True
                cached_data["cache_layer"] = cache_layer or "L1"
                cached_data["fetch_time_ms"] = timer.elapsed_ms
                return BatchItemResult(
                    url=url,
                    success=True,
                    data=DownloadResponse(**cached_data)
                )

            # Deduplicated extraction with timeout
            async with asyncio.timeout(timeout):
                data = await single_flight.execute(
                    cache_key,
                    _fetch_and_cache_video,
                    clean_url,
                    quality,
                    format_type,
                    base_url
                )
                await cache_service.set(cache_key, data, ttl=settings.CACHE_TTL)

                timer.__exit__(None, None, None)
                data["cached"] = False
                data["cache_layer"] = "none"
                data["fetch_time_ms"] = timer.elapsed_ms
                return BatchItemResult(
                    url=url,
                    success=True,
                    data=DownloadResponse(**data)
                )

        except asyncio.TimeoutError:
            return BatchItemResult(
                url=url,
                success=False,
                error=f"Processing timed out after {timeout} seconds"
            )
        except Exception as e:
            return BatchItemResult(
                url=url,
                success=False,
                error=str(e)
            )


@router.post("/batch-download", response_model=BatchDownloadResponse)
async def batch_download(
    request: Request,
    payload: BatchDownloadRequest
):
    """
    Highly Concurrent Batch Video Downloader:
    - Semaphore-controlled parallel processing
    - Deduplicated caching per item
    - Returns structured batch results with total & average times
    """
    total_timer = Timer()
    total_timer.__enter__()

    max_concurrent = min(payload.max_concurrent, settings.MAX_CONCURRENT_DOWNLOADS)
    semaphore = asyncio.Semaphore(max_concurrent)
    base_url = str(request.base_url).rstrip("/")

    tasks = [
        _process_single_url(
            url=url,
            semaphore=semaphore,
            quality=payload.quality,
            format_type=payload.format,
            base_url=base_url,
            timeout=payload.timeout
        )
        for url in payload.urls
    ]

    results = await asyncio.gather(*tasks)
    total_timer.__exit__(None, None, None)

    success_count = sum(1 for r in results if r.success)
    failed_count = len(results) - success_count
    total_time = total_timer.elapsed_ms
    avg_time = round(total_time / len(results), 2) if results else 0.0

    return BatchDownloadResponse(
        total=len(results),
        success=success_count,
        failed=failed_count,
        results=results,
        total_time_ms=total_time,
        avg_time_ms=avg_time
    )
