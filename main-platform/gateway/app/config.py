from pydantic import AnyUrl
from pydantic_settings import BaseSettings
from typing import Dict

class ServiceConfig(BaseSettings):
    url: AnyUrl
    health_path: str = "/health"
    download_path: str = "/api/download"
    name: str
    icon: str = ""
    accent_color: str = "#ffffff"

class Settings(BaseSettings):
    DEFAULT_TIMEOUT: int = 30  # seconds
    HEALTH_CHECK_TIMEOUT: int = 5
    SERVICES: Dict[str, ServiceConfig] = {
        "tiktok": ServiceConfig(
            url="http://localhost:8001",
            health_path="/health",
            download_path="/api/download",
            name="TikTok",
            icon="/static/icons/tiktok.svg",
            accent_color="#010101",
        ),
        "instagram": ServiceConfig(
            url="http://localhost:8002",
            health_path="/health",
            download_path="/api/v1/download",
            name="Instagram",
            icon="/static/icons/instagram.svg",
            accent_color="#E1306C",
        ),
        "youtube": ServiceConfig(
            url="http://localhost:8003",
            health_path="/health",
            download_path="/api/v1/download",
            name="YouTube",
            icon="/static/icons/youtube.svg",
            accent_color="#FF0000",
        ),
        "pinterest": ServiceConfig(
            url="http://localhost:8004",
            health_path="/health",
            download_path="/api/v1/download",
            name="Pinterest",
            icon="/static/icons/pinterest.svg",
            accent_color="#E60023",
        ),
        "reddit": ServiceConfig(
            url="http://localhost:8005",
            health_path="/health",
            download_path="/api/v1/download",
            name="Reddit",
            icon="/static/icons/reddit.svg",
            accent_color="#FF4500",
        ),
        "snapchat": ServiceConfig(
            url="http://localhost:8006",
            health_path="/health",
            download_path="/api/v1/download",
            name="Snapchat",
            icon="/static/icons/snapchat.svg",
            accent_color="#FFFC00",
        ),
        "threads": ServiceConfig(
            url="http://localhost:8007",
            health_path="/health",
            download_path="/api/v1/download",
            name="Threads",
            icon="/static/icons/threads.svg",
            accent_color="#000000",
        ),
        "facebook": ServiceConfig(
            url="http://localhost:8008",
            health_path="/health",
            download_path="/api/v1/download",
            name="Facebook",
            icon="/static/icons/facebook.svg",
            accent_color="#1877F2",
        ),
        "twitch": ServiceConfig(
            url="http://localhost:8009",
            health_path="/health",
            download_path="/api/v1/download",
            name="Twitch",
            icon="/static/icons/twitch.svg",
            accent_color="#9146FF",
        ),
        "twitter": ServiceConfig(
            url="http://localhost:8010",
            health_path="/health",
            download_path="/api/v1/download",
            name="Twitter/X",
            icon="/static/icons/twitter.svg",
            accent_color="#1DA1F2",
        ),
    }

settings = Settings()
