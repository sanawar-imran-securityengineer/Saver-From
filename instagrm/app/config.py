import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "InstaStream-API"
    APP_VERSION: str = "2.0.0"
    ENVIRONMENT: str = "production"
    DEBUG: bool = False

    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 4

    # Redis (Optional distributed L2 cache; falls back to in-memory L1 cache if unavailable)
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_CONNECT_TIMEOUT: float = 2.0
    CACHE_TTL: int = 3600
    L1_CACHE_MAXSIZE: int = 2000
    L1_CACHE_TTL: int = 300

    # Concurrency & Performance
    MAX_CONCURRENT_DOWNLOADS: int = 50
    SINGLE_FLIGHT_TIMEOUT: float = 30.0

    # HTTP Client / Streaming Proxy
    HTTP_MAX_CONNECTIONS: int = 100
    HTTP_MAX_KEEPALIVE_CONNECTIONS: int = 20
    HTTP_CLIENT_TIMEOUT: float = 30.0

    # Rate Limiting
    RATE_LIMIT: int = 120
    RATE_LIMIT_PERIOD: int = 60
    RATE_LIMIT_STRING: str = "120/minute"

    # yt-dlp Settings
    YDL_TIMEOUT: int = 30
    YDL_RETRIES: int = 3

    # Storage & Cleanup
    DOWNLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "downloads")
    FILE_RETENTION_MINUTES: int = 30
    CLEANUP_INTERVAL_SECONDS: int = 300
    MAX_FILE_SIZE_BYTES: int = 150 * 1024 * 1024
    REQUEST_TIMEOUT_SECONDS: int = 45
    MAX_URL_LENGTH: int = 500

    # Instagram Authentication & Cookies
    INSTAGRAM_SESSIONID: Optional[str] = None
    INSTAGRAM_COOKIES_PATH: Optional[str] = "cookies.txt"

    # Security & CORS
    CORS_ORIGINS: List[str] = ["*"]
    ALLOWED_HOSTS: List[str] = ["*"]


    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
