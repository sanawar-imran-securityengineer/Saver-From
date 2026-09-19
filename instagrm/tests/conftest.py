import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch, MagicMock

from app.main import app
from app.services.cache import cache_service

MOCK_INFO = {
    "id": "C7192xyz",
    "title": "Amazing Cinematic Reel",
    "description": "Visual aesthetics #instagram #viral",
    "thumbnail": "https://example.com/thumb.jpg",
    "duration": 34.5,
    "uploader": "cinematic_creator",
    "view_count": 52000,
    "like_count": 4100,
    "url": "https://example.com/video_best.mp4",
    "formats": [
        {
            "format_id": "1080p",
            "format_note": "1080p Full HD",
            "width": 1080,
            "height": 1920,
            "ext": "mp4",
            "filesize": 15000000,
            "url": "https://example.com/video_1080p.mp4",
            "vcodec": "avc1.640028",
            "acodec": "mp4a.40.2"
        },
        {
            "format_id": "720p",
            "format_note": "720p HD",
            "width": 720,
            "height": 1280,
            "ext": "mp4",
            "filesize": 8000000,
            "url": "https://example.com/video_720p.mp4",
            "vcodec": "avc1.4d401f",
            "acodec": "mp4a.40.2"
        },
        {
            "format_id": "audio-only",
            "format_note": "Audio Master",
            "ext": "m4a",
            "filesize": 1200000,
            "url": "https://example.com/audio.m4a",
            "vcodec": "none",
            "acodec": "mp4a.40.2"
        }
    ]
}


@pytest.fixture(autouse=True)
def mock_ytdlp_extraction():
    """Mock yt-dlp extract_info to ensure tests are fast, deterministic, and offline-capable."""
    with patch("yt_dlp.YoutubeDL.YoutubeDL.extract_info", return_value=MOCK_INFO) as mock:
        yield mock


@pytest.fixture
async def async_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client
