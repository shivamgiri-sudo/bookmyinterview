from __future__ import annotations
import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
from app.core.route_policy import require_open_surface_enabled
from app.db.session import Base, engine, get_db
from app.db.models import Tenant, JobRequest, Candidate, Assessment
from app.services.assessment import build_assessment_path
from app.services.audit import create_audit_log

# MVP bootstrap only. Production should use Alembic migrations.
Base.metadata.create_all(bind=engine)

data_router = APIRouter(dependencies=[Depends(require_open_surface_enabled)])

class TenantCreate(BaseModel):
    name: str
    region: str = "global"
    plan: str = "starter"

class JobCreate(BaseModel):
    tenant_id: int
    designation: str
    industry: str = "General"
    location: str = "Remote"
    seniority: str = "Mid"
    budget: str | None = None
    requirement: dict = Field(default_factory=dict)

class CandidateCreate(BaseModel):
    tenant_id: int | None = None
    full_name: str
    email: EmailStr
    phone: str | None = None
    location: str | None = None
    consent_status: str = "unknown"
    profile: dict = Field(default_factory=dict)

@data_router.post("/tenants")
def create_tenant(payload: TenantCreate, db: Session = Depends(get_db)):
    tenant = Tenant(name=payload.name, region=payload.region, plan=payload.plan)
    db.add(tenant)
    db.commit()
    db.refresh(tenant)
    create_audit_log(db, action="tenant_created", entity_type="tenant", entity_id=str(tenant.id), tenant_id=tenant.id, payload=payload.model_dump())
    return {"id": tenant.id, "name": tenant.name, "region": tenant.region, "plan": tenant.plan, "status": tenant.status, "mode": "development_only"}

@data_router.get("/tenants/{tenant_id}")
def get_tenant(tenant_id: int, db: Session = Depends(get_db)):
    tenant = db.get(Tenant, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return {"id": tenant.id, "name": tenant.name, "region": tenant.region, "plan": tenant.plan, "status": tenant.status, "mode": "development_only"}

@data_router.post("/jobs")
def create_job(payload: JobCreate, db: Session = Depends(get_db)):
    job = JobRequest(
        tenant_id=payload.tenant_id,
        designation=payload.designation,
        industry=payload.industry,
        location=payload.location,
        seniority=payload.seniority,
        budget=payload.budget,
        requirement_json=json.dumps(payload.requirement),
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    path = build_assessment_path({**payload.requirement, "designation": payload.designation, "industry": payload.industry, "location": payload.location, "seniority": payload.seniority, "budget": payload.budget})
    assessment = Assessment(tenant_id=payload.tenant_id, job_id=job.id, path_json=json.dumps(path), status="path_generated")
    db.add(assessment)
    db.commit()
    create_audit_log(db, action="job_created", entity_type="job_request", entity_id=str(job.id), tenant_id=payload.tenant_id, payload={"assessment_path": path})
    return {"job_id": job.id, "assessment_id": assessment.id, "assessment_path": path, "status": job.status, "mode": "development_only"}

@data_router.get("/jobs/{job_id}")
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.get(JobRequest, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"id": job.id, "tenant_id": job.tenant_id, "designation": job.designation, "industry": job.industry, "location": job.location, "seniority": job.seniority, "budget": job.budget, "status": job.status, "requirement": json.loads(job.requirement_json or "{}"), "mode": "development_only"}

@data_router.post("/candidates")
def create_candidate(payload: CandidateCreate, db: Session = Depends(get_db)):
    candidate = Candidate(
        tenant_id=payload.tenant_id,
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        location=payload.location,
        consent_status=payload.consent_status,
        profile_json=json.dumps(payload.profile),
    )
    db.add(candidate)
    db.commit()
    db.refresh(candidate)
    create_audit_log(db, action="candidate_created", entity_type="candidate", entity_id=str(candidate.id), tenant_id=payload.tenant_id, payload={"consent_status": payload.consent_status})
    return {"candidate_id": candidate.id, "full_name": candidate.full_name, "email": candidate.email, "consent_status": candidate.consent_status, "mode": "development_only"}
