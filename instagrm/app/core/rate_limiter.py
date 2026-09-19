from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from app.config import settings

# Global SlowAPI limiter keyed by client remote IP address
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[f"{settings.RATE_LIMIT}/{settings.RATE_LIMIT_PERIOD} seconds"]
)


def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> Response:
    """Custom JSON response for rate limit violations."""
    return JSONResponse(
        status_code=429,
        content={
            "success": False,
            "error": "RateLimitExceeded",
            "message": f"Too many requests. Limit: {exc.detail}",
            "retry_after": 60
        }
    )
