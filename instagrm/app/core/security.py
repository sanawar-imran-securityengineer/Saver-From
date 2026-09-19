import html
import re
from typing import Optional


def sanitize_input(text: Optional[str]) -> str:
    """Sanitizes user input to prevent XSS and injection attacks."""
    if not text:
        return ""
    # Strip dangerous HTML entities and trim
    cleaned = html.escape(text.strip())
    # Remove control characters
    return re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", cleaned)


def is_safe_redirect_url(url: str) -> bool:
    """Validates that a URL is a valid http/https scheme and not javascript: or data:."""
    if not url:
        return False
    return url.startswith("http://") or url.startswith("https://")
