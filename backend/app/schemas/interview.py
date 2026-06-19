from __future__ import annotations
from datetime import datetime
from typing import Any
from pydantic import BaseModel

class InterviewSlotResponse(BaseModel):
    id: int
    job_id: int
    start_time: datetime
    end_time: datetime
    mode: str
    status: str

class InterviewBookingResponse(BaseModel):
    id: int
    slot_id: int
    candidate_id: int
    assessment_id: int | None
    meeting_link: str | None
    status: str
    created_at: datetime

class ShortlistRequest(BaseModel):
    assessment_id: int

class ClientFeedbackRequest(BaseModel):
    ratings: dict[str, float]
    notes: str | None = None
    recommendation: str | None = None

class DecisionRequest(BaseModel):
    decision: str  # hire / reject / keep_in_pool
    notes: str | None = None

class DecisionResponse(BaseModel):
    assessment_id: int
    client_decision: str
    decided_at: datetime
