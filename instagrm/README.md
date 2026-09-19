# ⚡ InstaSnap - High-Performance Instagram Video Downloader

A production-grade, highly concurrent Instagram video and audio downloader API capable of handling **1 Million+ requests daily** with sub-second response times, paired with a modern SnapTik / TikTok-downloader style responsive web frontend.

---

## 🌟 Key Features

- ⚡ **1M+ Traffic Architecture**:
  - **SingleFlight Request Deduplication**: Prevents repeated extraction when hundreds of concurrent users request the same viral video.
  - **Multi-Layer Caching**:
    - **L1 In-Memory LRU**: Sub-5ms instant responses for hot videos.
    - **L2 Redis Cache**: Shared cache with 1-hour TTL and graceful local fallback.
    - **L3 HTTP Edge Headers**: Browser & CDN caching via `Cache-Control` and `ETag`.
- 🎥 **Full Media Capabilities**:
  - Full HD 1080p, 720p, 480p MP4 and WebM video formats.
  - High-fidelity Audio Only (MP3 / M4A) extraction.
  - HD Cover & Thumbnail downloads.
  - Proxy Streaming endpoint (`/api/v1/stream`) with HTTP `Range` header support for in-browser video seeking.
- 📦 **Batch Downloader**:
  - Process up to 25 URLs concurrently controlled via `asyncio.Semaphore`.
- 📊 **Monitoring & Observability**:
  - Prometheus metrics exporter at `/api/v1/metrics`.
  - Real-time performance statistics at `/api/v1/stats`.
  - Structured JSON logging with `structlog`.
- 🎨 **SnapTik / TikTok-Style Modern Frontend**:
  - Built-in glowing dark UI with 1-click clipboard paste.
  - In-browser stream player modal.
  - Real-time progress bar and batch download list.
  - Served directly at `http://localhost:8000/`.

---

## 🚀 Quickstart

### Prerequisites
- Python 3.11+
- FFmpeg (available in PATH)

### 1. Installation & Environment Setup

```bash
# Create virtual environment
uv venv --python 3.11 .venv

# Activate environment (Windows PowerShell)
.\.venv\Scripts\activate

# Install dependencies
uv pip install -r requirements.txt
```

### 2. Run the Server

```bash
# Start FastAPI development server
.\.venv\Scripts\uvicorn.exe app.main:app --host 0.0.0.0 --port 8000 --reload
```

Open your browser at:
- **Web App**: `http://localhost:8000/`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **Prometheus Metrics**: `http://localhost:8000/api/v1/metrics`
- **Performance Stats**: `http://localhost:8000/api/v1/stats`

---

## 📡 API Endpoints

### 1. Single Video Download
`GET /api/v1/download?url={INSTAGRAM_URL}&quality=best&format=mp4`

```json
{
  "success": true,
  "direct_url": "https://scontent...cdninstagram.com/...",
  "stream_url": "http://localhost:8000/api/v1/stream?url=...",
  "title": "Amazing Cinematic Reel",
  "thumbnail": "https://scontent...cdninstagram.com/...",
  "duration": 34.5,
  "duration_formatted": "00:34",
  "uploader": "cinematic_creator",
  "fetch_time_ms": 12.4,
  "cached": true,
  "cache_layer": "L1",
  "quality": "best",
  "format": "mp4",
  "formats": [...]
}
```

### 2. Ultra-Fast Cached Download
`GET /api/v1/download-fast?url={INSTAGRAM_URL}`
- Returns in `< 20ms` on L1 memory cache hit.

### 3. Batch Download
`POST /api/v1/batch-download`

```json
{
  "urls": [
    "https://www.instagram.com/reel/C7192xyz1/",
    "https://www.instagram.com/reel/C7192xyz2/"
  ],
  "max_concurrent": 10,
  "quality": "best",
  "format": "mp4",
  "timeout": 30
}
```

### 4. Streaming Proxy
`GET /api/v1/stream?url={DIRECT_MEDIA_URL}`
- Supports `Range: bytes=0-1048576` for video seeking and scrubbing.

### 5. Server-Sent Events Download Progress
`GET /api/v1/download-progress?url={INSTAGRAM_URL}`

---

## 🧪 Testing

### Run Automated Unit & Integration Tests
```bash
.\.venv\Scripts\pytest.exe tests/ -v
```

### Run 500+ Concurrent User Load Test (Locust)
```bash
.\.venv\Scripts\locust.exe -f tests/load_test.py --headless -u 500 -r 50 -t 60s --host http://localhost:8000
```

---

## 🐳 Docker Deployment

To launch the complete production stack (FastAPI with 4 Gunicorn workers, Redis 7, and Nginx reverse proxy):

```bash
docker-compose -f docker/docker-compose.yml up --build -d
```
