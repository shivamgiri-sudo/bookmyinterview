from __future__ import annotations
from typing import Any
from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.enterprise_mcp import (
    registry,
    jd_intelligence,
    assessment_intelligence,
    candidate_matching,
    trait_question_mcp,
    compliance_check,
)

mcp_router = APIRouter()

class MCPPayload(BaseModel):
    payload: dict[str, Any] = Field(default_factory=dict)

@mcp_router.get("/registry")
def get_mcp_registry():
    return registry()

@mcp_router.post("/jd-intelligence/analyze")
def run_jd_intelligence(request: MCPPayload):
    return jd_intelligence(request.payload)

@mcp_router.post("/assessment-intelligence/orchestrate")
def run_assessment_intelligence(request: MCPPayload):
    return assessment_intelligence(request.payload)

@mcp_router.post("/candidate-matching/match")
def run_candidate_matching(request: MCPPayload):
    return candidate_matching(request.payload)

@mcp_router.post("/trait-question/generate-validate")
def run_trait_question(request: MCPPayload):
    return trait_question_mcp(request.payload)

@mcp_router.post("/compliance/check")
def run_compliance_check(request: MCPPayload):
    return compliance_check(request.payload)
