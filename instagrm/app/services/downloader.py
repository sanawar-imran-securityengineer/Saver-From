import asyncio
import httpx
from typing import AsyncGenerator, Dict, Tuple, Optional
import structlog
from app.config import settings
from app.core.exceptions import StreamingError

logger = structlog.get_logger()

# Shared high-concurrency HTTP client for proxying media streams
_limits = httpx.Limits(
    max_connections=settings.HTTP_MAX_CONNECTIONS,
    max_keepalive_connections=settings.HTTP_MAX_KEEPALIVE_CONNECTIONS,
    keepalive_expiry=30.0
)
_client: Optional[httpx.AsyncClient] = None


def get_http_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(
            limits=_limits,
            timeout=httpx.Timeout(settings.HTTP_CLIENT_TIMEOUT, connect=10.0),
            follow_redirects=True,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                "Referer": "https://www.instagram.com/",
            }
        )
    return _client


async def close_http_client():
    global _client
    if _client and not _client.is_closed:
        await _client.aclose()


class DownloaderService:
    """Async streaming proxy with HTTP Range support and chunked transfer."""

    @staticmethod
    async def stream_media(
        target_url: str,
        range_header: Optional[str] = None,
        download: bool = False,
        filename: Optional[str] = None
    ) -> Tuple[AsyncGenerator[bytes, None], Dict[str, str], int]:
        """
        Proxies video stream from Instagram CDN to client.
        Supports Range header for video seeking and progress.
        Supports download=True for forced attachment download headers.
        """
        import re
        client = get_http_client()
        headers = {}
        if range_header:
            headers["Range"] = range_header

        try:
            req = client.build_request("GET", target_url, headers=headers)
            res = await client.send(req, stream=True)

            response_headers = {
                "Content-Type": res.headers.get("Content-Type", "video/mp4"),
                "Accept-Ranges": "bytes",
                "Cache-Control": "public, max-age=3600",
            }
            if "Content-Length" in res.headers:
                response_headers["Content-Length"] = res.headers["Content-Length"]
            if "Content-Range" in res.headers:
                response_headers["Content-Range"] = res.headers["Content-Range"]

            if download:
                raw_filename = filename or "instagram_media.mp4"
                safe_filename = re.sub(r'[^a-zA-Z0-9._-]', '_', raw_filename)
                response_headers["Content-Disposition"] = f'attachment; filename="{safe_filename}"'

            status_code = res.status_code

            async def chunk_generator() -> AsyncGenerator[bytes, None]:
                try:
                    async for chunk in res.aiter_bytes(chunk_size=64 * 1024):
                        yield chunk
                finally:
                    await res.aclose()

            return chunk_generator(), response_headers, status_code

        except Exception as e:
            logger.error("streaming_proxy_failed", url=target_url, error=str(e))
            raise StreamingError(f"Failed to stream media: {str(e)}")


downloader_service = DownloaderService()
