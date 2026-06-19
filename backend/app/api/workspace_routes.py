from __future__ import annotations
import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.route_policy import require_open_surface_enabled
from app.db.session import Base, engine, get_db
from app.db.models import Tenant, JobRequest, Candidate, Assessment

Base.metadata.create_all(bind=engine)

workspace_router = APIRouter(dependencies=[Depends(require_open_surface_enabled)])

@workspace_router.get("/overview")
def overview(db: Session = Depends(get_db)):
    tenant_count = db.query(Tenant).count()
    job_count = db.query(JobRequest).count()
    candidate_count = db.query(Candidate).count()
    assessment_count = db.query(Assessment).count()
    return {"tenants": tenant_count, "jobs": job_count, "candidates": candidate_count, "assessments": assessment_count, "mode": "development_only"}

@workspace_router.get("/jobs")
def jobs(tenant_id: int | None = None, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(JobRequest)
    if tenant_id is not None:
        query = query.filter(JobRequest.tenant_id == tenant_id)
    rows = query.order_by(JobRequest.created_at.desc()).limit(min(limit, 250)).all()
    return [{"id": row.id, "tenant_id": row.tenant_id, "designation": row.designation, "industry": row.industry, "location": row.location, "seniority": row.seniority, "budget": row.budget, "status": row.status, "created_at": row.created_at.isoformat() if row.created_at else None} for row in rows]

@workspace_router.get("/talent")
def talent(tenant_id: int | None = None, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(Candidate)
    if tenant_id is not None:
        query = query.filter(Candidate.tenant_id == tenant_id)
    rows = query.order_by(Candidate.created_at.desc()).limit(min(limit, 250)).all()
    return [{"id": row.id, "tenant_id": row.tenant_id, "full_name": row.full_name, "location": row.location, "consent_status": row.consent_status, "created_at": row.created_at.isoformat() if row.created_at else None} for row in rows]

@workspace_router.get("/assessments")
def assessments(tenant_id: int | None = None, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(Assessment)
    if tenant_id is not None:
        query = query.filter(Assessment.tenant_id == tenant_id)
    rows = query.order_by(Assessment.created_at.desc()).limit(min(limit, 250)).all()
    return [{"id": row.id, "tenant_id": row.tenant_id, "job_id": row.job_id, "status": row.status, "path": json.loads(row.path_json or "{}"), "created_at": row.created_at.isoformat() if row.created_at else None} for row in rows]
