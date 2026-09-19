"""
Multi-layer cache for SwiftFetch.

Layer 1: In-Memory TTLCache (cachetools) — sub-millisecond, per-process
Layer 2: Redis async client — shared across workers, 1-hour TTL
         Gracefully falls back to L1-only if Redis is not available.
"""
import asyncio
import logging
import time
from typing import Any, Optional

import orjson

try:
    from cachetools import TTLCache
except ImportError:
    TTLCache = None

logger = logging.getLogger("swiftfetch.cache")

# ── stats counters ────────────────────────────────────────────────────────────
_stats = {
    "l1_hits": 0,
    "l2_hits": 0,
    "misses": 0,
    "sets": 0,
}


class InMemoryTTLCache:
    """Simple thread-safe TTL-aware LRU cache backed by cachetools."""

    def __init__(self, maxsize: int = 500, ttl: int = 300):
        if TTLCache is not None:
            self._cache: Any = TTLCache(maxsize=maxsize, ttl=ttl)
        else:
            # plain dict fallback (no eviction)
            self._cache = {}
        self._lock = asyncio.Lock()

    async def get(self, key: str) -> Optional[Any]:
        async with self._lock:
            return self._cache.get(key)

    async def set(self, key: str, value: Any) -> None:
        async with self._lock:
            self._cache[key] = value

    async def delete(self, key: str) -> None:
        async with self._lock:
            self._cache.pop(key, None)

    @property
    def size(self) -> int:
        return len(self._cache)


class MultiLayerCache:
    """
    L1 (In-Memory TTLCache) + L2 (Redis) multi-layer cache.

    Falls back gracefully to L1-only if Redis is unavailable.
    Values are serialised to/from JSON using orjson.
    """

    def __init__(
        self,
        redis_url: Optional[str] = None,
        l1_maxsize: int = 500,
        l1_ttl: int = 300,
        l2_ttl: int = 3600,
    ):
        self._l1 = InMemoryTTLCache(maxsize=l1_maxsize, ttl=l1_ttl)
        self._l2_ttl = l2_ttl
        self._redis = None
        self._redis_url = redis_url
        self._redis_ok = False

    async def connect(self) -> None:
        """Try to connect to Redis; silently disable L2 if unavailable."""
        if not self._redis_url:
            logger.info("MultiLayerCache: Redis URL not configured — L1 only mode")
            return
        try:
            import redis.asyncio as aioredis
            client = aioredis.from_url(
                self._redis_url,
                decode_responses=False,
                socket_connect_timeout=2,
                socket_timeout=2,
            )
            await client.ping()
            self._redis = client
            self._redis_ok = True
            logger.info("MultiLayerCache: Redis connected ✓")
        except Exception as exc:
            logger.warning(f"MultiLayerCache: Redis unavailable ({exc}) — L1 only mode")
            self._redis_ok = False

    async def disconnect(self) -> None:
        if self._redis:
            await self._redis.aclose()

    async def get(self, key: str) -> Optional[Any]:
        # L1 check
        val = await self._l1.get(key)
        if val is not None:
            _stats["l1_hits"] += 1
            return val

        # L2 check
        if self._redis_ok:
            try:
                raw = await self._redis.get(key)
                if raw is not None:
                    parsed = orjson.loads(raw)
                    # warm L1
                    await self._l1.set(key, parsed)
                    _stats["l2_hits"] += 1
                    return parsed
            except Exception as exc:
                logger.warning(f"Redis GET error: {exc}")
                self._redis_ok = False

        _stats["misses"] += 1
        return None

    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        await self._l1.set(key, value)
        if self._redis_ok:
            try:
                raw = orjson.dumps(value)
                effective_ttl = ttl if ttl is not None else self._l2_ttl
                await self._redis.setex(key, effective_ttl, raw)
            except Exception as exc:
                logger.warning(f"Redis SET error: {exc}")
                self._redis_ok = False
        _stats["sets"] += 1

    async def delete(self, key: str) -> None:
        await self._l1.delete(key)
        if self._redis_ok:
            try:
                await self._redis.delete(key)
            except Exception as exc:
                logger.warning(f"Redis DELETE error: {exc}")

    def stats(self) -> dict:
        total = _stats["l1_hits"] + _stats["l2_hits"] + _stats["misses"]
        hit_rate = (
            (_stats["l1_hits"] + _stats["l2_hits"]) / total * 100
            if total > 0
            else 0.0
        )
        return {
            "l1_hits": _stats["l1_hits"],
            "l2_hits": _stats["l2_hits"],
            "misses": _stats["misses"],
            "sets": _stats["sets"],
            "total_requests": total,
            "hit_rate_pct": round(hit_rate, 2),
            "l1_size": self._l1.size,
            "redis_connected": self._redis_ok,
        }


# Singleton — imported by main.py
cache = MultiLayerCache()
