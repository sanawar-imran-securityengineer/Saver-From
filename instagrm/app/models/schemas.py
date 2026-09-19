from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, HttpUrl


class MediaFormat(BaseModel):
    format_id: str
    format_note: Optional[str] = None
    resolution: Optional[str] = None
    ext: str = "mp4"
    filesize: Optional[int] = None
    filesize_formatted: Optional[str] = None
    url: str
    has_audio: bool = True
    has_video: bool = True


class VideoMetadata(BaseModel):
    id: str
    shortcode: Optional[str] = None
    title: str = "Instagram Video"
    description: Optional[str] = ""
    thumbnail: Optional[str] = None
    duration: Optional[float] = None
    duration_formatted: Optional[str] = "00:00"
    uploader: Optional[str] = "Instagram User"
    uploader_id: Optional[str] = None
    view_count: Optional[int] = None
    like_count: Optional[int] = None
    comment_count: Optional[int] = None
    is_carousel: bool = False
    carousel_items: Optional[List[Dict[str, Any]]] = None


class DownloadResponse(BaseModel):
    success: bool = True
    direct_url: str
    stream_url: Optional[str] = None
    title: str
    thumbnail: Optional[str] = None
    duration: Optional[float] = None
    duration_formatted: Optional[str] = "00:00"
    uploader: Optional[str] = None
    author_avatar: Optional[str] = None
    fetch_time_ms: float
    cached: bool = False
    cache_layer: Optional[str] = "none"  # "L1", "L2", or "none"
    quality: str = "best"
    format: str = "mp4"
    media_type: str = "video"  # "video", "photo", "reel", "story", "igtv", "carousel", "profile"
    is_carousel: bool = False
    carousel_items: List[Dict[str, Any]] = Field(default_factory=list)
    filesize: Optional[int] = None
    filesize_formatted: Optional[str] = None
    formats: List[MediaFormat] = Field(default_factory=list)



class BatchDownloadRequest(BaseModel):
    urls: List[str] = Field(..., min_length=1, max_length=50)
    max_concurrent: int = Field(default=10, ge=1, le=25)
    quality: str = Field(default="best")
    format: str = Field(default="mp4")
    timeout: int = Field(default=30, ge=5, le=60)


class BatchItemResult(BaseModel):
    url: str
    success: bool
    data: Optional[DownloadResponse] = None
    error: Optional[str] = None


class BatchDownloadResponse(BaseModel):
    total: int
    success: int
    failed: int
    results: List[BatchItemResult]
    total_time_ms: float
    avg_time_ms: float


class InfoResponse(BaseModel):
    success: bool = True
    id: str
    shortcode: Optional[str] = None
    title: str
    description: Optional[str] = None
    thumbnail: Optional[str] = None
    duration: Optional[float] = None
    duration_formatted: Optional[str] = "00:00"
    uploader: Optional[str] = None
    views: Optional[int] = None
    likes: Optional[int] = None
    formats: List[MediaFormat] = Field(default_factory=list)


class HealthResponse(BaseModel):
    status: str
    uptime_seconds: float
    version: str
    environment: str
    cache_status: Dict[str, Any]
    active_connections: int


class StatsResponse(BaseModel):
    total_requests: int
    cache_hits_l1: int
    cache_hits_l2: int
    cache_misses: int
    cache_hit_rate: str
    avg_response_time_ms: float
    total_errors: int
