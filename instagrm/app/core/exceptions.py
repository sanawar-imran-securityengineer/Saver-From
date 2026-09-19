from fastapi import HTTPException, status


class InstagramDownloaderError(Exception):
    """Base exception for all downloader errors."""
    def __init__(self, message: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class InvalidInstagramURLError(InstagramDownloaderError):
    """Raised when an invalid or unsupported Instagram URL is provided."""
    def __init__(self, message: str = "Invalid Instagram URL format"):
        super().__init__(message, status_code=status.HTTP_400_BAD_REQUEST)


class MediaNotFoundError(InstagramDownloaderError):
    """Raised when the media is private, removed, or not found."""
    def __init__(self, message: str = "Media not found, private, or inaccessible"):
        super().__init__(message, status_code=status.HTTP_404_NOT_FOUND)


class InstagramRateLimitError(InstagramDownloaderError):
    """Raised when Instagram or our API rate limit is exceeded."""
    def __init__(self, message: str = "Rate limit exceeded. Please retry in a moment."):
        super().__init__(message, status_code=status.HTTP_429_TOO_MANY_REQUESTS)


class UpstreamExtractionError(InstagramDownloaderError):
    """Raised when yt-dlp or extractor fails to parse media."""
    def __init__(self, message: str = "Failed to extract Instagram media"):
        super().__init__(message, status_code=status.HTTP_502_BAD_GATEWAY)


class StreamingError(InstagramDownloaderError):
    """Raised when proxy video streaming encounters an issue."""
    def __init__(self, message: str = "Error streaming media stream"):
        super().__init__(message, status_code=status.HTTP_502_BAD_GATEWAY)
