from __future__ import annotations
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.billing import list_plans, estimate_invoice

billing_router = APIRouter()

class InvoiceEstimatePayload(BaseModel):
    plan_key: str = "growth"
    jobs: int = 10
    assessments: int = 250
    region: str = "global"

@billing_router.get("/plans")
def plans(region: str = "global"):
    return list_plans(region)

@billing_router.post("/estimate")
def invoice_estimate(payload: InvoiceEstimatePayload):
    return estimate_invoice(payload.plan_key, payload.jobs, payload.assessments, payload.region)
