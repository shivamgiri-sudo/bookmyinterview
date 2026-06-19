from __future__ import annotations
from datetime import datetime, timedelta, timezone
from secrets import token_urlsafe
from sqlalchemy.orm import Session
from app.db.lifecycle_models import AccountChallenge, SessionGrant, SessionBlock


def now() -> datetime:
    return datetime.now(timezone.utc)


def create_account_challenge(db: Session, email: str, purpose: str, ttl_minutes: int = 30) -> str:
    value = token_urlsafe(32)
    row = AccountChallenge(challenge_value=value, email=email, purpose=purpose, expires_at=now() + timedelta(minutes=ttl_minutes))
    db.add(row)
    db.commit()
    return value


def consume_account_challenge(db: Session, value: str, purpose: str) -> str | None:
    row = db.query(AccountChallenge).filter(AccountChallenge.challenge_value == value, AccountChallenge.purpose == purpose, AccountChallenge.used == False).first()
    if not row or row.expires_at < now():
        return None
    row.used = True
    db.commit()
    return row.email


def create_session_grant(db: Session, email: str, role: str, tenant_id: int | None, ttl_days: int = 7) -> str:
    value = token_urlsafe(48)
    row = SessionGrant(grant_value=value, email=email, role=role, tenant_id=tenant_id, expires_at=now() + timedelta(days=ttl_days))
    db.add(row)
    db.commit()
    return value


def read_session_grant(db: Session, value: str) -> SessionGrant | None:
    row = db.query(SessionGrant).filter(SessionGrant.grant_value == value, SessionGrant.revoked == False).first()
    if not row or row.expires_at < now():
        return None
    return row


def revoke_session_grant(db: Session, value: str | None) -> None:
    if not value:
        return
    row = db.query(SessionGrant).filter(SessionGrant.grant_value == value).first()
    if row:
        row.revoked = True
        db.commit()


def block_access_value(db: Session, value: str | None) -> None:
    if not value:
        return
    existing = db.query(SessionBlock).filter(SessionBlock.access_value == value).first()
    if not existing:
        db.add(SessionBlock(access_value=value))
        db.commit()


def is_access_blocked(db: Session, value: str) -> bool:
    return db.query(SessionBlock).filter(SessionBlock.access_value == value).first() is not None
