from __future__ import annotations
from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.security import create_access_token
from app.db.session import Base, engine, get_db
from app.db.models import User
from app.db.lifecycle_models import SessionGrant, SessionBlock
from app.services.db_lifecycle import create_session_grant, read_session_grant, revoke_session_grant, block_access_value

Base.metadata.create_all(bind=engine)
session_db_router = APIRouter()

class GrantPayload(BaseModel):
    value: str

class ClosePayload(BaseModel):
    value: str | None = None

@session_db_router.post("/exchange")
def exchange(payload: GrantPayload, db: Session = Depends(get_db)):
    grant = read_session_grant(db, payload.value)
    if not grant:
        raise HTTPException(status_code=401, detail="Invalid grant")
    user = db.query(User).filter(User.email == grant.email).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Inactive account")
    return {"access_token": create_access_token(user.email, user.role, user.tenant_id), "grant": payload.value, "token_type": "bearer"}

@session_db_router.post("/close")
def close(payload: ClosePayload, authorization: str | None = Header(default=None), db: Session = Depends(get_db)):
    access_value = authorization.split(" ", 1)[1] if authorization and authorization.lower().startswith("bearer ") else None
    block_access_value(db, access_value)
    revoke_session_grant(db, payload.value)
    return {"status": "closed", "store": "database"}
