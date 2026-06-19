from __future__ import annotations
from dataclasses import dataclass
from jose import JWTError, jwt
from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session
from app.core.config import get_settings
from app.core.security import has_permission
from app.core.token_store import is_access_token_revoked
from app.db.session import get_db
from app.db.models import User

settings = get_settings()

@dataclass
class SessionContext:
    user: User
    role: str
    tenant_id: int | None


def load_user(authorization: str | None = Header(default=None), db: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Session required")
    token = authorization.split(" ", 1)[1]
    if is_access_token_revoked(token):
        raise HTTPException(status_code=401, detail="Session revoked")
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        email = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Session invalid")
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Session inactive")
    return user


def load_context(user: User = Depends(load_user)) -> SessionContext:
    return SessionContext(user=user, role=user.role, tenant_id=user.tenant_id)


def require_capability(capability: str):
    def checker(ctx: SessionContext = Depends(load_context)) -> SessionContext:
        if not has_permission(ctx.role, capability):
            raise HTTPException(status_code=403, detail="Capability required")
        return ctx
    return checker


def tenant_scope(requested: int | None, ctx: SessionContext) -> int | None:
    if ctx.role in {"superadmin", "platform_admin", "auditor"}:
        return requested
    if requested is not None and ctx.tenant_id is not None and requested != ctx.tenant_id:
        raise HTTPException(status_code=403, detail="Tenant scope mismatch")
    return ctx.tenant_id if requested is None else requested
