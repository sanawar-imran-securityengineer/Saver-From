import pytest
import asyncio
from unittest.mock import AsyncMock, patch, MagicMock
from app.downloader.manager import DownloaderManager
from app.downloader.result import DownloadResult
from app.downloader.ytdlp_downloader import DownloadError


class TestDownloaderManager:
    def test_successful_download(self):
        async def run():
            manager = DownloaderManager()
            mock_result = DownloadResult(
                title="Test Video",
                filename="test-uuid.mp4",
                option_requested="720p",
                quality_selected="720p",
                downloader_used="yt-dlp",
                download_url="/api/file/test-uuid.mp4",
            )
            manager._downloaders[0].download = AsyncMock(return_value=mock_result)
            result = await manager.download("https://youtu.be/test", "/tmp", "720p")
            assert result.title == "Test Video"
            assert result.downloader_used == "yt-dlp"

        asyncio.run(run())

    def test_download_error_propagates(self):
        async def run():
            manager = DownloaderManager()
            manager._downloaders[0].download = AsyncMock(side_effect=DownloadError("failed"))
            with pytest.raises(DownloadError):
                await manager.download("https://youtu.be/test", "/tmp", "720p")

        asyncio.run(run())

    def test_concurrency_semaphore(self):
        async def run():
            manager = DownloaderManager()
            call_count = 0

            async def mock_download(url, out, opt):
                nonlocal call_count
                call_count += 1
                await asyncio.sleep(0.1)
                return DownloadResult(
                    title="Test",
                    filename="test.mp4",
                    option_requested="720p",
                    quality_selected="720p",
                    downloader_used="yt-dlp",
                    download_url="/api/file/test.mp4",
                )

            manager._downloaders[0].download = mock_download
            tasks = [
                asyncio.create_task(manager.download("https://youtu.be/t", "/tmp", "720p"))
                for _ in range(5)
            ]
            results = await asyncio.gather(*tasks)
            assert len(results) == 5
            assert call_count == 5

        asyncio.run(run())
