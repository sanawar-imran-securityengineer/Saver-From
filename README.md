# SaverFrom

A collection of self-hosted social-media **video downloader** services plus the
unified `main-platform` gateway that fronts them.

Each service is an independent application with its own API, frontend and
dependencies. The gateway detects the platform from a submitted URL and routes
the request to the matching service through a circuit breaker.

## Repository layout

| Path | Description |
| --- | --- |
| `main-platform/` | Unified gateway (FastAPI) + static frontend (landing pages, platform pages, legal pages) and per-service routing |
| `FastFB-Video-Downloader/` | Facebook video downloader — pnpm monorepo (Vite/React frontend + Express API server + bundled `yt-dlp`/`ffmpeg` toolchain) |
| `youtbe video downalder/` | YouTube downloader (FastAPI + Vite frontend) |
| `Tiktok video dowader website/` | TikTok downloader website |
| `instagrm/` | Instagram media downloader API (FastAPI) |
| `pintrest/` | Pinterest video/image downloader API (FastAPI) |
| `reddit video downlaoder/` | Reddit video downloader API (FastAPI) |
| `snapchat/` | Snapchat video downloader API (FastAPI) |
| `thread video downloader/` | Threads (Meta) video downloader API (FastAPI) |
| `twitch/` | Twitch clip/VOD downloader API (FastAPI) |
| `twitter video Downlaoder/` | X / Twitter video downloader API (FastAPI) |
| `option youtub vidoe downader/` | Placeholder folder (currently empty) |

## Getting started

Every sub-project is self-contained. Typical workflow:

```powershell
# Python services (instagrm, pintrest, reddit, snapchat, threads, twitch, twitter, youtube)
cd "instagrm"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env      # then edit the values
uvicorn app.main:app --reload

# Node-based services
cd "Tiktok video dowader website\project"
npm install
npm run dev
```

```powershell
# Unified gateway
cd main-platform\gateway
pip install -r requirements.txt
python -m app.run
```

## Configuration & secrets

* Every service is configured through a `.env` file that is **not** committed.
  Copy the matching `.env.example` and fill in your own values.
* Downloaded media, `node_modules/`, virtual environments and the bundled
  `ffmpeg`/`yt-dlp` executables are intentionally ignored – see `.gitignore`.

## License / disclaimer

These tools are provided for downloading content you own or are otherwise
authorized to download. Respect the terms of service of each platform and
applicable copyright law.