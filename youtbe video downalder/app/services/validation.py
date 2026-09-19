from urllib.parse import urlparse, parse_qs
from typing import Optional, Tuple
from ..config import settings

SUPPORTED_HOSTS = {"youtube.com", "youtu.be"}


def validate_url(url: str) -> Tuple[bool, Optional[str]]:
    """Validate a YouTube URL.

    Returns (True, None) if valid, (False, error_message) otherwise.
    """
    if not url or not url.strip():
        return False, "Please enter a YouTube URL."

    url = url.strip()

    if len(url) > settings.max_url_length:
        return False, "This URL is not supported."

    try:
        parsed = urlparse(url)
    except Exception:
        return False, "Please enter a valid YouTube video URL."

    scheme = parsed.scheme.lower()
    if scheme == "https":
        pass
    elif scheme == "http" and settings.allow_http:
        pass
    else:
        return False, "Please enter a valid YouTube video URL."

    host = (parsed.hostname or "")
    if host.startswith("www."):
        host = host[4:]
    if host not in SUPPORTED_HOSTS:
        return False, "This URL is not supported."

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
