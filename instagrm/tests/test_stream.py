import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_stream_invalid_url():
    response = client.get("/api/v1/stream?url=invalid-url")
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_stream_video_with_download_header():
    mock_gen = AsyncMock()
    async def sample_gen():
        yield b"test-chunk"
    
    mock_headers = {
        "Content-Type": "video/mp4",
        "Content-Disposition": 'attachment; filename="my_reel.mp4"'
    }

    with patch("app.services.downloader.downloader_service.stream_media", return_value=(sample_gen(), mock_headers, 200)):
        response = client.get("/api/v1/stream?url=https://example.com/video.mp4&download=true&filename=my_reel.mp4")
        assert response.status_code == 200
        assert "Content-Disposition" in response.headers
        assert "my_reel.mp4" in response.headers["Content-Disposition"]
