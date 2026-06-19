from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.db.session import Base, engine, get_db
from app.db.models import Candidate
from app.services.audit import create_audit_log
from app.services.global_policy_engine import evaluate_global_policy

Base.metadata.create_all(bind=engine)

consent_router = APIRouter()

class ConsentPayload(BaseModel):
    candidate_email: EmailStr
    tenant_id: int | None = None
    consent_status: str = "granted"
    region: str = "global"
    source_type: str = "internal"
    source_approved: bool = True

@consent_router.post("/candidate")
def update_candidate_consent(payload: ConsentPayload, db: Session = Depends(get_db)):
    query = db.query(Candidate).filter(Candidate.email == payload.candidate_email)
    if payload.tenant_id is not None:
        query = query.filter(Candidate.tenant_id == payload.tenant_id)
    candidate = query.first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    candidate.consent_status = payload.consent_status
    db.commit()
    policy_result = evaluate_global_policy(payload.model_dump())
    create_audit_log(db, action="candidate_consent_updated", entity_type="candidate", entity_id=str(candidate.id), tenant_id=candidate.tenant_id, risk_level="medium", payload={"consent_status": payload.consent_status, "policy_result": policy_result})
    return {"candidate_id": candidate.id, "email": candidate.email, "consent_status": candidate.consent_status, "policy_result": policy_result}
