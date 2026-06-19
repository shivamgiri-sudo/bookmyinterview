from __future__ import annotations
from fastapi import APIRouter
from sqlalchemy import text
from app.core.config import get_settings
from app.core.cache import cache
from app.core.logging import get_logger
from app.db.session_async import async_engine

settings = get_settings()
logger = get_logger("api.health")
router = APIRouter()

@router.get("/health")
async def health():
    health_checks = {"app": "ok", "version": "1.0.0", "env": settings.app_env}
    status_code = 200

    # DB check
    try:
        async with async_engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        health_checks["database"] = "ok"
    except Exception as exc:
        logger.error("health_db_check_failed", error=str(exc))
        health_checks["database"] = "unavailable"
        status_code = 503

    # Cache check
    cache_health = await cache.health()
    health_checks["cache"] = cache_health
    if cache_health["status"] != "ok":
        status_code = 503

    return health_checks

@router.get("/ready")
async def ready():
    return {"ready": True}
