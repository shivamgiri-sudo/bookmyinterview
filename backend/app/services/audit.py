from __future__ import annotations
import json
from typing import Any
from sqlalchemy.orm import Session
from app.db.models import AuditLog

def create_audit_log(
    db: Session | None,
    *,
    action: str,
    entity_type: str,
    entity_id: str | None = None,
    actor_id: int | None = None,
    actor_role: str = "system",
    tenant_id: int | None = None,
    risk_level: str = "low",
    payload: dict[str, Any] | None = None,
) -> dict[str, Any]:
    data = {
        "action": action,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "actor_id": actor_id,
        "actor_role": actor_role,
        "tenant_id": tenant_id,
        "risk_level": risk_level,
        "payload": payload or {},
    }
    if db is None:
        return {"persisted": False, **data}
    log = AuditLog(
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        actor_id=actor_id,
        actor_role=actor_role,
        tenant_id=tenant_id,
        risk_level=risk_level,
        payload_json=json.dumps(payload or {}),
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return {"persisted": True, "audit_id": log.id, **data}
