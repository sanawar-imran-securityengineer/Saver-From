import re
from urllib.parse import urlparse, parse_qs
from typing import Optional, Tuple
from ..config import settings

TWITTER_HOSTS = {"twitter.com", "x.com", "mobile.twitter.com"}
YOUTUBE_HOSTS = {"youtube.com", "youtu.be"}
BILIBILI_HOSTS = {"bilibili.com", "b23.tv"}
SNAPCHAT_HOSTS = {"snapchat.com", "story.snapchat.com", "t.snapchat.com"}
SUPPORTED_HOSTS = TWITTER_HOSTS | SNAPCHAT_HOSTS | BILIBILI_HOSTS | YOUTUBE_HOSTS

# Bilibili BV and AV id patterns
_BV_RE = re.compile(r'^BV[1-9A-HJ-NP-Za-km-z]{10}$')
_AV_RE = re.compile(r'^av(\d+)$', re.IGNORECASE)
_TWEET_STATUS_RE = re.compile(r'/(?:[^/]+/status/|i/status/)(\d+)', re.IGNORECASE)


def _validate_twitter_url(parsed, host: str) -> Tuple[bool, Optional[str]]:
    """Validate a Twitter/X video or post URL."""
    path = parsed.path
    if not path or not _TWEET_STATUS_RE.search(path):
        return False, "Please enter a valid Twitter/X post URL (e.g. x.com/user/status/...)."
    return True, None


def _validate_snapchat_url(parsed, host: str) -> Tuple[bool, Optional[str]]:
    """Validate a Snapchat video URL."""
    path = parsed.path.strip("/")
    if not path:
        return False, "Please enter a valid Snapchat video URL."
    return True, None


def _validate_bilibili_url(parsed, host: str) -> Tuple[bool, Optional[str]]:
    """Validate a Bilibili video URL."""
    path = parsed.path.rstrip("/")

    # b23.tv short links — accept any non-empty path
    if host == "b23.tv":
        if parsed.path.strip("/"):
            return True, None
        return False, "Please enter a valid Bilibili video URL."

    # bilibili.com/video/BVxxxxxx or bilibili.com/video/avxxxxxx
    if path.startswith("/video/"):
        vid = path[len("/video/"):].split("/")[0]
        if _BV_RE.match(vid) or _AV_RE.match(vid):
            return True, None
        return False, "Please enter a valid Bilibili video URL."

    return False, "This Bilibili URL is not supported. Use a /video/BVxxxx or /video/avxxxx link."


def normalize_url(url: str) -> str:
    """Normalize input URL, handling raw IDs, missing schemes, or share text."""
    if not url:
        return ""
    url = url.strip()
    # Extract URL if surrounded by share text (e.g. from mobile share sheet)
    match = re.search(r'https?://[^\s]+', url)
    if match:
        return match.group(0)
    lower_url = url.lower()
    if lower_url.startswith((
        "twitter.com", "www.twitter.com", "mobile.twitter.com",
        "x.com", "www.x.com",
        "snapchat.com", "www.snapchat.com", "story.snapchat.com", "t.snapchat.com",
        "bilibili.com", "www.bilibili.com", "b23.tv", "youtube.com", "www.youtube.com", "youtu.be"
    )):
        return f"https://{url}"
    # Raw Spotlight ID or partial ID (base64url like 20+ chars)
    if re.match(r'^[A-Za-z0-9_-]{20,}$', url):
        if not url.startswith("W7_") and len(url) >= 45:
            return f"https://www.snapchat.com/spotlight/W7_E{url}"
        return f"https://www.snapchat.com/spotlight/{url}"
    return url


def validate_url(url: str) -> Tuple[bool, Optional[str]]:
    """Validate a Twitter/X, YouTube, Snapchat, or Bilibili URL.

    Returns (True, None) if valid, (False, error_message) otherwise.
    """
    if not url or not url.strip():
        return False, "Please enter a Twitter/X video URL."

    url = url.strip()

    if len(url) > settings.max_url_length:
        return False, "This URL is not supported."

    try:
        parsed = urlparse(url)
    except Exception:
        return False, "Please enter a valid video URL."

    scheme = parsed.scheme.lower()
    if scheme == "https":
        pass
    elif scheme == "http" and settings.allow_http:
        pass
    else:
        return False, "Please enter a valid video URL."

    host = (parsed.hostname or "")
    if host.startswith("www."):
        host = host[4:]

    if host not in SUPPORTED_HOSTS:
        return False, "This URL is not supported. Please enter a Twitter/X or supported video URL."

    # ── Twitter / X ────────────────────────────────────────────────────────────
    if host in TWITTER_HOSTS:
        return _validate_twitter_url(parsed, host)

    # ── Snapchat ───────────────────────────────────────────────────────────────
    if host in SNAPCHAT_HOSTS:
        return _validate_snapchat_url(parsed, host)

    # ── Bilibili ───────────────────────────────────────────────────────────────
    if host in BILIBILI_HOSTS:
        return _validate_bilibili_url(parsed, host)

    # ── YouTube ────────────────────────────────────────────────────────────────
    query_params = parse_qs(parsed.query)
    if "list" in query_params:
        return False, "Playlists are not supported."

    if host == "youtu.be":
        video_id = parsed.path.strip("/")
        if not video_id:
            return False, "Please enter a valid YouTube video URL."
        return True, None

    if parsed.path == "/watch":
        video_id = query_params.get("v", [None])[0]
        if not video_id:
            return False, "Please enter a valid YouTube video URL."
        return True, None

    if parsed.path.startswith("/shorts/"):
        parts = parsed.path.strip("/").split("/")
        if len(parts) >= 2 and parts[1]:
            return True, None
        return False, "Please enter a valid YouTube video URL."

    if parsed.path.startswith("/embed/"):
        parts = parsed.path.strip("/").split("/")
        if len(parts) >= 2 and parts[1]:
            return True, None
        return False, "Please enter a valid YouTube video URL."

    return False, "This URL is not supported."
