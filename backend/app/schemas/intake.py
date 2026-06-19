from __future__ import annotations
from datetime import datetime
from typing import Any
from pydantic import BaseModel, Field

class InterviewSlotInput(BaseModel):
    start_time: datetime
    end_time: datetime
    mode: str = "digital"

class JobIntakeCreate(BaseModel):
    designation: str
    department: str | None = None
    industry: str = "General"
    location: str = "Remote"
    seniority: str = "Mid"
    salary_min: int | None = None
    salary_max: int | None = None
    currency: str = "USD"
    must_have_skills: list[str] = Field(default_factory=list)
    traits: list[str] = Field(default_factory=list)
    deal_breakers: list[str] = Field(default_factory=list)
    client_overrides: dict[str, Any] = Field(default_factory=dict)
    interview_slots: list[InterviewSlotInput] = Field(default_factory=list)

class JobIntakeResponse(BaseModel):
    id: int
    tenant_id: int
    designation: str
    status: str
    assessment_path: dict[str, Any]
    generated_jd: str | None
    interview_slots_count: int = 0
