from __future__ import annotations
import time
import uuid
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.config import get_settings
from app.core.logging import get_logger
import structlog

settings = get_settings()
logger = get_logger("middleware")

class RequestContextMiddleware(BaseHTTPMiddleware):
    """Attach request_id, tenant_id, and timing to every request."""

    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get(settings.request_id_header) or str(uuid.uuid4())
        tenant_id = request.headers.get("x-tenant-id") or "unknown"

        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(
            request_id=request_id,
            tenant_id=tenant_id,
            path=request.url.path,
            method=request.method,
        )

        request.state.request_id = request_id
        request.state.tenant_id = tenant_id

        start = time.perf_counter()
        status_code = 500
        try:
            response = await call_next(request)
            status_code = response.status_code
            response.headers[settings.request_id_header] = request_id
            return response
        except Exception as exc:
            logger.error("request_failed", error=str(exc))
            raise
        finally:
            duration_ms = (time.perf_counter() - start) * 1000
            logger.info(
                "request_completed",
                status_code=status_code,
                duration_ms=round(duration_ms, 2),
            )
