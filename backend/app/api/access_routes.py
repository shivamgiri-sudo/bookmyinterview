from __future__ import annotations
from fastapi import APIRouter
from pydantic import BaseModel, EmailStr
from app.core.security import create_access_token, has_permission

access_router = APIRouter()

class DemoSessionPayload(BaseModel):
    email: EmailStr
    role: str = "client_admin"
    tenant_id: int | None = 1

class PermissionPayload(BaseModel):
    role: str
    permission: str

@access_router.post("/demo-session")
def create_demo_session(payload: DemoSessionPayload):
    token = create_access_token(payload.email, payload.role, payload.tenant_id)
    return {
        "email": payload.email,
        "tenant_id": payload.tenant_id,
        "role": payload.role,
        "access_token": token,
        "token_type": "bearer",
        "note": "Demo session only. Production should connect SSO/Auth0/Clerk/Okta or full credential auth."
    }

@access_router.post("/permission-check")
def permission_check(payload: PermissionPayload):
    return {"role": payload.role, "permission": payload.permission, "allowed": has_permission(payload.role, payload.permission)}
