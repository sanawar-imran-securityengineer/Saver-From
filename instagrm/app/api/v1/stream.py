from fastapi import APIRouter, Query, Request, HTTPException
from fastapi.responses import StreamingResponse
import structlog

from app.core.security import is_safe_redirect_url
from app.services.downloader import downloader_service

logger = structlog.get_logger()
router = APIRouter()


from typing import Optional

@router.get("/stream")
async def stream_video(
    request: Request,
    url: str = Query(..., description="Direct media stream URL to proxy"),
    download: bool = Query(False, description="Set Content-Disposition to attachment for forced file download"),
    filename: Optional[str] = Query(None, description="Suggested filename for download")
):
    """
    Direct Streaming Proxy with HTTP Range Support:
    - Bypasses Instagram CDN IP restrictions and CORS locks
    - Supports Range header for video seeking and player scrubbing
    - Efficient async chunked byte transfer
    - Supports forced download attachments with custom filenames
    """
    if not is_safe_redirect_url(url):
        raise HTTPException(status_code=400, detail="Invalid stream URL")

    range_header = request.headers.get("range")

    stream_gen, headers, status_code = await downloader_service.stream_media(
        target_url=url,
        range_header=range_header,
        download=download,
        filename=filename
    )

    return StreamingResponse(
        stream_gen,
        status_code=status_code,
        headers=headers
    )
