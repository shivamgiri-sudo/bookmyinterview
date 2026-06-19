from __future__ import annotations
from fastapi import APIRouter
from pydantic import BaseModel, Field
from app.services.global_policy_engine import evaluate_global_policy, get_region_policy

compliance_router = APIRouter()

class PolicyCheckPayload(BaseModel):
    region: str = "global"
    action: str = "assessment"
    consent_status: str = "unknown"
    source_type: str = "internal"
    source_approved: bool = False
    decision: str | None = None
    metadata: dict = Field(default_factory=dict)

@compliance_router.get("/policy/{region}")
def read_region_policy(region: str):
    return {"region": region.lower(), "policy": get_region_policy(region)}

@compliance_router.post("/policy/check")
def check_policy(payload: PolicyCheckPayload):
    return evaluate_global_policy(payload.model_dump())
