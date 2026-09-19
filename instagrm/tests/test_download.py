import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_invalid_url_returns_400(async_client: AsyncClient):
    response = await async_client.get("/api/v1/download?url=https://youtube.com/watch?v=123")
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert "InvalidInstagramURLError" in data["error"]


@pytest.mark.asyncio
async def test_valid_download_endpoint(async_client: AsyncClient):
    test_url = "https://www.instagram.com/reel/C7192xyz/"
    response = await async_client.get(f"/api/v1/download?url={test_url}")
    assert response.status_code == 200
    data = response.json()

    assert data["success"] is True
    assert "direct_url" in data
    assert data["direct_url"] != ""
    assert data["title"] == "Amazing Cinematic Reel"
    assert data["uploader"] == "cinematic_creator"
    assert len(data["formats"]) > 0


@pytest.mark.asyncio
async def test_caching_behavior(async_client: AsyncClient):
    test_url = "https://www.instagram.com/reel/C7192cachetest/"

    # First call -> Miss
    res1 = await async_client.get(f"/api/v1/download?url={test_url}")
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["cached"] is False

    # Second call -> Cache Hit
    res2 = await async_client.get(f"/api/v1/download?url={test_url}")
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["cached"] is True
    assert data2["cache_layer"] in ["L1", "L2"]


@pytest.mark.asyncio
async def test_info_endpoint(async_client: AsyncClient):
    test_url = "https://www.instagram.com/p/C7192xyz/"
    response = await async_client.get(f"/api/v1/info?url={test_url}")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["title"] == "Amazing Cinematic Reel"
    assert data["uploader"] == "cinematic_creator"
    assert data["views"] == 52000


@pytest.mark.asyncio
async def test_health_and_stats(async_client: AsyncClient):
    health_res = await async_client.get("/api/v1/health")
    assert health_res.status_code == 200
    health_data = health_res.json()
    assert health_data["status"] == "healthy"
    assert "cache_status" in health_data

    stats_res = await async_client.get("/api/v1/stats")
    assert stats_res.status_code == 200
    stats_data = stats_res.json()
    assert "total_requests" in stats_data
    assert "cache_hit_rate" in stats_data
