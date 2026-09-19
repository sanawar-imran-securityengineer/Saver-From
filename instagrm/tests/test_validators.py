import pytest
from app.utils.validators import (
    validate_instagram_url,
    extract_instagram_code,
    clean_instagram_url
)
from app.utils.formatters import format_duration, format_bytes, format_number


def test_validate_instagram_urls():
    valid_urls = [
        "https://www.instagram.com/reel/C7192xyz/",
        "https://instagram.com/reel/C7192xyz",
        "https://www.instagram.com/p/C7192xyz/",
        "https://www.instagram.com/tv/C7192xyz/",
        "https://www.instagram.com/stories/someuser/1234567890/",
        "https://instagr.am/p/C7192xyz/",
        "https://instagr.am/reel/C7192xyz/",
        "https://www.instagram.com/share/C7192xyz/",
        "www.instagram.com/reel/C7192xyz/",
        "instagram.com/reel/C7192xyz/",
        "https://www.instagram.com/reel/C7192xyz/?igsh=MWQ1ZGUxMzBkMA==",
    ]
    for url in valid_urls:
        assert validate_instagram_url(url) is True, f"Failed for {url}"


def test_invalid_instagram_urls():
    invalid_urls = [
        "",
        None,
        "https://youtube.com/watch?v=123",
        "https://tiktok.com/@user/video/123",
        "https://facebook.com/reel/123",
        "not a url",
        "https://instagram.com/explore/",
    ]
    for url in invalid_urls:
        assert validate_instagram_url(url) is False, f"Should be invalid: {url}"


def test_extract_instagram_code():
    assert extract_instagram_code("https://www.instagram.com/reel/C7192xyz/") == "C7192xyz"
    assert extract_instagram_code("https://instagram.com/p/C_abc123-xyz/") == "C_abc123-xyz"
    assert extract_instagram_code("https://instagr.am/p/C7192xyz/") == "C7192xyz"
    assert extract_instagram_code("instagram.com/reel/C7192xyz/") == "C7192xyz"
    assert extract_instagram_code("invalid_url") is None


def test_clean_instagram_url():
    cleaned = clean_instagram_url("https://www.instagram.com/reel/C7192xyz/?igsh=abc&utm_source=ig_web")
    assert cleaned == "https://www.instagram.com/reel/C7192xyz/"

    cleaned_no_scheme = clean_instagram_url("instagram.com/reel/C7192xyz?utm_source=123")
    assert cleaned_no_scheme == "https://www.instagram.com/reel/C7192xyz/"


def test_formatters():
    assert format_duration(65) == "01:05"
    assert format_duration(3665) == "01:01:05"
    assert format_duration(0) == "00:00"
    assert format_duration(None) == "00:00"

    assert "MB" in format_bytes(15 * 1024 * 1024)
    assert format_bytes(None) == "Unknown"

    assert format_number(1500) == "1.5K"
    assert format_number(2500000) == "2.5M"
    assert format_number(None) == "0"
