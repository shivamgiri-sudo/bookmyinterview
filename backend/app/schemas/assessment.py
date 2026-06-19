from __future__ import annotations
from typing import Any
from pydantic import BaseModel

class AssessmentCreate(BaseModel):
    job_id: int
    candidate_id: int | None = None

class AssessmentResponse(BaseModel):
    id: int
    tenant_id: int
    job_id: int
    candidate_id: int | None
    status: str
    final_score: float | None
    recommendation: str | None

class ScoreResponse(BaseModel):
    assessment_id: int
    final_score: float
    recommendation: str
    explanation: dict[str, Any]


class AssessmentDetailResponse(BaseModel):
    id: int
    tenant_id: int
    job_id: int
    candidate_id: int | None
    path_id: int | None
    path_json: dict[str, Any]
    status: str
    final_score: float | None
    recommendation: str | None
    shortlisted_at: str | None
    client_decision: str | None
    decided_at: str | None
    responses: list[dict[str, Any]]
    scores: list[dict[str, Any]]
    booking: dict[str, Any] | None
