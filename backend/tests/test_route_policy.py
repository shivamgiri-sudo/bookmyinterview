import os
from fastapi.testclient import TestClient
from app.core.config import get_settings
from app.app_factory import create_app


def reset_settings(env_value: str):
    os.environ["APP_ENV"] = env_value
    get_settings.cache_clear()


def test_legacy_workspace_available_in_local_mode():
    reset_settings("local")
    client = TestClient(create_app())
    response = client.get("/api/workspace/overview")
    assert response.status_code == 200
    assert response.json()["mode"] == "development_only"


def test_legacy_workspace_blocked_in_production_mode():
    reset_settings("production")
    client = TestClient(create_app())
    response = client.get("/api/workspace/overview")
    assert response.status_code == 403
    reset_settings("local")
