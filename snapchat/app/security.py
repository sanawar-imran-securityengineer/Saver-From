import logging
import json
import re
from pathlib import Path
from typing import Optional

from .config import settings

logger = logging.getLogger("swiftfetch")


def setup_logging() -> None:
    handler = logging.StreamHandler()
    handler.setFormatter(
        logging.Formatter(
            fmt='{"time":"%(asctime)s","level":"%(levelname)s","logger":"%(name)s","message":"%(message)s"}',
            datefmt="%Y-%m-%dT%H:%M:%S",
        )
    )
    root = logging.getLogger()
    root.setLevel(logging.INFO)
    if not root.handlers:
        root.addHandler(handler)


SENSITIVE_PATTERNS = [
    re.compile(r"(?:password|passwd|pwd|token|secret|key|cookie|auth)[=:]?[^\s&]*", re.IGNORECASE),
    re.compile(r"ai=[^&]+", re.IGNORECASE),
    re.compile(r"googleapis_key=[^&]+", re.IGNORECASE),
]


def sanitize_url(url: str) -> str:
    """Remove sensitive-looking query parameters from a URL before logging."""
    safe = url
    for pat in SENSITIVE_PATTERNS:
        safe = pat.sub("[REDACTED]", safe)
    return safe


def secure_log(message: str, url: Optional[str] = None, **kwargs) -> None:
    """Log a structured message, sanitizing any URL that may contain secrets."""
    extra = {}
    if url:
        extra["url"] = sanitize_url(url)
    extra.update({k: v for k, v in kwargs.items() if k not in ("password", "token", "secret", "cookie")})
    logger.info(json.dumps({"message": message, **extra}))


def validate_filename(filename: str) -> bool:
    """Validate that a filename is server-generated and safe to serve."""
    if not filename or len(filename) > 255:
        return False
    if filename.startswith(".") or "/" in filename or "\\" in filename:
        return False
    if ".." in filename:
        return False
    allowed_extensions = {".mp4", ".mp3"}
    suffix = Path(filename).suffix.lower()
    if suffix not in allowed_extensions:
        return False
    stem = Path(filename).stem
    if not re.match(r"^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$", stem):
        return False
    return True


def resolve_safe_path(filename: str, base_dir: Path) -> Optional[Path]:
    """Resolve a filename inside base_dir and confirm it stays inside."""
    if not validate_filename(filename):
        return None
    base_resolved = base_dir.resolve()
    target = (base_dir / filename).resolve()
    try:
        target.relative_to(base_resolved)
    except ValueError:
        return None
    return target
