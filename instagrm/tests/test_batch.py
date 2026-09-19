import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_batch_download_success(async_client: AsyncClient):
    payload = {
        "urls": [
            "https://www.instagram.com/reel/C7192xyz1/",
            "https://www.instagram.com/p/C7192xyz2/",
            "https://www.instagram.com/reel/C7192xyz3/"
        ],
        "max_concurrent": 5,
        "quality": "best",
        "format": "mp4",
        "timeout": 20
    }

    response = await async_client.post("/api/v1/batch-download", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["total"] == 3
    assert data["success"] == 3
    assert data["failed"] == 0
    assert len(data["results"]) == 3
    assert data["results"][0]["success"] is True


@pytest.mark.asyncio
async def test_batch_download_with_invalid_url(async_client: AsyncClient):
    payload = {
        "urls": [
            "https://www.instagram.com/reel/C7192valid/",
            "https://invalid-domain.com/not-instagram"
        ],
        "max_concurrent": 2
    }

    response = await async_client.post("/api/v1/batch-download", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["total"] == 2
    assert data["success"] == 1
    assert data["failed"] == 1
    assert data["results"][1]["success"] is False
