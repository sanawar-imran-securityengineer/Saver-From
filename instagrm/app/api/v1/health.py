from fastapi import APIRouter, Response
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST

from app.config import settings
from app.models.schemas import HealthResponse, StatsResponse
from app.services.cache import cache_service
from app.services.metrics import internal_stats, ACTIVE_CONNECTIONS

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """System health check and sub-system connection status."""
    cache_status = await cache_service.get_status()
    return HealthResponse(
        status="healthy",
        uptime_seconds=internal_stats.uptime_seconds,
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT,
        cache_status=cache_status,
        active_connections=int(ACTIVE_CONNECTIONS._value.get())
    )


@router.get("/metrics")
async def prometheus_metrics():
    """Prometheus-compatible scrape endpoint."""
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


@router.get("/stats", response_model=StatsResponse)
async def api_stats():
    """Real-time performance metrics, cache hit rate, and latency."""
    return StatsResponse(**internal_stats.get_stats())
