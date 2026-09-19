import asyncio
import logging
import time
from pathlib import Path
from typing import Dict

from ..config import settings

logger = logging.getLogger("swiftfetch.cleanup")


class FileCleanupService:
    """Background service that deletes files older than the configured TTL."""

    def __init__(self, downloads_dir: Path, ttl_minutes: int = settings.file_ttl_minutes):
        self._downloads_dir = downloads_dir
        self._ttl_seconds = ttl_minutes * 60
        self._task: asyncio.Task = None

    def start(self) -> None:
        if self._task is None or self._task.done():
            self._task = asyncio.create_task(self._run_loop())

    async def stop(self) -> None:
        if self._task and not self._task.done():
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass

    async def _run_loop(self) -> None:
        while True:
            try:
                await asyncio.sleep(settings.cleanup_interval_seconds)
                self._cleanup_now()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.warning(f"Cleanup error: {e}")

    def _cleanup_now(self) -> int:
        if not self._downloads_dir.exists():
            return 0
        now = time.time()
        deleted = 0
        for f in self._downloads_dir.iterdir():
            try:
                if f.is_file() and f.suffix.lower() in (".mp4", ".mp3"):
                    age = now - f.stat().st_mtime
                    if age > self._ttl_seconds:
                        f.unlink()
                        deleted += 1
                        logger.info(f"Deleted expired file: {f.name}")
            except Exception as e:
                logger.warning(f"Could not delete {f.name}: {e}")
        if deleted:
            logger.info(f"Cleanup removed {deleted} expired file(s)")
        return deleted
