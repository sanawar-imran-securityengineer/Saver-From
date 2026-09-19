import asyncio
import os
import tempfile
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, Any, Optional, List
import yt_dlp
from yt_dlp.networking.impersonate import ImpersonateTarget
import structlog

from app.config import settings
from app.core.exceptions import (
    MediaNotFoundError,
    InstagramRateLimitError,
    UpstreamExtractionError
)
from app.utils.formatters import format_bytes, format_duration

logger = structlog.get_logger()

# Dedicated ThreadPool for CPU/network-bound yt-dlp extractions
_executor = ThreadPoolExecutor(max_workers=30)

YDL_BASE_OPTS = {
    "quiet": True,
    "no_warnings": True,
    "no_color": True,
    "no_check_certificate": True,
    "socket_timeout": settings.YDL_TIMEOUT,
    "retries": settings.YDL_RETRIES,
    "extractor_retries": 3,
    "extract_flat": False,
    "prefer_free_formats": False,
    "skip_download": True,
    "http_headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "*/*",
    }
}


class InstagramService:
    """High-performance Instagram media extractor powered by yt-dlp with session & carousel support."""

    @staticmethod
    def _create_temp_cookiefile(session_id: str) -> str:
        """Creates a temporary Netscape cookiefile for Instagram session authentication."""
        temp = tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".txt")
        temp.write("# Netscape HTTP Cookie File\n")
        temp.write(f".instagram.com\tTRUE\t/\tTRUE\t2147483647\tsessionid\t{session_id.strip()}\n")
        temp.close()
        return temp.name

    @classmethod
    def _extract_sync(cls, url: str, session_id: Optional[str] = None, options: Optional[dict] = None) -> Dict[str, Any]:
        opts = YDL_BASE_OPTS.copy()
        temp_cookie_path = None

        # 1. Cookie Authentication Configuration
        effective_session = session_id or settings.INSTAGRAM_SESSIONID
        if effective_session and effective_session.strip():
            temp_cookie_path = cls._create_temp_cookiefile(effective_session)
            opts["cookiefile"] = temp_cookie_path
        elif settings.INSTAGRAM_COOKIES_PATH and os.path.exists(settings.INSTAGRAM_COOKIES_PATH):
            opts["cookiefile"] = settings.INSTAGRAM_COOKIES_PATH

        if options:
            opts.update(options)

        try:
            with yt_dlp.YoutubeDL(opts) as ydl:
                info = ydl.extract_info(url, download=False)
                if not info:
                    raise MediaNotFoundError("No media stream found for this URL")
                return info
        except yt_dlp.utils.DownloadError as e:
            err_msg = str(e).lower()
            logger.error("ytdlp_download_error", url=url, error=str(e))
            if "empty media response" in err_msg or "login" in err_msg or "private" in err_msg:
                raise MediaNotFoundError(
                    "Instagram requires login verification for this content. "
                    "Please configure your Instagram Session ID in Settings (⚙️) or provide another public link."
                )
            elif "not found" in err_msg or "404" in err_msg:
                raise MediaNotFoundError("The requested Instagram post does not exist or was removed")
            elif "rate-limit" in err_msg or "429" in err_msg or "too many requests" in err_msg:
                raise InstagramRateLimitError("Instagram rate limit reached. Please try again later.")
            raise UpstreamExtractionError(f"Extraction failed: {str(e)}")
        except Exception as e:
            logger.error("ytdlp_unexpected_error", url=url, error=str(e))
            raise UpstreamExtractionError(f"Unexpected extraction error: {str(e)}")
        finally:
            if temp_cookie_path and os.path.exists(temp_cookie_path):
                try:
                    os.remove(temp_cookie_path)
                except Exception:
                    pass

    async def extract_media_info(self, url: str, session_id: Optional[str] = None) -> Dict[str, Any]:
        """Runs yt-dlp in a managed threadpool asynchronously."""
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(_executor, self._extract_sync, url, session_id)

    def parse_formats(self, info: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Parses and ranks available media formats (HD, SD, audio, photo, etc.)."""
        formats_list: List[Dict[str, Any]] = []
        raw_formats = info.get("formats", [])

        # Direct single URL check if formats list is empty (e.g. Photo or direct single stream)
        if not raw_formats and info.get("url"):
            is_video = bool(info.get("duration") or (info.get("vcodec") and info.get("vcodec") != "none"))
            ext = info.get("ext") or ("mp4" if is_video else "jpg")
            formats_list.append({
                "format_id": "direct",
                "format_note": "HD Video" if is_video else "High Resolution Photo",
                "resolution": f"{info.get('width', 'HD')}x{info.get('height', '')}",
                "ext": ext,
                "filesize": info.get("filesize") or info.get("filesize_approx"),
                "filesize_formatted": format_bytes(info.get("filesize") or info.get("filesize_approx")),
                "url": info.get("url"),
                "has_audio": is_video,
                "has_video": is_video,
                "is_progressive": is_video,
            })
            return formats_list

        for f in raw_formats:
            direct_url = f.get("url")
            if not direct_url:
                continue

            vcodec = f.get("vcodec")
            acodec = f.get("acodec")
            ext = f.get("ext", "mp4")
            format_id = str(f.get("format_id", ""))
            url_str = direct_url.lower()

            # Detect progressive combined media (both video & audio)
            # In yt-dlp, progressive formats (like format_id '1', '2', '0') often have vcodec=None and acodec=None
            is_progressive = "progressive" in url_str or (ext == "mp4" and vcodec is None and acodec is None)

            # Determine has_video
            if vcodec == "none":
                has_video = False
            elif vcodec is not None:
                has_video = True
            else:
                has_video = is_progressive or ext in ("mp4", "webm")

            # Determine has_audio
            if acodec == "none":
                has_audio = False
            elif acodec is not None:
                has_audio = True
            else:
                has_audio = is_progressive or ext in ("mp4", "m4a", "mp3")

            # Skip entries with neither video nor audio
            if not has_video and not has_audio:
                continue

            width = f.get("width")
            height = f.get("height")
            if width and height:
                res = f"{width}x{height}"
            elif f.get("resolution") and f.get("resolution") != "None":
                res = f.get("resolution")
            elif "1080" in url_str:
                res = "1080p (Full HD)"
            elif "720" in url_str:
                res = "720p (HD)"
            elif "480" in url_str:
                res = "480p (SD)"
            elif has_video:
                res = "HD Video"
            else:
                res = "Audio only"

            filesize = f.get("filesize") or f.get("filesize_approx")

            note = f.get("format_note")
            if not note:
                if has_video and has_audio:
                    note = "Full Video (with Sound)"
                elif has_video:
                    note = "Video Only"
                elif has_audio:
                    note = "Audio Only"
                else:
                    note = "Media"

            formats_list.append({
                "format_id": format_id or "default",
                "format_note": note,
                "resolution": res,
                "ext": ext,
                "filesize": filesize,
                "filesize_formatted": format_bytes(filesize),
                "url": direct_url,
                "has_audio": has_audio,
                "has_video": has_video,
                "is_progressive": is_progressive or (has_video and has_audio),
            })

        # Sort so that complete formats (video + audio) are strictly prioritized first
        formats_list.sort(
            key=lambda x: (
                2 if x["has_video"] and x["has_audio"] else (1 if x["has_video"] else 0),
                x.get("filesize") or 0
            ),
            reverse=True
        )

        return formats_list

    def select_best_url(self, info: Dict[str, Any], quality: str = "best", format_ext: str = "mp4") -> str:
        """
        Selects the best playable media URL.
        CRITICAL: For video downloads, ALWAYS prioritizes format with BOTH video AND audio.
        Never returns audio-only or video-without-audio when complete video is available.
        """
        formats = self.parse_formats(info)
        if not formats:
            return info.get("url", "")

        # 1. Primary choice: Formats with BOTH video and audio (progressive)
        full_videos = [f for f in formats if f.get("has_video") and f.get("has_audio")]
        if full_videos:
            if quality != "best":
                for f in full_videos:
                    if quality in str(f.get("resolution", "")) or quality in str(f.get("format_note", "")):
                        return f["url"]
            return full_videos[0]["url"]

        # 2. Fallback to top-level URL if present
        if info.get("url"):
            return info["url"]

        # 3. Fallback to any video-bearing format
        video_only = [f for f in formats if f.get("has_video")]
        if video_only:
            return video_only[0]["url"]

        return formats[0]["url"]

    def extract_carousel_items(self, info: Dict[str, Any], base_url: str = "") -> List[Dict[str, Any]]:
        """Parses multi-item carousel/playlist entries."""
        items: List[Dict[str, Any]] = []
        entries = info.get("entries") or info.get("carousel_media") or []
        for idx, entry in enumerate(entries, start=1):
            if not isinstance(entry, dict):
                continue
            entry_url = self.select_best_url(entry) if entry.get("formats") else (entry.get("url") or "")
            entry_thumb = entry.get("thumbnail") or entry.get("display_url") or entry_url
            is_vid = bool(entry.get("duration") or entry.get("vcodec", "none") != "none" or "mp4" in entry_url)
            items.append({
                "index": idx,
                "type": "video" if is_vid else "photo",
                "direct_url": entry_url,
                "thumbnail": entry_thumb,
                "title": f"Slide #{idx}",
                "ext": "mp4" if is_vid else "jpg",
                "width": entry.get("width"),
                "height": entry.get("height")
            })
        return items


instagram_service = InstagramService()
