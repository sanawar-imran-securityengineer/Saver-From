import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.services.metrics import REQUEST_COUNT, REQUEST_LATENCY, ACTIVE_CONNECTIONS


class TimingAndMetricsMiddleware(BaseHTTPMiddleware):
    """Measures request latency, sets X-Response-Time header, and records metrics."""

    async def dispatch(self, request: Request, call_next) -> Response:
        ACTIVE_CONNECTIONS.inc()
        start_time = time.perf_counter()
        endpoint = request.url.path

        try:
            response = await call_next(request)
            duration = time.perf_counter() - start_time
            duration_ms = round(duration * 1000, 2)

            response.headers["X-Response-Time"] = f"{duration_ms}ms"

            # Prometheus
            REQUEST_COUNT.labels(
                method=request.method,
                endpoint=endpoint,
                status=str(response.status_code)
            ).inc()
            REQUEST_LATENCY.labels(endpoint=endpoint).observe(duration)

            return response
        except Exception:
            REQUEST_COUNT.labels(
                method=request.method,
                endpoint=endpoint,
                status="500"
            ).inc()
            raise
        finally:
            ACTIVE_CONNECTIONS.dec()
