from __future__ import annotations
from jose import JWTError, jwt
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
from app.core.config import get_settings
from app.core.security import create_access_token, hash_password, verify_password, has_permission, ROLE_PERMISSIONS
from app.core.token_store import issue_refresh_token, use_refresh_token, revoke_refresh_token, revoke_access_token, is_access_token_revoked
from app.db.session import Base, engine, get_db
from app.db.models import Tenant, User
from app.services.audit import create_audit_log

Base.metadata.create_all(bind=engine)
settings = get_settings()
auth_router = APIRouter()

class RegisterPayload(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "client_admin"
    tenant_id: int | None = None
    tenant_name: str | None = None
    tenant_region: str = "global"
    password: str = Field(min_length=8)

class LoginPayload(BaseModel):
    email: EmailStr
    password: str

class PermissionPayload(BaseModel):
    permission: str

class RefreshPayload(BaseModel):
    refresh_token: str

class LogoutPayload(BaseModel):
    refresh_token: str | None = None

SAFE_ROLES = {"superadmin", "platform_admin", "client_admin", "hiring_manager", "candidate", "auditor"}

def public_user(user: User) -> dict:
    return {"id": user.id, "email": user.email, "full_name": user.full_name, "role": user.role, "tenant_id": user.tenant_id, "is_active": user.is_active, "permissions": ROLE_PERMISSIONS.get(user.role, [])}

def session_response(user: User) -> dict:
    return {"user": public_user(user), "access_token": create_access_token(user.email, user.role, user.tenant_id), "refresh_token": issue_refresh_token(user.email, user.role, user.tenant_id), "token_type": "bearer"}

def current_user(authorization: str | None = Header(default=None), db: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.split(" ", 1)[1]
    if is_access_token_revoked(token):
        raise HTTPException(status_code=401, detail="Token revoked")
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        email = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Inactive or unknown user")
    return user

@auth_router.post("/register")
def register(payload: RegisterPayload, db: Session = Depends(get_db)):
    if payload.role not in SAFE_ROLES:
        raise HTTPException(status_code=400, detail="Unsupported role")
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="User already exists")
    tenant_id = payload.tenant_id
    if tenant_id is None and payload.tenant_name:
        tenant = Tenant(name=payload.tenant_name, region=payload.tenant_region, plan="starter")
        db.add(tenant)
        db.commit()
        db.refresh(tenant)
        tenant_id = tenant.id
    user = User(tenant_id=tenant_id, email=payload.email, full_name=payload.full_name, role=payload.role, password_hash=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    create_audit_log(db, action="user_registered", entity_type="user", entity_id=str(user.id), actor_role=payload.role, tenant_id=tenant_id, risk_level="medium", payload={"role": payload.role})
    return session_response(user)

@auth_router.post("/login")
def login(payload: LoginPayload, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=401, detail="Inactive user")
    create_audit_log(db, action="user_login", entity_type="user", entity_id=str(user.id), actor_id=user.id, actor_role=user.role, tenant_id=user.tenant_id, risk_level="low", payload={"role": user.role})
    return session_response(user)

@auth_router.post("/refresh")
def refresh(payload: RefreshPayload, db: Session = Depends(get_db)):
    data = use_refresh_token(payload.refresh_token)
    if not data:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user = db.query(User).filter(User.email == data["email"]).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Inactive or unknown user")
    return {"user": public_user(user), "access_token": create_access_token(user.email, user.role, user.tenant_id), "refresh_token": payload.refresh_token, "token_type": "bearer"}

@auth_router.post("/logout")
def logout(payload: LogoutPayload, authorization: str | None = Header(default=None)):
    token = authorization.split(" ", 1)[1] if authorization and authorization.lower().startswith("bearer ") else None
    revoke_access_token(token)
    revoke_refresh_token(payload.refresh_token)
    return {"status": "logged_out"}

@auth_router.get("/me")
def me(user: User = Depends(current_user)):
    return {"user": public_user(user)}

@auth_router.post("/permission")
def permission(payload: PermissionPayload, user: User = Depends(current_user)):
    return {"role": user.role, "permission": payload.permission, "allowed": has_permission(user.role, payload.permission)}

@auth_router.get("/roles")
def roles():
    return {"roles": ROLE_PERMISSIONS}
