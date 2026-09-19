import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from slowapi.errors import RateLimitExceeded
import structlog

from app.api.v1 import api_v1_router
from app.config import settings
from app.core.exceptions import InstagramDownloaderError
from app.core.rate_limiter import limiter, rate_limit_exceeded_handler
from app.middleware.logging import LoggingMiddleware
from app.middleware.timing import TimingAndMetricsMiddleware
from app.services.cache import cache_service
from app.services.downloader import close_http_client

# Configure structlog
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.add_log_level,
        structlog.processors.JSONRenderer()
    ]
)
logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize caches and HTTP connections
    logger.info("app_starting", app_name=settings.APP_NAME, version=settings.APP_VERSION)
    await cache_service.initialize()
    yield
    # Shutdown: Clean up connections
    logger.info("app_shutting_down")
    await cache_service.close()
    await close_http_client()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="High-Performance, Concurrency-Optimized Instagram Video Downloader API",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Attach state for slowapi
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)


@app.exception_handler(InstagramDownloaderError)
async def instagram_downloader_exception_handler(request: Request, exc: InstagramDownloaderError):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.__class__.__name__,
            "message": exc.message
        }
    )


# Middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(TimingAndMetricsMiddleware)
app.add_middleware(LoggingMiddleware)

# API Routers
app.include_router(api_v1_router)

# Mount frontend static directory if exists
frontend_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
if os.path.exists(frontend_dir):
    app.mount("/static", StaticFiles(directory=frontend_dir), name="static")

    @app.get("/", include_in_schema=False)
    async def serve_index():
        index_file = os.path.join(frontend_dir, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"message": "Welcome to Instagram Video Downloader API. Check /docs for API documentation."}
else:
    @app.get("/", include_in_schema=False)
    async def serve_index():
        return {"message": "Welcome to Instagram Video Downloader API. Check /docs for API documentation."}
