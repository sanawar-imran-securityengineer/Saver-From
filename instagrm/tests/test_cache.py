import asyncio
import pytest
from app.services.cache import cache_service
from app.core.single_flight import SingleFlight


@pytest.mark.asyncio
async def test_cache_service_l1():
    key = "test:unique_key_123"
    value = {"title": "Test Reel", "views": 100}

    # Set value
    await cache_service.set(key, value, ttl=60)

    # Get value
    retrieved, layer = await cache_service.get(key)
    assert retrieved == value
    assert layer == "L1"


@pytest.mark.asyncio
async def test_single_flight_deduplication():
    flight = SingleFlight()
    call_count = 0

    async def expensive_task():
        nonlocal call_count
        call_count += 1
        await asyncio.sleep(0.05)
        return "expensive_result"

    # Launch 10 simultaneous calls for the exact same key
    tasks = [flight.execute("shared_key", expensive_task) for _ in range(10)]
    results = await asyncio.gather(*tasks)

    # All 10 tasks should get the exact same result
    assert all(r == "expensive_result" for r in results)
    # The expensive function should only have been called ONCE!
    assert call_count == 1
