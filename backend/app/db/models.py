from __future__ import annotations
from datetime import datetime, timezone
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class Tenant(Base):
    __tablename__ = "tenants"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(180), nullable=False)
    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True, default="")
    region: Mapped[str] = mapped_column(String(40), default="global")
    plan: Mapped[str] = mapped_column(String(40), default="starter")
    billing_status: Mapped[str] = mapped_column(String(40), default="active")
    settings_json: Mapped[str] = mapped_column(Text, default="{}")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now
    )

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tenant_id: Mapped[int | None] = mapped_column(ForeignKey("tenants.id"), nullable=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(160))
    role: Mapped[str] = mapped_column(String(60), default="client_admin")
    password_hash: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

class JobRequest(Base):
    __tablename__ = "job_requests"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id"), index=True)
    designation: Mapped[str] = mapped_column(String(160), index=True)
    department: Mapped[str] = mapped_column(String(120), default="General")
    industry: Mapped[str] = mapped_column(String(120), default="General")
    location: Mapped[str] = mapped_column(String(120), default="Remote")
    seniority: Mapped[str] = mapped_column(String(80), default="Mid")
    budget: Mapped[str | None] = mapped_column(String(120), nullable=True)
    salary_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    salary_max: Mapped[int | None] = mapped_column(Integer, nullable=True)
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    status: Mapped[str] = mapped_column(String(60), default="draft")
    requirement_json: Mapped[str] = mapped_column(Text, default="{}")
    generated_jd: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now
    )

class Candidate(Base):
    __tablename__ = "candidates"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tenant_id: Mapped[int | None] = mapped_column(ForeignKey("tenants.id"), nullable=True)
    full_name: Mapped[str] = mapped_column(String(160))
    email: Mapped[str] = mapped_column(String(255), index=True)
    phone: Mapped[str | None] = mapped_column(String(80), nullable=True)
    location: Mapped[str | None] = mapped_column(String(120), nullable=True)
    consent_status: Mapped[str] = mapped_column(String(50), default="unknown")
    consent_granted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    data_retention_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    profile_json: Mapped[str] = mapped_column(Text, default="{}")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    __table_args__ = (UniqueConstraint("tenant_id", "email", name="uq_candidate_tenant_email"),)

class Assessment(Base):
    __tablename__ = "assessments"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id"), index=True)
    job_id: Mapped[int] = mapped_column(ForeignKey("job_requests.id"), index=True)
    candidate_id: Mapped[int | None] = mapped_column(ForeignKey("candidates.id"), nullable=True)
    path_id: Mapped[int | None] = mapped_column(ForeignKey("job_assessment_paths.id"), nullable=True)
    path_json: Mapped[str] = mapped_column(Text, default="{}")
    final_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    recommendation: Mapped[str | None] = mapped_column(String(80), nullable=True)
    status: Mapped[str] = mapped_column(String(60), default="draft")
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    shortlisted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    shortlisted_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    client_feedback_json: Mapped[str] = mapped_column(Text, default="{}")
    client_decision: Mapped[str | None] = mapped_column(String(40), nullable=True)
    decided_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

class InterviewSlot(Base):
    __tablename__ = "interview_slots"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id"), index=True)
    job_id: Mapped[int] = mapped_column(ForeignKey("job_requests.id"), index=True)
    interviewer_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    created_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    mode: Mapped[str] = mapped_column(String(40), default="digital")
    status: Mapped[str] = mapped_column(String(40), default="available")
    version: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

class InterviewBooking(Base):
    __tablename__ = "interview_bookings"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id"), index=True)
    slot_id: Mapped[int] = mapped_column(ForeignKey("interview_slots.id"), unique=True, index=True)
    candidate_id: Mapped[int] = mapped_column(ForeignKey("candidates.id"), index=True)
    job_id: Mapped[int] = mapped_column(ForeignKey("job_requests.id"), index=True)
    assessment_id: Mapped[int | None] = mapped_column(ForeignKey("assessments.id"), nullable=True, index=True)
    meeting_link: Mapped[str | None] = mapped_column(String(500), nullable=True)
    report_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    reminder_sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(40), default="booked")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    candidate_id: Mapped[int] = mapped_column(ForeignKey("candidates.id"), index=True)
    resume_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    resume_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
    parsed_profile_json: Mapped[str] = mapped_column(Text, default="{}")
    skills_json: Mapped[str] = mapped_column(Text, default="[]")
    experience_years: Mapped[float | None] = mapped_column(Float, nullable=True)
    current_ctc: Mapped[int | None] = mapped_column(Integer, nullable=True)
    expected_ctc: Mapped[int | None] = mapped_column(Integer, nullable=True)
    notice_period_days: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

class AssessmentTemplate(Base):
    __tablename__ = "assessment_templates"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    role_family: Mapped[str] = mapped_column(String(120), index=True)
    designation: Mapped[str] = mapped_column(String(160), index=True)
    seniority_level: Mapped[str | None] = mapped_column(String(80), nullable=True)
    industry: Mapped[str | None] = mapped_column(String(120), nullable=True)
    default_path_json: Mapped[str] = mapped_column(Text, default="[]")
    passing_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

class AssessmentRule(Base):
    __tablename__ = "assessment_rules"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    condition_field: Mapped[str] = mapped_column(String(120))
    operator: Mapped[str] = mapped_column(String(40))
    threshold_value: Mapped[str] = mapped_column(Text, default="{}")
    assessment_to_add: Mapped[str] = mapped_column(String(120))
    priority: Mapped[int] = mapped_column(Integer, default=0)
    active_status: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

class JobAssessmentPath(Base):
    __tablename__ = "job_assessment_paths"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    job_id: Mapped[int] = mapped_column(ForeignKey("job_requests.id"), index=True)
    path_json: Mapped[str] = mapped_column(Text, default="[]")
    generated_by: Mapped[str | None] = mapped_column(String(60), nullable=True)
    version: Mapped[int] = mapped_column(Integer, default=1)
    modification_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

class TraitQuestion(Base):
    __tablename__ = "trait_questions"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    trait_id: Mapped[str] = mapped_column(String(80), index=True)
    role_family: Mapped[str | None] = mapped_column(String(120), nullable=True, index=True)
    question_text: Mapped[str] = mapped_column(Text)
    scoring_rubric_json: Mapped[str] = mapped_column(Text, default="{}")
    validation_status: Mapped[str] = mapped_column(String(60), default="pending")
    active_status: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

class AssessmentResponse(Base):
    __tablename__ = "assessment_responses"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    assessment_id: Mapped[int] = mapped_column(ForeignKey("assessments.id"), index=True)
    question_id: Mapped[int | None] = mapped_column(ForeignKey("trait_questions.id"), nullable=True)
    question_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    response_type: Mapped[str] = mapped_column(String(20), default="text")
    media_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    transcript: Mapped[str | None] = mapped_column(Text, nullable=True)
    response_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    score_json: Mapped[str] = mapped_column(Text, default="{}")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

class AssessmentScore(Base):
    __tablename__ = "assessment_scores"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    assessment_id: Mapped[int] = mapped_column(ForeignKey("assessments.id"), index=True)
    category: Mapped[str] = mapped_column(String(120))
    raw_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    weighted_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    scored_by: Mapped[str | None] = mapped_column(String(60), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

class IntegrationCredential(Base):
    __tablename__ = "integration_credentials"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tenant_id: Mapped[int | None] = mapped_column(ForeignKey("tenants.id"), nullable=True)
    facility_key: Mapped[str] = mapped_column(String(120), index=True)
    provider_name: Mapped[str] = mapped_column(String(160))
    environment: Mapped[str] = mapped_column(String(40), default="sandbox")
    encrypted_secret_reference: Mapped[str] = mapped_column(Text)
    masked_preview: Mapped[str] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(60), default="active")
    rotated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tenant_id: Mapped[int | None] = mapped_column(ForeignKey("tenants.id"), nullable=True)
    actor_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    actor_role: Mapped[str] = mapped_column(String(80), default="system")
    entity_type: Mapped[str] = mapped_column(String(120))
    entity_id: Mapped[str | None] = mapped_column(String(120), nullable=True)
    action: Mapped[str] = mapped_column(String(120))
    risk_level: Mapped[str] = mapped_column(String(60), default="low")
    payload_json: Mapped[str] = mapped_column(Text, default="{}")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
