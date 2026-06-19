from __future__ import annotations
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.cost_control import list_provider_costs, evaluate_provider_enablement

cost_router = APIRouter()

class ProviderEnablementPayload(BaseModel):
    provider_key: str
    projected_monthly_usd: float = 0
    superadmin_approved: bool = False

@cost_router.get("/providers")
def providers():
    return list_provider_costs()

@cost_router.post("/providers/evaluate")
def evaluate_provider(payload: ProviderEnablementPayload):
    return evaluate_provider_enablement(payload.model_dump())
