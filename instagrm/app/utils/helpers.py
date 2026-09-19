import hashlib
import time
from typing import Dict, Any


def get_cache_key(url: str, quality: str = "best", format_type: str = "mp4") -> str:
    """Generates an md5 cache key based on the clean URL and requested format."""
    normalized = f"{url.strip().lower()}:{quality.lower()}:{format_type.lower()}"
    return f"insta:{hashlib.md5(normalized.encode()).hexdigest()}"


class Timer:
    """Context manager and utility to measure elapsed time in milliseconds."""
    def __init__(self):
        self.start_time: float = 0.0
        self.end_time: float = 0.0

    def __enter__(self):
        self.start_time = time.perf_counter()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.end_time = time.perf_counter()

    @property
    def elapsed_ms(self) -> float:
        if self.end_time > 0:
            return round((self.end_time - self.start_time) * 1000, 2)
        return round((time.perf_counter() - self.start_time) * 1000, 2)
