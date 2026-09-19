"""API v1 Router aggregation."""
from fastapi import APIRouter
from app.api.v1.download import router as download_router
from app.api.v1.batch import router as batch_router
from app.api.v1.stream import router as stream_router
from app.api.v1.info import router as info_router
from app.api.v1.health import router as health_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(download_router, tags=["Download"])
api_v1_router.include_router(batch_router, tags=["Batch"])
api_v1_router.include_router(stream_router, tags=["Stream"])
api_v1_router.include_router(info_router, tags=["Info"])
api_v1_router.include_router(health_router, tags=["Health & Metrics"])
