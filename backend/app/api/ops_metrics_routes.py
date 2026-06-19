from __future__ import annotations
import csv
import io
import json
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from app.core.session_context import SessionContext, require_capability
from app.db.session import Base, engine, get_db
from app.db.models import AuditLog
from app.db.lifecycle_models import AccountChallenge, SessionGrant, SessionBlock

Base.metadata.create_all(bind=engine)
ops_metrics_router = APIRouter()

PRESETS = [
    {"key": "last_7_high", "label": "Last 7 days high risk", "filters": {"days": 7, "risk": "high"}},
    {"key": "last_30_all", "label": "Last 30 days all events", "filters": {"days": 30}},
    {"key": "system_activity", "label": "System activity", "filters": {"days": 30, "action": "user_login"}},
]
ALERT_RULES = [
    {"key": "high_risk_volume", "level": "high", "threshold": 3, "metric": "high_risk_audit_events"},
    {"key": "blocked_volume", "level": "medium", "threshold": 3, "metric": "blocked_sessions"},
]

def since_window(days: int | None):
    if not days:
        return None
    return datetime.now(timezone.utc) - timedelta(days=max(1, min(days, 365)))

def apply_audit_filters(query, tenant_id: int | None, action: str | None, risk: str | None, days: int | None):
    since = since_window(days)
    if tenant_id is not None:
        query = query.filter(AuditLog.tenant_id == tenant_id)
    if action:
        query = query.filter(AuditLog.action == action)
    if risk:
        query = query.filter(AuditLog.risk_level == risk)
    if since is not None:
        query = query.filter(AuditLog.created_at >= since)
    return query

def serialize_event(row: AuditLog) -> dict:
    return {"id": row.id, "tenant_id": row.tenant_id, "actor_id": row.actor_id, "actor_role": row.actor_role, "action": row.action, "entity_type": row.entity_type, "entity_id": row.entity_id, "risk_level": row.risk_level, "payload": json.loads(row.payload_json or "{}"), "created_at": row.created_at.isoformat() if row.created_at else None}

def csv_text(rows: list[AuditLog]) -> str:
    out = io.StringIO()
    writer = csv.DictWriter(out, fieldnames=["id", "tenant_id", "actor_id", "actor_role", "action", "entity_type", "entity_id", "risk_level", "created_at"])
    writer.writeheader()
    for row in rows:
        writer.writerow({"id": row.id, "tenant_id": row.tenant_id, "actor_id": row.actor_id, "actor_role": row.actor_role, "action": row.action, "entity_type": row.entity_type, "entity_id": row.entity_id, "risk_level": row.risk_level, "created_at": row.created_at.isoformat() if row.created_at else None})
    return out.getvalue()

@ops_metrics_router.get("/presets")
def presets(ctx: SessionContext = Depends(require_capability("audit:read"))):
    return {"role": ctx.role, "presets": PRESETS, "alert_rules": ALERT_RULES}

@ops_metrics_router.get("/events/{event_id}")
def event_detail(event_id: int, ctx: SessionContext = Depends(require_capability("audit:read")), db: Session = Depends(get_db)):
    row = db.get(AuditLog, event_id)
    if not row:
        raise HTTPException(status_code=404, detail="Event not found")
    return serialize_event(row)

@ops_metrics_router.get("/export", response_class=PlainTextResponse)
def export_events(tenant_id: int | None = None, action: str | None = None, risk: str | None = None, days: int | None = 30, ctx: SessionContext = Depends(require_capability("audit:read")), db: Session = Depends(get_db)):
    rows = apply_audit_filters(db.query(AuditLog), tenant_id, action, risk, days).order_by(AuditLog.created_at.desc()).limit(1000).all()
    return csv_text(rows)

@ops_metrics_router.get("/summary")
def summary(tenant_id: int | None = None, action: str | None = None, risk: str | None = None, days: int | None = 30, ctx: SessionContext = Depends(require_capability("audit:read")), db: Session = Depends(get_db)):
    audit_query = apply_audit_filters(db.query(AuditLog), tenant_id, action, risk, days)
    latest = audit_query.order_by(AuditLog.created_at.desc()).limit(25).all()
    challenge_query = db.query(AccountChallenge)
    grant_query = db.query(SessionGrant)
    block_query = db.query(SessionBlock)
    since = since_window(days)
    if since is not None:
        challenge_query = challenge_query.filter(AccountChallenge.created_at >= since)
        grant_query = grant_query.filter(SessionGrant.created_at >= since)
        block_query = block_query.filter(SessionBlock.created_at >= since)
    high_risk_count = apply_audit_filters(db.query(AuditLog), tenant_id, action, "high", days).count()
    blocked_count = block_query.count()
    alerts = []
    if high_risk_count >= 3:
        alerts.append({"level": "high", "title": "High risk audit volume", "count": high_risk_count})
    if blocked_count >= 3:
        alerts.append({"level": "medium", "title": "Blocked session volume", "count": blocked_count})
    return {"role": ctx.role, "filters": {"tenant_id": tenant_id, "action": action, "risk": risk, "days": days}, "audit_events": audit_query.count(), "account_challenges": challenge_query.count(), "session_grants": grant_query.count(), "blocked_sessions": blocked_count, "alerts": alerts, "presets": PRESETS, "alert_rules": ALERT_RULES, "latest_events": [serialize_event(row) for row in latest]}
