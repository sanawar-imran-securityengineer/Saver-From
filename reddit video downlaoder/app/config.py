from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Core
    app_name: str = "SwiftFetch"
    downloads_dir: Path = Path("./downloads")
    max_file_size_mb: int = 500
    download_timeout_seconds: int = 300
    file_ttl_minutes: int = 30
    max_concurrent_downloads: int = 3
    max_retries: int = 2

    # CORS
    cors_origins: str = "*"

    # Rate limiting
    rate_limit_per_minute: int = 10

    # URL validation
    max_url_length: int = 2048
    allow_http: bool = False

    # Cleanup
    cleanup_interval_seconds: int = 60

    # ── Caching ───────────────────────────────────────────────────────────────
    # Set REDIS_URL=redis://localhost:6379/0 in .env to enable L2 Redis cache.
    # Leave empty to use in-memory L1 cache only (zero-error fallback).
    redis_url: str = ""

    # L1 in-memory cache: max entries and TTL in seconds
    cache_l1_maxsize: int = 500
    cache_l1_ttl: int = 300

    # L2 Redis cache TTL in seconds (1 hour default)
    cache_l2_ttl: int = 3600

    # Info-only (metadata) cache TTL in seconds (aggressive — 10 minutes)
    cache_info_ttl: int = 600

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
