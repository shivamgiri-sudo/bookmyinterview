from __future__ import annotations
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.logging import configure_logging, get_logger
from app.core.middleware import RequestContextMiddleware
from app.core.cache import cache
from app.api.routes import router as core_router
from app.api.enterprise_mcp_routes import mcp_router
from app.api.access_routes import access_router
from app.api.data_routes import data_router
from app.api.billing_routes import billing_router
from app.api.compliance_routes import compliance_router
from app.api.consent_routes import consent_router
from app.api.event_routes import event_router
from app.api.review_routes import review_router
from app.api.cost_routes import cost_router
from app.api.sso_routes import sso_router
from app.api.protected_config_routes import protected_config_router
from app.api.provider_routes import provider_router
from app.api.workspace_routes import workspace_router
from app.api.role_insight_routes import role_insight_router
from app.api.template_routes import template_router
from app.api.auth_routes import auth_router
from app.api.account_routes import account_router
from app.api.session_db_routes import session_db_router
from app.api.ops_metrics_routes import ops_metrics_router
from app.api.secure_workspace_routes import secure_workspace_router
from app.api.v1 import router as v1_router

settings = get_settings()
logger = get_logger("app_factory")


def cors_origins() -> list[str]:
    return [item.strip() for item in settings.cors_allow_origins.split(",") if item.strip()]


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging()
    logger.info("app_startup", env=settings.app_env)
    await cache.connect()
    yield
    logger.info("app_shutdown")


def create_app() -> FastAPI:
    configure_logging()
    app = FastAPI(
        title="BOOK MY INTERVIEW API",
        version="1.0.0",
        description="Global enterprise hiring intelligence API.",
        lifespan=lifespan,
    )
    app.add_middleware(RequestContextMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Existing routes (preserved for backward compatibility).
    app.include_router(core_router, prefix="/api")
    app.include_router(mcp_router, prefix="/api/mcp")
    app.include_router(access_router, prefix="/api/access")
    app.include_router(data_router, prefix="/api/data")
    app.include_router(billing_router, prefix="/api/billing")
    app.include_router(compliance_router, prefix="/api/compliance")
    app.include_router(consent_router, prefix="/api/consent")
    app.include_router(event_router, prefix="/api/platform")
    app.include_router(review_router, prefix="/api/review")
    app.include_router(cost_router, prefix="/api/cost")
    app.include_router(sso_router, prefix="/api/sso")
    app.include_router(protected_config_router, prefix="/api/protected-config")
    app.include_router(provider_router, prefix="/api/providers")
    app.include_router(workspace_router, prefix="/api/workspace")
    app.include_router(role_insight_router, prefix="/api/insights")
    app.include_router(template_router, prefix="/api/templates")
    app.include_router(auth_router, prefix="/api/auth")
    app.include_router(account_router, prefix="/api/account")
    app.include_router(session_db_router, prefix="/api/session-db")
    app.include_router(ops_metrics_router, prefix="/api/ops-metrics")
    app.include_router(secure_workspace_router, prefix="/api/secure/workspace")

    # New versioned production API.
    app.include_router(v1_router, prefix="/api")

    @app.get("/")
    def root():
        return {
            "product": "BOOK MY INTERVIEW",
            "status": "running",
            "docs": "/docs",
            "mcp_registry": "/api/mcp/registry",
            "api_v1": "/api/v1/health",
            "global_ready": True,
        }

    return app
