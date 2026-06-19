from __future__ import annotations
from datetime import datetime, timedelta, timezone
from typing import Any
from jose import jwt
from passlib.context import CryptContext
from cryptography.fernet import Fernet, InvalidToken
from app.core.config import get_settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
settings = get_settings()

ROLE_PERMISSIONS = {
    "superadmin": ["*"],
    "platform_admin": ["tenant:read", "tenant:write", "job:*", "candidate:*", "assessment:*", "integration:read"],
    "client_admin": ["job:*", "candidate:read", "assessment:read", "interview:*"],
    "hiring_manager": ["job:read", "candidate:read", "assessment:read", "interview:*"],
    "candidate": ["candidate:self", "assessment:self", "interview:self"],
    "auditor": ["audit:read", "compliance:read"],
}

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)

def create_access_token(subject: str, role: str, tenant_id: int | None = None, expires_minutes: int | None = None) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes or settings.access_token_expire_minutes)
    payload: dict[str, Any] = {"sub": subject, "role": role, "tenant_id": tenant_id, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)

def has_permission(role: str, permission: str) -> bool:
    allowed = ROLE_PERMISSIONS.get(role, [])
    return "*" in allowed or permission in allowed or any(item.endswith(":*") and permission.startswith(item[:-1]) for item in allowed)

def _fernet() -> Fernet:
    # Production should load a real Fernet key or use KMS/Vault envelope encryption.
    seed = settings.encryption_key.encode("utf-8")[:32].ljust(32, b"0")
    import base64
    key = base64.urlsafe_b64encode(seed)
    return Fernet(key)

def encrypt_secret(raw: str) -> str:
    return _fernet().encrypt(raw.encode("utf-8")).decode("utf-8")

def decrypt_secret(token: str) -> str | None:
    try:
        return _fernet().decrypt(token.encode("utf-8")).decode("utf-8")
    except InvalidToken:
        return None
