# SwiftFetch

Fast, secure downloads of publicly accessible YouTube videos in MP4 or MP3 format.

## Features

- **4 output formats**: 360p MP4, 720p MP4, 1080p MP4, MP3 audio
- **No login, no API key, no cookies** — public URLs only
- **Automatic file deletion** — all files removed after 30 minutes
- **Rate limiting** — IP-based request limits
- **Secure filenames** — UUID-generated, path traversal protected
- **Cybersecurity-inspired dark UI** — responsive, mobile-friendly, accessible

## Quick Start

### Ubuntu

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip ffmpeg

git clone <your-repo>
cd youtube-downloader
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

cp .env.example .env

uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Open http://127.0.0.1:8000

Swagger docs: http://127.0.0.1:8000/docs

### Windows

Install Python 3.11+ from python.org, then in PowerShell:

```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Install FFmpeg:

```powershell
choco install ffmpeg
# or
winget install Gyan.FFmpeg
ffmpeg -version
```

```powershell
cp .env.example .env
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### Docker

```bash
docker compose up --build
```

Open http://127.0.0.1:8000

## Using the Downloader

1. Paste a public YouTube video URL (watch, youtu.be, or shorts)
2. Select a format: 360p MP4, 720p MP4, 1080p MP4, or MP3 Audio
3. Click Download Now
4. Download your file when ready (within 30 minutes)

### Supported URL formats

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/shorts/VIDEO_ID`

### API — POST /api/download

**360p MP4:**
```bash
curl -X POST "http://127.0.0.1:8000/api/download" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=VIDEO_ID","option":"360p"}'
```

**720p MP4:**
```bash
curl -X POST "http://127.0.0.1:8000/api/download" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=VIDEO_ID","option":"720p"}'
```

**1080p MP4:**
```bash
curl -X POST "http://127.0.0.1:8000/api/download" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=VIDEO_ID","option":"1080p"}'
```

**MP3 Audio:**
```bash
curl -X POST "http://127.0.0.1:8000/api/download" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=VIDEO_ID","option":"mp3"}'
```

### Example response

```json
{
  "success": true,
  "title": "Example YouTube Video",
  "filename": "7b6fce21-38dd-4cf8-bf36-0ae2c40be9cc.mp4",
  "option_requested": "720p",
  "quality_selected": "720p",
  "downloader_used": "yt-dlp",
  "download_url": "/api/file/7b6fce21-38dd-4cf8-bf36-0ae2c40be9cc.mp4",
  "file_size": "45.2 MB"
}
```

### API — GET /api/file/{filename}

Serves a downloaded file. Only server-generated UUID filenames with `.mp4` or `.mp3` extensions are accepted.

## Running Tests

```bash
pytest tests/ -v
```

## Swagger Documentation

FastAPI auto-generates interactive API docs:

- http://127.0.0.1:8000/docs — Swagger UI
- http://127.0.0.1:8000/redoc — ReDoc

## Project Structure

```
youtube-downloader/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app, routes, middleware
│   ├── models.py            # Pydantic request/response models
│   ├── config.py            # Settings via pydantic-settings
│   ├── security.py          # Filename validation, URL sanitization, logging
│   ├── downloader/
│   │   ├── __init__.py
│   │   ├── base.py          # BaseDownloader abstract class
│   │   ├── result.py        # DownloadResult dataclass
│   │   ├── ytdlp_downloader.py  # YtDlpDownloader implementation
│   │   └── manager.py       # DownloaderManager with concurrency control
│   └── services/
│       ├── __init__.py
│       ├── cleanup.py       # FileCleanupService background task
│       └── validation.py    # URL validation service
├── static/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── tests/
│   ├── test_validation.py
│   ├── test_file_safety.py
│   └── test_fallback.py
├── downloads/
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## Troubleshooting

**FFmpeg not found:** Install it at the OS level — `apt install ffmpeg` (Ubuntu) or `choco install ffmpeg` (Windows). Verify with `ffmpeg -version`.

**Download fails:** YouTube may have changed its extraction system. Try updating yt-dlp: `pip install --upgrade yt-dlp`. Also verify the video is public and not age-restricted.

**Format unavailable:** If a requested quality doesn't exist, SwiftFetch falls back to a lower quality automatically. The actual quality is shown in the response.

**Rate limited:** You've exceeded the per-minute request limit. Wait a minute and try again.

**File not found:** Files are deleted after 30 minutes. Download your file promptly after it's ready.

**413 error:** The file exceeds the maximum size limit. Try a lower quality option.

## Important Notes

### Public content only

SwiftFetch supports **only publicly accessible YouTube videos** that you own or have permission to use. It does not download private, restricted, paid, age-restricted, or unauthorized content.

### No API key or login

SwiftFetch uses yt-dlp for extraction and does not require a YouTube API key, login credentials, cookies, session IDs, or access tokens. No authentication of any kind is used.

### Format fallback

When a requested quality (e.g. 1080p) is unavailable for a video, the format selector falls back to the next available lower quality. The response includes `quality_selected` to indicate the actual quality used.

### Temporary file storage

All downloaded files are stored in a temporary directory and **automatically deleted after 30 minutes** by a background cleanup worker. No files are kept permanently.

### YouTube extractor changes

YouTube periodically updates its video delivery systems. When this happens, downloads may temporarily fail until yt-dlp is updated. Run `pip install --upgrade yt-dlp` to get the latest fixes.

## Legal and Copyright Notice

This service is intended only for publicly accessible content that you own or have permission to use. You are responsible for complying with copyright law, YouTube's Terms of Service, and all applicable laws. Do not download private, restricted, or unauthorized content.

SwiftFetch does not verify ownership, grant any rights to downloaded content, or guarantee the availability of any particular format. The service is provided "as is" without warranty of any kind.
