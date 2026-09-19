import re
from urllib.parse import urlparse, parse_qs
from typing import Optional, Tuple
from ..config import settings

REDDIT_HOSTS = {"reddit.com", "redd.it", "v.redd.it", "old.reddit.com", "sh.reddit.com", "m.reddit.com"}
TWITTER_HOSTS = {"twitter.com", "x.com", "mobile.twitter.com"}
YOUTUBE_HOSTS = {"youtube.com", "youtu.be"}
BILIBILI_HOSTS = {"bilibili.com", "b23.tv"}
SNAPCHAT_HOSTS = {"snapchat.com", "story.snapchat.com", "t.snapchat.com"}
SUPPORTED_HOSTS = REDDIT_HOSTS | TWITTER_HOSTS | SNAPCHAT_HOSTS | BILIBILI_HOSTS | YOUTUBE_HOSTS

# Patterns
_BV_RE = re.compile(r'^BV[1-9A-HJ-NP-Za-km-z]{10}$')
_AV_RE = re.compile(r'^av(\d+)$', re.IGNORECASE)
import httpx

_TWEET_STATUS_RE = re.compile(r'/(?:[^/]+/status/|i/status/)(\d+)', re.IGNORECASE)
_REDDIT_POST_RE = re.compile(r'/(?:r/[^/]+/comments/|comments/|user/[^/]+/comments/|r/[^/]+/s/|s/)([a-zA-Z0-9_-]+)', re.IGNORECASE)


def _validate_reddit_url(parsed, host: str) -> Tuple[bool, Optional[str]]:
    """Validate a Reddit video or post URL."""
    path = parsed.path.strip("/")
    if not path:
        return False, "Please enter a valid Reddit post URL."
    if host in {"redd.it", "v.redd.it"}:
        parts = path.split("/")
        if parts[0]:
            return True, None
        return False, "Please enter a valid Reddit video link."
    if _REDDIT_POST_RE.search(parsed.path):
        return True, None
    # Subreddit root with any path segments (e.g. /r/videos/s/... or /r/videos/comments)
    segments = [s for s in path.split("/") if s]
    if len(segments) >= 2 and segments[0] in ("r", "user", "comments"):
        return True, None
    return False, "Please enter a valid Reddit post URL (e.g. reddit.com/r/videos/comments/...)."


async def resolve_reddit_url(url: str) -> str:
    """Resolve Reddit share links (/s/) to canonical post URLs (/comments/)."""
    if not url:
        return ""
    if "/s/" in url:
        try:
            headers = {
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/128.0.0.0 Safari/537.36"
                ),
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            }
            async with httpx.AsyncClient(follow_redirects=False, headers=headers, timeout=8.0) as client:
                resp = await client.get(url)
                loc = resp.headers.get("location")
                if loc:
                    if loc.startswith("/"):
                        loc = f"https://www.reddit.com{loc}"
                    if "/comments/" in loc:
                        return loc

            async with httpx.AsyncClient(follow_redirects=True, headers=headers, timeout=8.0) as client:
                resp = await client.get(url)
                final_url = str(resp.url)
                if "/comments/" in final_url:
                    return final_url
        except Exception:
            pass
    elif "redd.it" in url and "v.redd.it" not in url:
        parsed = urlparse(url)
        clean_path = parsed.path.strip("/")
        if clean_path and "/" not in clean_path:
            return f"https://www.reddit.com/comments/{clean_path}"
    return url


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
        "reddit.com", "www.reddit.com", "old.reddit.com", "sh.reddit.com", "m.reddit.com",
        "redd.it", "v.redd.it",
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
    """Validate a Reddit, Twitter/X, YouTube, Snapchat, or Bilibili URL.

    Returns (True, None) if valid, (False, error_message) otherwise.
    """
    if not url or not url.strip():
        return False, "Please enter a Reddit video URL."

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
        return False, "This URL is not supported. Please enter a Reddit or supported video URL."

    # ── Reddit ─────────────────────────────────────────────────────────────────
    if host in REDDIT_HOSTS:
        return _validate_reddit_url(parsed, host)

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
