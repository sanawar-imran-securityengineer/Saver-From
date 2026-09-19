import asyncio
import json
import logging
import os
import re
import shutil
import subprocess
import time
import uuid
from html import unescape
from pathlib import Path
from typing import Optional, Tuple
from urllib.parse import urlparse, urlencode

import aiofiles
import httpx

from .base import BaseDownloader
from .result import DownloadResult
from .ytdlp_downloader import DownloadError, _format_size
from ..config import settings

logger = logging.getLogger("swiftfetch.threads")

# Realistic browser headers for Meta Threads
_BROWSER_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/128.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
}

_CRAWLER_HEADERS = {
    "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

# Threads GraphQL API headers (mimics Threads iOS app)
_THREADS_API_HEADERS = {
    "User-Agent": "Barcelona 289.0.0.77.109 Android",
    "Accept": "application/json",
    "Accept-Language": "en-US",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "X-IG-App-ID": "238260118697367",
    "X-FB-LSD": "AVqbxe3J_YA",
    "X-ASBD-ID": "129477",
    "Sec-Fetch-Site": "same-origin",
}

QUALITY_HEIGHTS = {
    "360p": 360,
    "720p": 720,
    "1080p": 1080,
}


def _extract_post_id(url: str) -> Optional[str]:
    """
    Extract the Threads post shortcode from a URL.
    Handles: /post/<code>, /t/<code>
    """
    m = re.search(r"/post/([A-Za-z0-9_-]+)", url)
    if m:
        return m.group(1)
    m = re.search(r"/t/([A-Za-z0-9_-]+)", url)
    if m:
        return m.group(1)
    return None


def _shortcode_to_media_id(shortcode: str) -> str:
    """
    Convert an Instagram/Threads shortcode to a numeric media ID.
    Standard base64url → integer mapping used by Instagram.
    """
    alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
    n = 0
    for char in shortcode:
        n = n * 64 + alphabet.index(char)
    return str(n)


def is_threads_url(url: str) -> bool:
    """Check if a URL points to threads.net or threads.com."""
    try:
        parsed = urlparse(url)
        host = (parsed.hostname or "").lower()
        if host.startswith("www."):
            host = host[4:]
        return host in ("threads.net", "threads.com") or host.endswith(".threads.net") or host.endswith(".threads.com")
    except Exception:
        return False


async def resolve_threads_url(url: str) -> str:
    """
    Resolve Threads share/shortlinks (e.g. threads.com/share/ID or threads.net/t/ID)
    to their canonical post URL by following HTTP redirects and reading og:url.
    Returns the resolved URL or the original if resolution fails.
    """
    if not url or not is_threads_url(url):
        return url

    # If it is already a direct post URL without /share/, no need to resolve
    if "/post/" in url and "/share/" not in url:
        return url

    try:
        async with httpx.AsyncClient(
            follow_redirects=True,
            timeout=10.0,
            headers=_CRAWLER_HEADERS,
        ) as client:
            resp = await client.get(url)
            final_url = str(resp.url)
            # Check if redirected directly to a post URL
            if "/post/" in final_url and is_threads_url(final_url):
                logger.info(f"Resolved Threads URL {url} → {final_url}")
                return final_url

            # Also check og:url or canonical in HTML
            html = resp.text
            og_match = re.search(r'property=["\']og:url["\']\s+content=["\']([^"\']+)["\']', html)
            if og_match:
                og_url = unescape(og_match.group(1))
                if "/post/" in og_url and is_threads_url(og_url):
                    logger.info(f"Resolved Threads URL via og:url {url} → {og_url}")
                    return og_url

            if is_threads_url(final_url):
                return final_url
    except Exception as e:
        logger.debug(f"Threads URL resolution failed for {url}: {e}")
    return url


class ThreadsDownloader(BaseDownloader):
    """
    Multi-strategy downloader for Meta Threads videos.

    Strategy order:
      1. Instagram internal media API (shortcode → media_id)
      2. Threads GraphQL API (iOS app headers)
      3. oEmbed endpoint
      4. HTML scraping with multiple User-Agent variants
    """

    @property
    def name(self) -> str:
        return "threads-direct"

    # ------------------------------------------------------------------
    # Strategy 1: Instagram/Threads internal API
    # ------------------------------------------------------------------
    async def _fetch_via_api(self, url: str, shortcode: str) -> Optional[dict]:
        """Fetch video info via Instagram internal media info endpoint."""
        try:
            media_id = _shortcode_to_media_id(shortcode)
        except (ValueError, AttributeError):
            return None

        api_url = f"https://www.instagram.com/api/v1/media/{media_id}/info/"
        headers = {
            "User-Agent": (
                "Instagram 269.0.0.18.75 Android (26/8.0.0; 480dpi; "
                "1080x1920; OnePlus; 6T Dev; devitron; qcom; en_US; 314665256)"
            ),
            "Accept": "*/*",
            "Accept-Language": "en-US",
            "X-IG-App-ID": "567067343352427",
            "X-IG-WWW-Claim": "0",
        }
        try:
            async with httpx.AsyncClient(
                follow_redirects=True, timeout=12.0, headers=headers
            ) as client:
                resp = await client.get(api_url)
                if resp.status_code == 200:
                    data = resp.json()
                    return self._parse_api_response(data, url)
        except Exception as e:
            logger.debug(f"Instagram API endpoint failed: {e}")

        # Endpoint 2: Threads GraphQL API
        threads_api = "https://www.threads.net/api/graphql"
        variables = json.dumps({"postID": shortcode})
        payload = urlencode({
            "lsd": "AVqbxe3J_YA",
            "variables": variables,
            "doc_id": "6232751443445612",
        })
        try:
            async with httpx.AsyncClient(
                follow_redirects=True, timeout=12.0
            ) as client:
                resp = await client.post(
                    threads_api,
                    content=payload,
                    headers=_THREADS_API_HEADERS,
                )
                if resp.status_code == 200:
                    data = resp.json()
                    extracted = self._parse_graphql_response(data, url)
                    if extracted:
                        return extracted
        except Exception as e:
            logger.debug(f"Threads GraphQL API failed: {e}")

        return None

    def _parse_api_response(self, data: dict, original_url: str) -> Optional[dict]:
        """Parse Instagram /media/{id}/info/ API response."""
        try:
            items = data.get("items") or []
            if not items:
                return None
            item = items[0]
            video_versions = item.get("video_versions") or []
            image_versions = (item.get("image_versions2") or {}).get("candidates") or []

            video_url = None
            if video_versions:
                best = max(video_versions, key=lambda v: (v.get("width", 0) * v.get("height", 0)))
                video_url = best.get("url")

            thumbnail = None
            if image_versions:
                best_img = max(image_versions, key=lambda i: (i.get("width", 0) * i.get("height", 0)))
                thumbnail = best_img.get("url")

            if not video_url:
                return None

            caption_data = item.get("caption") or {}
            description = caption_data.get("text", "") if isinstance(caption_data, dict) else ""
            user = item.get("user") or {}
            uploader = user.get("username") or user.get("full_name") or "Threads User"

            all_versions = [
                {
                    "url": unescape(str(v.get("url", "")).replace(r"\u0026", "&")),
                    "width": v.get("width", 0),
                    "height": v.get("height", 0),
                    "type": v.get("type"),
                }
                for v in video_versions if v.get("url")
            ]

            return {
                "title": f"Threads video by @{uploader}",
                "uploader": uploader,
                "duration": item.get("video_duration"),
                "view_count": item.get("view_count"),
                "like_count": item.get("like_count"),
                "thumbnail": thumbnail,
                "webpage_url": original_url,
                "description": description[:200],
                "video_url": video_url,
                "video_versions": all_versions,
            }
        except Exception as e:
            logger.debug(f"API response parse error: {e}")
            return None

    def _parse_graphql_response(self, data: dict, original_url: str) -> Optional[dict]:
        """Parse Threads GraphQL API response."""
        try:
            video_versions = []
            self._extract_videos_from_json(data, video_versions)
            if not video_versions:
                return None
            video_versions.sort(
                key=lambda v: (v.get("width", 0) * v.get("height", 0)), reverse=True
            )
            video_url = video_versions[0].get("url")
            if not video_url:
                return None
            return {
                "title": "Threads Video",
                "uploader": "Threads User",
                "duration": None,
                "view_count": None,
                "like_count": None,
                "thumbnail": None,
                "webpage_url": original_url,
                "description": "",
                "video_url": video_url,
                "video_versions": video_versions,
            }
        except Exception as e:
            logger.debug(f"GraphQL response parse error: {e}")
            return None

    # ------------------------------------------------------------------
    # Strategy 2: oEmbed
    # ------------------------------------------------------------------
    async def _fetch_via_oembed(self, url: str) -> Optional[dict]:
        """Try Threads oEmbed endpoint."""
        oembed_url = f"https://www.threads.net/oembed/?url={url}"
        try:
            async with httpx.AsyncClient(
                follow_redirects=True, timeout=10.0, headers=_BROWSER_HEADERS
            ) as client:
                resp = await client.get(oembed_url)
                if resp.status_code == 200:
                    data = resp.json()
                    html_content = data.get("html", "")
                    thumbnail = data.get("thumbnail_url")
                    author = data.get("author_name", "Threads User")
                    title = data.get("title") or f"Threads video by {author}"
                    video_url = None
                    mp4_matches = re.findall(
                        r'https?://[^\s"\'<>]+\.mp4[^\s"\'<>]*', html_content
                    )
                    for raw_mp4 in mp4_matches:
                        cleaned = unescape(raw_mp4.replace(r"\u0026", "&").replace("&amp;", "&"))
                        if "cdninstagram.com" in cleaned or "fbcdn.net" in cleaned:
                            video_url = cleaned
                            break
                    if video_url:
                        return {
                            "title": title,
                            "uploader": author,
                            "duration": None,
                            "view_count": None,
                            "like_count": None,
                            "thumbnail": thumbnail,
                            "webpage_url": url,
                            "description": "",
                            "video_url": video_url,
                            "video_versions": [],
                        }
        except Exception as e:
            logger.debug(f"oEmbed fetch failed: {e}")
        return None

    # ------------------------------------------------------------------
    # Strategy 3: HTML scraping (multiple UA variants)
    # ------------------------------------------------------------------
    async def _fetch_page(self, url: str) -> Tuple[str, dict]:
        """Fetch Threads page with multiple header strategies."""
        header_variants = [
            _CRAWLER_HEADERS,
            {
                "User-Agent": (
                    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) "
                    "AppleWebKit/605.1.15 (KHTML, like Gecko) "
                    "Version/17.0 Mobile/15E148 Safari/604.1"
                ),
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
            },
            _BROWSER_HEADERS,
            {
                "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
        ]

        last_html = ""
        last_meta: dict = {}
        async with httpx.AsyncClient(follow_redirects=True, timeout=15.0) as client:
            for headers in header_variants:
                try:
                    resp = await client.get(url, headers=headers)
                    if resp.status_code == 200:
                        html = resp.text
                        meta = self._parse_html_metadata(html, url)
                        last_html, last_meta = html, meta
                        if meta.get("video_url"):
                            return html, meta
                except Exception as e:
                    logger.debug(f"Header variant fetch error: {e}")
                    continue

        if last_meta:
            return last_html, last_meta

        raise DownloadError("Could not retrieve Threads post page.")

    def _parse_html_metadata(self, html: str, original_url: str) -> dict:
        """Parse OpenGraph meta tags and embedded JSON for media details."""
        # 1. OpenGraph Video
        video_url = None
        for prop in ["og:video", "og:video:secure_url", "twitter:player:stream"]:
            m = re.search(rf'<meta\s+(?:property|name)=["\']{re.escape(prop)}["\']\s+content=["\']([^"\']+)["\']', html, re.I)
            if not m:
                m = re.search(rf'<meta\s+content=["\']([^"\']+)["\']\s+(?:property|name)=["\']{re.escape(prop)}["\']', html, re.I)
            if m:
                video_url = unescape(m.group(1).replace("&amp;", "&"))
                break

        # 2. Title
        title = "Threads Video"
        m_title = re.search(r'<meta\s+(?:property|name)=["\']og:title["\']\s+content=["\']([^"\']+)["\']', html, re.I)
        if not m_title:
            m_title = re.search(r'<meta\s+content=["\']([^"\']+)["\']\s+(?:property|name)=["\']og:title["\']', html, re.I)
        if m_title:
            title = unescape(m_title.group(1))

        # 3. Description
        desc = ""
        m_desc = re.search(r'<meta\s+(?:property|name)=["\']og:description["\']\s+content=["\']([^"\']+)["\']', html, re.I)
        if not m_desc:
            m_desc = re.search(r'<meta\s+content=["\']([^"\']+)["\']\s+(?:property|name)=["\']og:description["\']', html, re.I)
        if m_desc:
            desc = unescape(m_desc.group(1))

        # 4. Thumbnail Image
        thumbnail = None
        m_img = re.search(r'<meta\s+(?:property|name)=["\']og:image["\']\s+content=["\']([^"\']+)["\']', html, re.I)
        if not m_img:
            m_img = re.search(r'<meta\s+content=["\']([^"\']+)["\']\s+(?:property|name)=["\']og:image["\']', html, re.I)
        if m_img:
            thumbnail = unescape(m_img.group(1).replace("&amp;", "&"))

        # 5. Look in JSON scripts for video_versions or direct video URLs
        video_versions = []
        json_scripts = re.findall(r'<script[^>]*type=["\']application/json["\'][^>]*>(.*?)</script>', html, re.DOTALL)
        for script_content in json_scripts:
            if "video_versions" in script_content or "video_url" in script_content:
                try:
                    data = json.loads(script_content)
                    self._extract_videos_from_json(data, video_versions)
                except Exception:
                    pass

        # 6. __NEXT_DATA__ JSON (Next.js SSR payload)
        next_data_match = re.search(
            r'<script[^>]*id=["\']__NEXT_DATA__["\'][^>]*>(.*?)</script>', html, re.DOTALL
        )
        if next_data_match:
            try:
                data = json.loads(next_data_match.group(1))
                self._extract_videos_from_json(data, video_versions)
            except Exception:
                pass

        # 7. Pick best quality from video_versions
        if video_versions:
            video_versions.sort(key=lambda v: (v.get("width", 0) * v.get("height", 0)), reverse=True)
            if not video_url or video_versions[0].get("url"):
                best = video_versions[0]
                if best.get("url"):
                    video_url = best["url"]

        # 8. Fallback regex search for direct MP4 links on Instagram CDN
        if not video_url:
            mp4_matches = re.findall(r'https?://[^\s"\'\'<>]+\.mp4[^\s"\'\'<>]*', html)
            for raw_mp4 in mp4_matches:
                cleaned = unescape(raw_mp4.replace(r"\u0026", "&").replace("&amp;", "&"))
                if "cdninstagram.com" in cleaned or "fbcdn.net" in cleaned:
                    video_url = cleaned
                    break

        # 9. Escaped unicode MP4 URLs (e.g. https:\u002F\u002Fscontent...)
        if not video_url:
            escaped_matches = re.findall(
                r'https?:\\u002F\\u002F[^"\'\\ ]+?\.mp4[^"\'\\ ]*', html
            )
            for raw in escaped_matches:
                cleaned = raw.replace("\\u002F", "/").replace("\\u0026", "&")
                if "cdninstagram.com" in cleaned or "fbcdn.net" in cleaned:
                    video_url = cleaned
                    break

        # Extract uploader from title or description
        uploader = "Threads User"
        if "(@" in title:
            try:
                uploader = title.split("(@")[1].split(")")[0]
            except Exception:
                pass
        elif "on Threads" in title:
            uploader = title.split("on Threads")[0].strip()

        return {
            "title": title or "Threads Video",
            "uploader": uploader,
            "duration": None,
            "view_count": None,
            "like_count": None,
            "thumbnail": thumbnail,
            "webpage_url": original_url,
            "description": (desc or "")[:200],
            "video_url": video_url,
            "video_versions": video_versions,
        }

    def _extract_videos_from_json(self, obj, results: list):
        """Recursively inspect parsed JSON for video_versions, playable URLs, or video_url."""
        if isinstance(obj, dict):
            if "video_versions" in obj and isinstance(obj["video_versions"], list):
                for item in obj["video_versions"]:
                    if isinstance(item, dict) and item.get("url"):
                        results.append({
                            "url": unescape(str(item["url"]).replace(r"\u0026", "&")),
                            "width": item.get("width", 0),
                            "height": item.get("height", 0),
                            "type": item.get("type"),
                        })
            # Playable HD/SD URLs common in Facebook/Instagram/Threads GraphQL responses
            for hd_key in ("playable_url_quality_hd", "browser_native_hd_url"):
                if hd_key in obj and isinstance(obj[hd_key], str) and obj[hd_key].strip():
                    results.append({
                        "url": unescape(obj[hd_key].replace(r"\u0026", "&")),
                        "width": 1920,
                        "height": 1080,
                        "type": 1080,
                    })
            for sd_key in ("playable_url", "browser_native_sd_url"):
                if sd_key in obj and isinstance(obj[sd_key], str) and obj[sd_key].strip():
                    results.append({
                        "url": unescape(obj[sd_key].replace(r"\u0026", "&")),
                        "width": 1280,
                        "height": 720,
                        "type": 720,
                    })
            if "video_url" in obj and isinstance(obj["video_url"], str) and obj["video_url"].strip():
                results.append({
                    "url": unescape(obj["video_url"].replace(r"\u0026", "&")),
                    "width": obj.get("original_width", 0) or 1080,
                    "height": obj.get("original_height", 0) or 1080,
                    "type": 101,
                })
            for v in obj.values():
                self._extract_videos_from_json(v, results)
        elif isinstance(obj, list):
            for item in obj:
                self._extract_videos_from_json(item, results)

    # ------------------------------------------------------------------
    # Orchestrator: run all strategies in order
    # ------------------------------------------------------------------
    async def _get_meta(self, url: str) -> dict:
        """
        Run all strategies in order and return the first successful metadata dict.
        Raises DownloadError if all strategies fail.
        """
        shortcode = _extract_post_id(url)

        # Strategy 1: Internal API (if we have a shortcode)
        if shortcode:
            try:
                meta = await self._fetch_via_api(url, shortcode)
                if meta and meta.get("video_url"):
                    logger.info("Threads: got video via internal API")
                    return meta
            except Exception as e:
                logger.debug(f"API strategy failed: {e}")

        # Strategy 2: oEmbed
        try:
            meta = await self._fetch_via_oembed(url)
            if meta and meta.get("video_url"):
                logger.info("Threads: got video via oEmbed")
                return meta
        except Exception as e:
            logger.debug(f"oEmbed strategy failed: {e}")

        # Strategy 3: HTML scraping
        try:
            _, meta = await self._fetch_page(url)
            if meta.get("video_url"):
                logger.info("Threads: got video via HTML scraping")
                return meta
        except Exception as e:
            logger.debug(f"HTML scraping strategy failed: {e}")

        raise DownloadError(
            "No video found in this Threads post. "
            "The post may be private, contain no video, or Threads blocked the request."
        )

    async def extract_info(self, url: str) -> dict:
        """Async fast metadata extraction for /api/info."""
        if not is_threads_url(url):
            raise DownloadError("Not a Threads URL")
        url = await resolve_threads_url(url)
        meta = await self._get_meta(url)
        return {
            "title": meta["title"],
            "uploader": meta["uploader"],
            "duration": meta.get("duration"),
            "view_count": meta.get("view_count"),
            "like_count": meta.get("like_count"),
            "thumbnail": meta.get("thumbnail"),
            "webpage_url": meta.get("webpage_url", url),
            "description": meta.get("description", ""),
        }

    async def download(self, url: str, output_directory: str, option: str) -> DownloadResult:
        """Download video directly from Threads CDN."""
        if not is_threads_url(url):
            raise DownloadError("Not a Threads URL")
        url = await resolve_threads_url(url)
        meta = await self._get_meta(url)
        video_url = meta.get("video_url")
        video_versions = meta.get("video_versions") or []

        # If user selected a specific quality, pick the best matching version if available
        target_height = QUALITY_HEIGHTS.get(option, 1080)
        if video_versions and option != "mp3":
            # Match closest height <= target_height, or lowest available
            suitable = [v for v in video_versions if v.get("height", 0) <= target_height]
            if suitable:
                suitable.sort(key=lambda v: v.get("height", 0), reverse=True)
                video_url = suitable[0]["url"]
            elif video_versions:
                video_url = video_versions[0]["url"]

        if not video_url:
            raise DownloadError("No video download stream available for this post.")

        file_id = str(uuid.uuid4())
        downloads_path = Path(output_directory)
        downloads_path.mkdir(parents=True, exist_ok=True)

        temp_mp4_path = downloads_path / f"{file_id}.mp4"

        # Stream download directly to file via httpx
        dl_headers = {
            "User-Agent": _BROWSER_HEADERS["User-Agent"],
            "Accept": "*/*",
            "Referer": "https://www.threads.net/",
        }

        async with httpx.AsyncClient(timeout=60.0, follow_redirects=True) as client:
            async with client.stream("GET", video_url, headers=dl_headers) as response:
                if response.status_code not in (200, 206):
                    raise DownloadError(f"CDN download failed with status {response.status_code}")

                with open(temp_mp4_path, "wb") as f:
                    async for chunk in response.aiter_bytes(chunk_size=65536):
                        f.write(chunk)

        if not temp_mp4_path.exists() or temp_mp4_path.stat().st_size == 0:
            raise DownloadError("Downloaded file is empty or missing.")

        # Convert to MP3 if requested
        if option == "mp3":
            final_path = downloads_path / f"{file_id}.mp3"
            ffmpeg_exe = shutil.which("ffmpeg") or "ffmpeg"
            cmd = [
                ffmpeg_exe,
                "-y",
                "-i", str(temp_mp4_path),
                "-vn",
                "-acodec", "libmp3lame",
                "-b:a", "192k",
                str(final_path),
            ]
            proc = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            await proc.wait()

            # Clean up temp mp4
            try:
                temp_mp4_path.unlink(missing_ok=True)
            except Exception:
                pass

            if not final_path.exists() or final_path.stat().st_size == 0:
                raise DownloadError("MP3 audio conversion failed.")

            file_size_str = _format_size(final_path.stat().st_size)
            return DownloadResult(
                title=meta["title"],
                filename=final_path.name,
                option_requested=option,
                quality_selected="mp3",
                downloader_used=self.name,
                download_url=f"/api/file/{final_path.name}",
                file_size=file_size_str,
            )

        # Normal MP4
        file_size_str = _format_size(temp_mp4_path.stat().st_size)
        return DownloadResult(
            title=meta["title"],
            filename=temp_mp4_path.name,
            option_requested=option,
            quality_selected=option,
            downloader_used=self.name,
            download_url=f"/api/file/{temp_mp4_path.name}",
            file_size=file_size_str,
        )
