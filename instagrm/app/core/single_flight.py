import asyncio
from typing import Any, Callable, Dict, Optional
import structlog

logger = structlog.get_logger()


class SingleFlight:
    """
    Prevents duplicate concurrent work for the same resource.
    If 50 requests arrive for the exact same Instagram URL at the same time,
    only 1 extraction runs; all 49 other requests await the identical result.
    """

    def __init__(self):
        self._calls: Dict[str, asyncio.Future] = {}
        self._lock = asyncio.Lock()

    async def execute(self, key: str, fn: Callable[..., Any], *args, **kwargs) -> Any:
        async with self._lock:
            if key in self._calls:
                future = self._calls[key]
                logger.info("single_flight_dedup_hit", key=key)
                # Release lock while awaiting in-flight task
                return await asyncio.shield(future)

            # First caller creates a Future
            loop = asyncio.get_running_loop()
            future = loop.create_future()
            self._calls[key] = future

        # Execute outside the lock
        try:
            result = await fn(*args, **kwargs)
            future.set_result(result)
            return result
        except Exception as e:
            future.set_exception(e)
            raise
        finally:
            async with self._lock:
                self._calls.pop(key, None)


single_flight = SingleFlight()
