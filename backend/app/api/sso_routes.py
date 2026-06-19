from __future__ import annotations
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.sso_policy import list_sso_options, evaluate_sso_provider

sso_router = APIRouter()

class SSOEvaluationPayload(BaseModel):
    provider_key: str = "custom_jwt"
    enterprise_client: bool = False
    cost_sensitive: bool = True

@sso_router.get("/options")
def options():
    return list_sso_options()

@sso_router.post("/evaluate")
def evaluate(payload: SSOEvaluationPayload):
    return evaluate_sso_provider(payload.model_dump())
