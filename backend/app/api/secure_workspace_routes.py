from __future__ import annotations
import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.core.session_context import SessionContext, require_capability, tenant_scope
from app.db.session import Base, engine, get_db
from app.db.models import JobRequest, Candidate, Assessment
from app.services.assessment import build_assessment_path

Base.metadata.create_all(bind=engine)
secure_workspace_router = APIRouter()

class SecureJobCreate(BaseModel):
    tenant_id: int | None = None
    designation: str
    industry: str = "General"
    location: str = "Remote"
    seniority: str = "Mid"
    budget: str | None = None
    requirement: dict = Field(default_factory=dict)

class SecureTalentCreate(BaseModel):
    tenant_id: int | None = None
    full_name: str
    contact: str
    location: str | None = None
    consent_status: str = "unknown"
    profile: dict = Field(default_factory=dict)

@secure_workspace_router.get("/overview")
def overview(ctx: SessionContext = Depends(require_capability("job:read")), db: Session = Depends(get_db)):
    tenant_id = tenant_scope(None, ctx)
    job_q = db.query(JobRequest)
    candidate_q = db.query(Candidate)
    assessment_q = db.query(Assessment)
    if tenant_id is not None:
        job_q = job_q.filter(JobRequest.tenant_id == tenant_id)
        candidate_q = candidate_q.filter(Candidate.tenant_id == tenant_id)
        assessment_q = assessment_q.filter(Assessment.tenant_id == tenant_id)
    return {"tenant_id": tenant_id, "jobs": job_q.count(), "candidates": candidate_q.count(), "assessments": assessment_q.count(), "role": ctx.role}

@secure_workspace_router.post("/jobs")
def create_job(payload: SecureJobCreate, ctx: SessionContext = Depends(require_capability("job:create")), db: Session = Depends(get_db)):
    scoped = tenant_scope(payload.tenant_id, ctx)
    if scoped is None:
        raise HTTPException(status_code=400, detail="Tenant required")
    job = JobRequest(tenant_id=scoped, designation=payload.designation, industry=payload.industry, location=payload.location, seniority=payload.seniority, budget=payload.budget, requirement_json=json.dumps(payload.requirement))
    db.add(job)
    db.commit()
    db.refresh(job)
    path = build_assessment_path({**payload.requirement, "designation": payload.designation, "industry": payload.industry, "location": payload.location, "seniority": payload.seniority})
    assessment = Assessment(tenant_id=scoped, job_id=job.id, path_json=json.dumps(path), status="path_generated")
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return {"job_id": job.id, "tenant_id": scoped, "assessment_id": assessment.id, "assessment_path": path, "status": job.status}

@secure_workspace_router.get("/jobs")
def jobs(tenant_id: int | None = None, ctx: SessionContext = Depends(require_capability("job:read")), db: Session = Depends(get_db)):
    scoped = tenant_scope(tenant_id, ctx)
    query = db.query(JobRequest)
    if scoped is not None:
        query = query.filter(JobRequest.tenant_id == scoped)
    rows = query.order_by(JobRequest.created_at.desc()).limit(100).all()
    return [{"id": row.id, "tenant_id": row.tenant_id, "designation": row.designation, "location": row.location, "status": row.status, "created_at": row.created_at.isoformat() if row.created_at else None} for row in rows]

@secure_workspace_router.post("/talent")
def create_talent(payload: SecureTalentCreate, ctx: SessionContext = Depends(require_capability("candidate:create")), db: Session = Depends(get_db)):
    scoped = tenant_scope(payload.tenant_id, ctx)
    if scoped is None:
        raise HTTPException(status_code=400, detail="Tenant required")
    candidate = Candidate(tenant_id=scoped, full_name=payload.full_name, email=payload.contact, location=payload.location, consent_status=payload.consent_status, profile_json=json.dumps(payload.profile))
    db.add(candidate)
    db.commit()
    db.refresh(candidate)
    return {"candidate_id": candidate.id, "tenant_id": scoped, "full_name": candidate.full_name, "consent_status": candidate.consent_status}

@secure_workspace_router.get("/talent")
def talent(tenant_id: int | None = None, ctx: SessionContext = Depends(require_capability("candidate:read")), db: Session = Depends(get_db)):
    scoped = tenant_scope(tenant_id, ctx)
    query = db.query(Candidate)
    if scoped is not None:
        query = query.filter(Candidate.tenant_id == scoped)
    rows = query.order_by(Candidate.created_at.desc()).limit(100).all()
    return [{"id": row.id, "tenant_id": row.tenant_id, "full_name": row.full_name, "location": row.location, "consent_status": row.consent_status, "created_at": row.created_at.isoformat() if row.created_at else None} for row in rows]

@secure_workspace_router.get("/assessments")
def assessments(tenant_id: int | None = None, ctx: SessionContext = Depends(require_capability("assessment:read")), db: Session = Depends(get_db)):
    scoped = tenant_scope(tenant_id, ctx)
    query = db.query(Assessment)
    if scoped is not None:
        query = query.filter(Assessment.tenant_id == scoped)
    rows = query.order_by(Assessment.created_at.desc()).limit(100).all()
    return [{"id": row.id, "tenant_id": row.tenant_id, "job_id": row.job_id, "status": row.status, "path": json.loads(row.path_json or "{}"), "created_at": row.created_at.isoformat() if row.created_at else None} for row in rows]
