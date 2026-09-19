import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class DownloadRequest(BaseModel):
    url: str

PLATFORM = os.getenv("PLATFORM", "unknown")

@app.get("/health")
async def health():
    return {"status": "ok", "platform": PLATFORM}

@app.post("/api/v1/download")
async def download(req: DownloadRequest):
    # Simulate a download response – just echo the URL back with a fake download link
    return {
        "success": True,
        "platform": PLATFORM,
        "original_url": req.url,
        "downloadUrl": f"http://localhost:{os.getenv('PORT')}/fake/{PLATFORM}/{hash(req.url) % 1000}.mp4"
    }

# Optional: a quick endpoint to serve static file placeholder
@app.get("/fake/{platform}/{file_name}")
async def fake_file(platform: str, file_name: str):
    return {"message": f"This is a dummy file for {platform}: {file_name}"}
