import asyncio
import orjson
from typing import Any, Optional, Dict
import cachetools
import redis.asyncio as aioredis
import structlog

from app.config import settings

logger = structlog.get_logger()


class MultiLayerCacheService:
    """
    High-Performance Multi-Layer Cache:
    - Layer 1: In-Memory TTLCache (<1ms latency)
    - Layer 2: Redis distributed cache (<10ms latency) with automatic fallback
    """

    def __init__(self):
        # L1 In-memory cache with TTL
        self.l1_cache: cachetools.TTLCache = cachetools.TTLCache(
            maxsize=settings.L1_CACHE_MAXSIZE,
            ttl=settings.L1_CACHE_TTL
        )
        self.l1_lock = asyncio.Lock()

        # L2 Redis client
        self.redis_client: Optional[aioredis.Redis] = None
        self.redis_available: bool = False

    async def initialize(self):
        """Connect to Redis L2 cache if available, else fallback gracefully to L1."""
        try:
            self.redis_client = aioredis.from_url(
                settings.REDIS_URL,
                socket_timeout=settings.REDIS_CONNECT_TIMEOUT,
                socket_connect_timeout=settings.REDIS_CONNECT_TIMEOUT,
                decode_responses=False  # Keep raw bytes for orjson
            )
            # Test ping
            await asyncio.wait_for(self.redis_client.ping(), timeout=settings.REDIS_CONNECT_TIMEOUT)
            self.redis_available = True
            logger.info("cache_initialized", status="L1_and_L2_Redis_active")
        except Exception as e:
            self.redis_available = False
            logger.warning("cache_l2_unavailable", reason=str(e), note="Falling back to in-memory L1 cache")

    async def close(self):
        if self.redis_client and self.redis_available:
            try:
                await self.redis_client.close()
            except Exception:
                pass

    async def get(self, key: str) -> tuple[Optional[Any], Optional[str]]:
        """
        Retrieves an item from cache.
        Returns (data, layer_name) where layer_name is 'L1', 'L2', or None.
        """
        # Check L1 (In-Memory)
        async with self.l1_lock:
            if key in self.l1_cache:
                return self.l1_cache[key], "L1"

        # Check L2 (Redis)
        if self.redis_available and self.redis_client:
            try:
                raw = await self.redis_client.get(key)
                if raw:
                    data = orjson.loads(raw)
                    # Promote to L1
                    async with self.l1_lock:
                        self.l1_cache[key] = data
                    return data, "L2"
            except Exception as e:
                logger.error("redis_get_error", key=key, error=str(e))

        return None, None

    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Saves an item to both L1 and L2 caches."""
        cache_ttl = ttl or settings.CACHE_TTL

        # Save to L1
        async with self.l1_lock:
            self.l1_cache[key] = value

        # Save to L2 (Redis)
        if self.redis_available and self.redis_client:
            try:
                raw = orjson.dumps(value)
                await self.redis_client.set(key, raw, ex=cache_ttl)
            except Exception as e:
                logger.error("redis_set_error", key=key, error=str(e))

    async def get_status(self) -> Dict[str, Any]:
        """Returns health status of the caching subsystem."""
        redis_ping_ok = False
        if self.redis_available and self.redis_client:
            try:
                redis_ping_ok = await self.redis_client.ping()
            except Exception:
                redis_ping_ok = False

        return {
            "l1_memory_active": True,
            "l1_items_count": len(self.l1_cache),
            "l1_max_size": settings.L1_CACHE_MAXSIZE,
            "l2_redis_connected": self.redis_available and redis_ping_ok,
            "l2_redis_url": settings.REDIS_URL if self.redis_available else "disabled/unreachable"
        }


cache_service = MultiLayerCacheService()
