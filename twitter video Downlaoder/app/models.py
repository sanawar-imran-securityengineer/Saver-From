from pydantic import BaseModel, Field
from typing import Optional, Literal


class DownloadRequest(BaseModel):
    url: str = Field(..., description="Public YouTube video URL")
    option: Literal["360p", "720p", "1080p", "mp3"] = Field(
        ..., description="Output format option"
    )


class DownloadResponse(BaseModel):
    success: bool
    title: str
    filename: str
    option_requested: str
    quality_selected: str
    downloader_used: str
    download_url: str
    file_size: Optional[str] = None


class ErrorResponse(BaseModel):
    success: bool = False
    message: str
