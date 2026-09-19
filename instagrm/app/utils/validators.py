import re
from urllib.parse import urlparse, parse_qs, urlunparse
from typing import Optional, Tuple


# Regex patterns matching various Instagram URL formats
INSTAGRAM_PATTERNS = [
    # Reels: /reel/CODE or /reels/CODE
    r"https?://(?:www\.)?instagram\.com/(?:reel|reels)/([A-Za-z0-9_-]+)",
    # Posts: /p/CODE
    r"https?://(?:www\.)?instagram\.com/p/([A-Za-z0-9_-]+)",
    # IGTV: /tv/CODE
    r"https?://(?:www\.)?instagram\.com/tv/([A-Za-z0-9_-]+)",
    # Stories: /stories/username/ID
    r"https?://(?:www\.)?instagram\.com/stories/[^/]+/([0-9]+)",
    # Short links: instagr.am/p/CODE or instagr.am/reel/CODE
    r"https?://(?:www\.)?instagr\.am/(?:p|reel)/([A-Za-z0-9_-]+)",
    # Share links: /share/CODE
    r"https?://(?:www\.)?instagram\.com/share/([A-Za-z0-9_-]+)",
]


def _normalize_scheme(url: str) -> str:
    """Ensures the URL has an http or https scheme."""
    url = url.strip()
    if not (url.startswith("http://") or url.startswith("https://")):
        return f"https://{url}"
    return url


def validate_instagram_url(url: str) -> bool:
    """Check if the provided URL is a recognized Instagram media URL."""
    if not url or not isinstance(url, str):
        return False
    normalized = _normalize_scheme(url)
    return any(re.search(pattern, normalized, re.IGNORECASE) for pattern in INSTAGRAM_PATTERNS)


def extract_instagram_code(url: str) -> Optional[str]:
    """Extracts the unique media shortcode or identifier from the URL."""
    if not url or not isinstance(url, str):
        return None
    normalized = _normalize_scheme(url)
    for pattern in INSTAGRAM_PATTERNS:
        match = re.search(pattern, normalized, re.IGNORECASE)
        if match:
            return match.group(1)
    return None


def clean_instagram_url(url: str) -> str:
    """
    Cleans tracking query parameters (like ?igsh=, ?utm_source=)
    and returns canonical URL for deduplication and caching.
    """
    if not url or not isinstance(url, str):
        return ""
    normalized = _normalize_scheme(url)
    parsed = urlparse(normalized)
    path = parsed.path
    if not path.endswith("/"):
        path += "/"
    return f"https://www.instagram.com{path}"
