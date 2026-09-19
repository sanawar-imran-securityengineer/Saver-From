import time
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST

# Prometheus Metrics
REQUEST_COUNT = Counter(
    "instagram_requests_total",
    "Total HTTP requests to the Instagram Downloader API",
    ["method", "endpoint", "status"]
)

REQUEST_LATENCY = Histogram(
    "instagram_request_latency_seconds",
    "Request latency in seconds",
    ["endpoint"],
    buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0]
)

CACHE_HITS = Counter(
    "instagram_cache_hits_total",
    "Total cache hits",
    ["layer"]  # "L1" or "L2"
)

CACHE_MISSES = Counter(
    "instagram_cache_misses_total",
    "Total cache misses"
)

EXTRACTION_ERRORS = Counter(
    "instagram_extraction_errors_total",
    "Total yt-dlp extraction errors",
    ["error_type"]
)

ACTIVE_CONNECTIONS = Gauge(
    "instagram_active_connections",
    "Number of currently active HTTP connections"
)


class InternalStats:
    """In-memory high-speed statistics tracker for fast API /stats response."""
    def __init__(self):
        self.start_time = time.time()
        self.total_requests = 0
        self.cache_hits_l1 = 0
        self.cache_hits_l2 = 0
        self.cache_misses = 0
        self.total_errors = 0
        self.total_duration_ms = 0.0

    def record_request(self, duration_ms: float, cache_layer: str, is_error: bool = False):
        self.total_requests += 1
        self.total_duration_ms += duration_ms
        if is_error:
            self.total_errors += 1
        if cache_layer == "L1":
            self.cache_hits_l1 += 1
            CACHE_HITS.labels(layer="L1").inc()
        elif cache_layer == "L2":
            self.cache_hits_l2 += 1
            CACHE_HITS.labels(layer="L2").inc()
        else:
            self.cache_misses += 1
            CACHE_MISSES.inc()

    def get_stats(self) -> dict:
        hits = self.cache_hits_l1 + self.cache_hits_l2
        total = self.total_requests
        rate = f"{(hits / total * 100):.1f}%" if total > 0 else "0.0%"
        avg_ms = (self.total_duration_ms / total) if total > 0 else 0.0

        return {
            "total_requests": self.total_requests,
            "cache_hits_l1": self.cache_hits_l1,
            "cache_hits_l2": self.cache_hits_l2,
            "cache_misses": self.cache_misses,
            "cache_hit_rate": rate,
            "avg_response_time_ms": round(avg_ms, 2),
            "total_errors": self.total_errors,
        }

    @property
    def uptime_seconds(self) -> float:
        return round(time.time() - self.start_time, 2)


internal_stats = InternalStats()
