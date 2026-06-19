from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import Base, engine, get_db
from app.db.models import AuditLog

Base.metadata.create_all(bind=engine)

event_router = APIRouter()

@event_router.get("/events")
def list_events(tenant_id: int | None = None, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(AuditLog)
    if tenant_id is not None:
        query = query.filter(AuditLog.tenant_id == tenant_id)
    rows = query.order_by(AuditLog.created_at.desc()).limit(min(limit, 250)).all()
    return [
        {
            "event_id": row.id,
            "tenant_id": row.tenant_id,
            "actor_role": row.actor_role,
            "entity_type": row.entity_type,
            "entity_id": row.entity_id,
            "action": row.action,
            "risk_level": row.risk_level,
            "created_at": row.created_at.isoformat() if row.created_at else None,
        }
        for row in rows
    ]

@event_router.get("/events/summary")
def event_summary(tenant_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(AuditLog)
    if tenant_id is not None:
        query = query.filter(AuditLog.tenant_id == tenant_id)
    rows = query.limit(1000).all()
    by_risk: dict[str, int] = {}
    for row in rows:
        by_risk[row.risk_level] = by_risk.get(row.risk_level, 0) + 1
    return {"total_events": len(rows), "by_risk": by_risk}
