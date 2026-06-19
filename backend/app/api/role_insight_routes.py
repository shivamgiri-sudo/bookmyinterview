from __future__ import annotations
from fastapi import APIRouter
from pydantic import BaseModel, Field
from app.services.role_insights import list_role_insights, generate_critical_insight_summary

role_insight_router = APIRouter()

class RoleInsightPayload(BaseModel):
    role_key: str = "sales_manager"
    scores: dict[str, float] = Field(default_factory=dict)

@role_insight_router.get("/roles")
def roles():
    return list_role_insights()

@role_insight_router.post("/summary")
def role_summary(payload: RoleInsightPayload):
    return generate_critical_insight_summary(payload.role_key, payload.scores)
