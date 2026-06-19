from __future__ import annotations
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.protected_config_policy import list_protection_options, evaluate_protection

protected_config_router = APIRouter()

class ProtectionEvaluationPayload(BaseModel):
    protection_key: str = "local_env"
    production: bool = False

@protected_config_router.get("/options")
def options():
    return list_protection_options()

@protected_config_router.post("/evaluate")
def evaluate(payload: ProtectionEvaluationPayload):
    return evaluate_protection(payload.model_dump())
