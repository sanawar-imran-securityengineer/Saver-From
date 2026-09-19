import re
from urllib.parse import urlparse
from typing import Tuple, Optional
from .models import PlatformEnum
from .config import settings


# Pre-compiled regular expressions for domain and path pattern matching
PLATFORM_PATTERNS = [
    # TikTok
    (
        PlatformEnum.TIKTOK,
        re.compile(r"^(?:https?://)?(?:[a-zA-Z0-9_\-]+\.)?(?:tiktok\.com|douyin\.com)", re.IGNORECASE),
        re.compile(r"(?:/video/|/v/|/t/|/share/|vm\.tiktok\.com|vt\.tiktok\.com|@[\w.-]+/video/\d+)", re.IGNORECASE),
    ),
    # Instagram
    (
        PlatformEnum.INSTAGRAM,
        re.compile(r"^(?:https?://)?(?:[a-zA-Z0-9_\-]+\.)?(?:instagram\.com|instagr\.am)", re.IGNORECASE),
        re.compile(r"(?:/p/|/reel/|/reels/|/tv/|/stories/)", re.IGNORECASE),
    ),
    # Facebook
    (
        PlatformEnum.FACEBOOK,
        re.compile(r"^(?:https?://)?(?:[a-zA-Z0-9_\-]+\.)?(?:facebook\.com|fb\.watch|fb\.com)", re.IGNORECASE),
        re.compile(r"(?:/watch/?|/reel/?|/videos/?|/share/|/posts/|story\.php|video\.php|fb\.watch)", re.IGNORECASE),
    ),
    # YouTube
    (
        PlatformEnum.YOUTUBE,
        re.compile(r"^(?:https?://)?(?:[a-zA-Z0-9_\-]+\.)?(?:youtube\.com|youtu\.be)", re.IGNORECASE),
        re.compile(r"(?:watch\?v=|youtu\.be/|/shorts/|/embed/|/v/)", re.IGNORECASE),
    ),
    # Pinterest
    (
        PlatformEnum.PINTEREST,
        re.compile(r"^(?:https?://)?(?:[a-zA-Z0-9_\-]+\.)?(?:pinterest\.[a-z.]+|pin\.it)", re.IGNORECASE),
        re.compile(r"(?:/pin/|pin\.it/|/sent/)", re.IGNORECASE),
    ),
    # Reddit
    (
        PlatformEnum.REDDIT,
        re.compile(r"^(?:https?://)?(?:[a-zA-Z0-9_\-]+\.)?(?:reddit\.com|redd\.it|v\.redd\.it)", re.IGNORECASE),
        re.compile(r"(?:/r/[\w.-]+/comments/|/r/[\w.-]+/s/|redd\.it/|v\.redd\.it/)", re.IGNORECASE),
    ),
    # Snapchat
    (
        PlatformEnum.SNAPCHAT,
        re.compile(r"^(?:https?://)?(?:[a-zA-Z0-9_\-]+\.)?(?:snapchat\.com)", re.IGNORECASE),
        re.compile(r"(?:/spotlight/|/add/|/story/|/p/|/t/|snapchat\.com)", re.IGNORECASE),
    ),
    # Threads
    (
        PlatformEnum.THREADS,
        re.compile(r"^(?:https?://)?(?:[a-zA-Z0-9_\-]+\.)?(?:threads\.net|threads\.com)", re.IGNORECASE),
        re.compile(r"(?:/@[\w.-]+/post/|/post/|/t/)", re.IGNORECASE),
    ),
    # Twitch
    (
        PlatformEnum.TWITCH,
        re.compile(r"^(?:https?://)?(?:[a-zA-Z0-9_\-]+\.)?(?:twitch\.tv|clips\.twitch\.tv)", re.IGNORECASE),
        re.compile(r"(?:/videos/\d+|/clip/|clips\.twitch\.tv/|/[\w.-]+/clip/)", re.IGNORECASE),
    ),
    # Twitter / X
    (
        PlatformEnum.TWITTER,
        re.compile(r"^(?:https?://)?(?:[a-zA-Z0-9_\-]+\.)?(?:twitter\.com|x\.com|t\.co)", re.IGNORECASE),
        re.compile(r"(?:/status/\d+|/i/status/\d+|t\.co/)", re.IGNORECASE),
    ),
]


def normalize_url(url: str) -> str:
    """Ensure url has http/https protocol and is stripped of whitespace."""
    trimmed = url.strip()
    if not trimmed:
        return ""
    if not trimmed.startswith(("http://", "https://")):
        trimmed = "https://" + trimmed
    return trimmed


def detect_platform(raw_url: str) -> Tuple[PlatformEnum, Optional[str]]:
    """
    Analyzes a URL and identifies which platform it belongs to.
    Returns (PlatformEnum, error_message)
    """
    if not raw_url:
        return PlatformEnum.UNKNOWN, "URL cannot be empty."

    url = normalize_url(raw_url)
    try:
        parsed = urlparse(url)
        hostname = (parsed.hostname or "").lower()
    except Exception:
        return PlatformEnum.UNKNOWN, "Invalid URL format."

    if not hostname:
        return PlatformEnum.UNKNOWN, "Could not determine hostname from URL."

    for platform_enum, host_re, _ in PLATFORM_PATTERNS:
        if host_re.search(url):
            return platform_enum, None

    return PlatformEnum.UNKNOWN, "Unsupported video URL. Please provide a supported platform link."
