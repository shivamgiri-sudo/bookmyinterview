import os
from app.core.config import get_settings
from app.app_factory import cors_origins


def test_cors_origins_are_configurable():
    os.environ["CORS_ALLOW_ORIGINS"] = "https://app.example.com,https://admin.example.com"
    get_settings.cache_clear()
    assert cors_origins() == ["https://app.example.com", "https://admin.example.com"]
    os.environ.pop("CORS_ALLOW_ORIGINS", None)
    get_settings.cache_clear()
