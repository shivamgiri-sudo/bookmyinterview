from __future__ import annotations
from fastapi import HTTPException
from app.core.config import get_settings

DEV_ENVS = {"local", "dev", "development", "demo", "test", "testing"}


def allow_open_surface() -> bool:
    return get_settings().app_env.lower() in DEV_ENVS


def require_open_surface_enabled():
    if not allow_open_surface():
        raise HTTPException(status_code=403, detail="This route group is disabled outside development mode")
