from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
from app.core.account_challenges import create_challenge, consume_challenge
from app.core.security import hash_password
from app.db.session import get_db
from app.db.models import User

account_router = APIRouter()

class StartPayload(BaseModel):
    email: EmailStr

class CompletePayload(BaseModel):
    challenge: str
    new_password: str = Field(min_length=8)

class VerifyPayload(BaseModel):
    challenge: str

@account_router.post("/recovery/start")
def recovery_start(payload: StartPayload, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    challenge = create_challenge(payload.email, "recovery") if user else None
    return {"status": "accepted", "challenge": challenge}

@account_router.post("/recovery/complete")
def recovery_complete(payload: CompletePayload, db: Session = Depends(get_db)):
    email = consume_challenge(payload.challenge, "recovery")
    if not email:
        raise HTTPException(status_code=400, detail="Invalid challenge")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"status": "updated"}

@account_router.post("/verify/start")
def verify_start(payload: StartPayload, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    challenge = create_challenge(payload.email, "verify", 86400) if user else None
    return {"status": "accepted", "challenge": challenge}

@account_router.post("/verify/complete")
def verify_complete(payload: VerifyPayload, db: Session = Depends(get_db)):
    email = consume_challenge(payload.challenge, "verify")
    if not email:
        raise HTTPException(status_code=400, detail="Invalid challenge")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"status": "verified", "email": user.email}
