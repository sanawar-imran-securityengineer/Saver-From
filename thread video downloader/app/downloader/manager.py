import asyncio
import logging
from typing import Optional

from .base import BaseDownloader
from .result import DownloadResult
from .ytdlp_downloader import YtDlpDownloader, DownloadError
from .threads_downloader import ThreadsDownloader, is_threads_url
from ..config import settings

logger = logging.getLogger("swiftfetch.manager")


class DownloaderManager:
    """Manages downloader instances and enforces concurrency limits."""

    def __init__(self):
        self._ytdlp_downloader = YtDlpDownloader()
        self._threads_downloader = ThreadsDownloader()
        self._downloaders = [self._ytdlp_downloader, self._threads_downloader]
        self._semaphore = asyncio.Semaphore(settings.max_concurrent_downloads)

    async def download(
        self, url: str, output_directory: str, option: str
    ) -> DownloadResult:
        """Try matching downloader first, falling back as needed."""
        # For Threads URLs, prioritize direct fast Threads downloader
        if is_threads_url(url):
            downloaders = [self._threads_downloader, self._ytdlp_downloader]
        else:
            downloaders = self._downloaders
        async with self._semaphore:
            last_error: Optional[Exception] = None
            for downloader in downloaders:
                try:
                    logger.info(f"Attempting download with {downloader.name}")
                    result = await asyncio.wait_for(
                        downloader.download(url, output_directory, option),
                        timeout=settings.download_timeout_seconds,
                    )
                    return result
                except asyncio.TimeoutError:
                    logger.warning(f"Download timed out with {downloader.name}")
                    last_error = DownloadError("Download timed out")
                except DownloadError as e:
                    logger.warning(f"Download failed with {downloader.name}: {e}")
                    last_error = e
                except Exception as e:
                    logger.warning(f"Unexpected error with {downloader.name}: {e}")
                    last_error = e

            raise DownloadError(
                f"All downloaders failed: {last_error}" if last_error else "All downloaders failed"
            )
