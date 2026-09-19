from dataclasses import dataclass
from typing import Optional


@dataclass
class DownloadResult:
    title: str
    filename: str
    option_requested: str
    quality_selected: str
    downloader_used: str
    download_url: str
    file_size: Optional[str] = None
