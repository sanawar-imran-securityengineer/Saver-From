"""
AsyncSingleFlight — prevents duplicate concurrent yt-dlp extractions.

When 100 concurrent users request the same YouTube URL while extraction
is already running, only ONE extraction runs. All others await the shared
asyncio.Event and receive the same result when it completes.
"""
import asyncio
import logging
from typing import Any, Dict, Optional, Tuple

logger = logging.getLogger("swiftfetch.single_flight")


class AsyncSingleFlight:
    """
    Thread-safe async deduplication barrier for expensive operations.

    Usage:
        sf = AsyncSingleFlight()
        result = await sf.do(key, expensive_coroutine_factory)
    """

    def __init__(self) -> None:
        self._lock = asyncio.Lock()
        # key -> (event, result_holder)
        self._inflight: Dict[str, Tuple[asyncio.Event, list]] = {}

    async def do(self, key: str, coro_factory) -> Any:
        """
        Execute coro_factory() exactly once per key while it is in-flight.
        Concurrent callers with the same key await the first caller's result.

        Args:
            key: Deduplication key (e.g. normalized YouTube URL)
            coro_factory: A zero-argument async callable that returns the result

        Returns:
            The result of coro_factory(), shared with all concurrent waiters.

        Raises:
            Exception: Re-raises any exception from coro_factory() to all waiters.
        """
        async with self._lock:
            if key in self._inflight:
                event, holder = self._inflight[key]
                is_caller = False
            else:
                event = asyncio.Event()
                holder: list = []  # [result] or [None, exception]
                self._inflight[key] = (event, holder)
                is_caller = True

        if not is_caller:
            # Wait for the first caller to finish
            logger.debug(f"SingleFlight: waiting on in-flight key={key[:80]}")
            await event.wait()
            if len(holder) == 2 and holder[0] is None:
                raise holder[1]
            return holder[0]

        # We are the first caller — run the actual work
        try:
            logger.debug(f"SingleFlight: executing key={key[:80]}")
            result = await coro_factory()
            holder.append(result)
            return result
        except Exception as exc:
            holder.append(None)
            holder.append(exc)
            raise
        finally:
            async with self._lock:
                self._inflight.pop(key, None)
            event.set()

    @property
    def inflight_count(self) -> int:
        """Number of currently in-flight keys."""
        return len(self._inflight)
