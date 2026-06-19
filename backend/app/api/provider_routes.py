from __future__ import annotations
from fastapi import APIRouter
from app.services.provider_catalog import list_provider_adapters, readiness_summary

provider_router = APIRouter()

@provider_router.get("/adapters")
def adapters():
    return list_provider_adapters()

@provider_router.get("/readiness")
def readiness():
    return readiness_summary()
