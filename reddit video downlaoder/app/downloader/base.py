from abc import ABC, abstractmethod
from .result import DownloadResult


class BaseDownloader(ABC):
    """Abstract base class for all downloaders."""

    @abstractmethod
    def download(self, url: str, output_directory: str, option: str) -> DownloadResult:
        """Download a video from the given URL to output_directory.

        Args:
            url: Public video URL.
            output_directory: Directory to save the file in.
            option: One of '360p', '720p', '1080p', 'mp3'.

        Returns:
            DownloadResult with metadata about the downloaded file.
        """
        raise NotImplementedError

    @property
    @abstractmethod
    def name(self) -> str:
        """Return the downloader's identifying name."""
        raise NotImplementedError
