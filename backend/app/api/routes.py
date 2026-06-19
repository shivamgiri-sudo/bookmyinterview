from __future__ import annotations
from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel, EmailStr, Field
from typing import Any
from app.services.assessment import build_assessment_path
from app.services.trait_engine import generate_trait_questions, evaluate_trait_response
from app.services.scoring import score_candidate, evaluate_audio, evaluate_video
from app.services.jd_engine import generate_jd
from app.services.integration_vault import list_facilities, save_integration, test_connection, security_policy

router = APIRouter()

class JobIntake(BaseModel):
    company_name: str = "Demo Company"
    designation: str = "HR Manager"
    industry: str = "ITES"
    location: str = "Noida"
    budget: str = "8-12 LPA"
    seniority: str = "Manager"
    must_have_skills: list[str] = Field(default_factory=list)
    traits: list[str] = Field(default_factory=list)
    reporting_manager: str | None = None
    interview_slots: list[str] = Field(default_factory=list)
    notice_period: str | None = None
    deal_breakers: list[str] = Field(default_factory=list)
    client_overrides: dict[str, Any] = Field(default_factory=dict)

class CandidateScorePayload(BaseModel):
    profile_type: str = "Managerial"
    scores: dict[str, float]

class TranscriptPayload(BaseModel):
    transcript: str
    voice_level: str = "Level 3"
    trait: str | None = None

class InterviewSlotPayload(BaseModel):
    candidate_name: str
    candidate_email: EmailStr
    job_id: str
    selected_slot: str
    mode: str = "digital"

class IntegrationCredentialPayload(BaseModel):
    facility_key: str
    provider_name: str | None = None
    environment: str = "sandbox"
    tenant_scope: str = "global"
    credentials: dict[str, str] = Field(default_factory=dict)
    created_by_role: str = "superadmin"

class IntegrationTestPayload(BaseModel):
    facility_key: str
    environment: str = "sandbox"

@router.get("/health")
def health():
    return {"status": "ok", "service": "BOOK MY INTERVIEW API"}

@router.post("/intake/analyze")
def analyze_intake(payload: JobIntake):
    path = build_assessment_path(payload.model_dump())
    jd = generate_jd(payload.model_dump(), path)
    traits = generate_trait_questions(payload.designation, payload.industry, payload.seniority)
    return {"assessment_path": path, "jd": jd, "trait_questions": traits}

@router.post("/assessment/path")
def assessment_path(payload: JobIntake):
    return build_assessment_path(payload.model_dump())

@router.post("/traits/generate")
def traits(payload: JobIntake):
    return generate_trait_questions(payload.designation, payload.industry, payload.seniority)

@router.post("/traits/evaluate")
def trait_eval(payload: TranscriptPayload):
    return evaluate_trait_response(payload.transcript, payload.trait or "Ownership")

@router.post("/audio/evaluate")
def audio_eval(payload: TranscriptPayload):
    return evaluate_audio(payload.transcript, payload.voice_level)

@router.post("/video/evaluate")
def video_eval(payload: TranscriptPayload):
    return evaluate_video(payload.transcript)

@router.post("/candidate/score")
def candidate_score(payload: CandidateScorePayload):
    return score_candidate(payload.scores, payload.profile_type)

@router.post("/resume/parse")
async def parse_resume(file: UploadFile = File(...)):
    filename = file.filename or "resume.pdf"
    return {"filename": filename, "parser": "MVP_STUB", "parsed_profile": {"name": "Candidate Name", "skills": ["Communication", "Excel", "Leadership"], "experience_years": 5, "notice_period": "30 days"}, "next_step": "Run candidate matching and assessment path"}

@router.post("/interviews/book")
def book_slot(payload: InterviewSlotPayload):
    return {"status": "booked", "candidate": payload.candidate_name, "slot": payload.selected_slot, "mode": payload.mode, "meeting_link": "demo-meeting-link", "report_attached": True}

@router.get("/superadmin/integrations")
def superadmin_integrations():
    return list_facilities()

@router.post("/superadmin/integrations/save")
def superadmin_save_integration(payload: IntegrationCredentialPayload):
    return save_integration(payload.model_dump())

@router.post("/superadmin/integrations/test")
def superadmin_test_integration(payload: IntegrationTestPayload):
    return test_connection(payload.model_dump())

@router.get("/superadmin/integrations/security-policy")
def integration_security_policy():
    return security_policy()

@router.get("/admin/acceptance-checklist")
def acceptance_checklist():
    return {
        "covered_modules": [
            "Client portal", "Smart intake", "JD engine", "Assessment orchestration", "Trait question generation and validation", "Audio assessment Level 3/5", "Video interview", "Resume parsing adapter", "Candidate scoring", "Interview booking", "Admin matrix", "MCP/API docs", "Compliance/audit design", "Superadmin integration vault"
        ],
        "production_adapters_required": ["LLM provider", "Resume parser", "Speech-to-text", "Video storage", "Calendar", "Email", "WhatsApp", "Payment", "ATS", "KMS/Vault secret encryption"],
    }
