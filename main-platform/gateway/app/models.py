from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class PlatformEnum(str, Enum):
    TIKTOK = "tiktok"
    INSTAGRAM = "instagram"
    YOUTUBE = "youtube"
    PINTEREST = "pinterest"
    REDDIT = "reddit"
    SNAPCHAT = "snapchat"
    THREADS = "threads"
    FACEBOOK = "facebook"
    TWITCH = "twitch"
    TWITTER = "twitter"
    UNKNOWN = "unknown"


class ServiceStatusEnum(str, Enum):
    ONLINE = "ONLINE"
    MAINTENANCE = "MAINTENANCE"
    DEGRADED = "DEGRADED"
    OFFLINE = "OFFLINE"


class DetectRequest(BaseModel):
    url: str = Field(..., min_length=1, max_length=2048, description="URL of the video to detect")


class DetectResponse(BaseModel):
    success: bool
    platform: PlatformEnum
    platform_name: str
    icon: str
    accent_color: str
    url: str
    message: Optional[str] = None


class DownloadRequest(BaseModel):
    url: str = Field(..., min_length=1, max_length=2048, description="Target video URL")
    option: Optional[str] = Field(default="best", description="Quality or option preset (e.g. 1080p, 720p, mp3)")
    format: Optional[str] = Field(default=None, description="Requested format (e.g. best, 1080p, 4k, mp3)")
    quality: Optional[str] = Field(default=None, description="Quality preference")
    format_id: Optional[str] = Field(default=None, description="Format ID for multi-format downloaders (like Facebook)")

    class Config:
        extra = "allow"


class DownloadOption(BaseModel):
    label: str
    value: str
    url: Optional[str] = None
    filesize: Optional[str] = None


class DownloadResponse(BaseModel):
    success: bool
    platform: str
    title: Optional[str] = None
    filename: Optional[str] = None
    download_url: Optional[str] = None
    stream_url: Optional[str] = None
    file_size: Optional[str] = None
    quality_selected: Optional[str] = None
    thumbnail: Optional[str] = None
    duration: Optional[Any] = None
    formats: Optional[List[Any]] = None
    error: Optional[str] = None
    message: Optional[str] = None
    downloader_used: Optional[str] = None


class InfoResponse(BaseModel):
    success: bool
    platform: str
    title: Optional[str] = None
    thumbnail: Optional[str] = None
    duration: Optional[Any] = None
    uploader: Optional[str] = None
    formats: Optional[List[Any]] = None
    error: Optional[str] = None
    message: Optional[str] = None


class ServiceHealth(BaseModel):
    platform: str
    name: str
    status: ServiceStatusEnum
    service_url: str
    latency_ms: Optional[float] = None
    last_check: Optional[str] = None
    maintenance_reason: Optional[str] = None


class GatewayHealthResponse(BaseModel):
    status: str
    version: str
    uptime_seconds: float
    services: Dict[str, ServiceHealth]


class MaintenanceToggleRequest(BaseModel):
    platform: str
    enabled: bool
    reason: Optional[str] = "Scheduled maintenance"


class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    message: str
    platform: Optional[str] = None
