from __future__ import annotations
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import Base, engine, get_db
from app.db.models import User  # ensure base metadata includes core tables
from app.db.review_models import HumanReviewQueue
from app.services.audit import create_audit_log

Base.metadata.create_all(bind=engine)

review_router = APIRouter()

class ReviewCreate(BaseModel):
    tenant_id: int | None = None
    entity_type: str
    entity_id: str | None = None
    review_type: str
    priority: str = "normal"
    reason: str

class ReviewDecision(BaseModel):
    decision: str
    decision_reason: str
    actor_id: int | None = None
    actor_role: str = "platform_admin"

@review_router.post("/queue")
def create_review(payload: ReviewCreate, db: Session = Depends(get_db)):
    item = HumanReviewQueue(
        tenant_id=payload.tenant_id,
        entity_type=payload.entity_type,
        entity_id=payload.entity_id,
        review_type=payload.review_type,
        priority=payload.priority,
        reason=payload.reason,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    create_audit_log(db, action="human_review_created", entity_type=payload.entity_type, entity_id=payload.entity_id, tenant_id=payload.tenant_id, risk_level="medium", payload=payload.model_dump())
    return {"review_id": item.id, "status": item.status, "priority": item.priority}

@review_router.get("/queue")
def list_reviews(status: str = "open", tenant_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(HumanReviewQueue).filter(HumanReviewQueue.status == status)
    if tenant_id is not None:
        query = query.filter(HumanReviewQueue.tenant_id == tenant_id)
    items = query.order_by(HumanReviewQueue.created_at.desc()).limit(100).all()
    return [{"review_id": item.id, "entity_type": item.entity_type, "entity_id": item.entity_id, "review_type": item.review_type, "priority": item.priority, "reason": item.reason, "status": item.status} for item in items]

@review_router.post("/queue/{review_id}/resolve")
def resolve_review(review_id: int, payload: ReviewDecision, db: Session = Depends(get_db)):
    item = db.get(HumanReviewQueue, review_id)
    if not item:
        raise HTTPException(status_code=404, detail="Review item not found")
    item.status = "resolved"
    item.decision = payload.decision
    item.decision_reason = payload.decision_reason
    item.resolved_at = datetime.now(timezone.utc)
    db.commit()
    create_audit_log(db, action="human_review_resolved", entity_type=item.entity_type, entity_id=item.entity_id, actor_id=payload.actor_id, actor_role=payload.actor_role, tenant_id=item.tenant_id, risk_level="high", payload=payload.model_dump())
    return {"review_id": item.id, "status": item.status, "decision": item.decision}
