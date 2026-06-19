from __future__ import annotations
from pydantic import BaseModel, EmailStr

class CandidateCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str | None = None
    location: str | None = None
    consent_status: str = "pending"

class CandidateResponse(BaseModel):
    id: int
    tenant_id: int | None
    full_name: str
    email: str
    phone: str | None
    location: str | None
    consent_status: str
    profile_json: str
