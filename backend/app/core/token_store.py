from __future__ import annotations
from secrets import token_urlsafe
from time import time

REFRESH_TOKENS: dict[str, dict] = {}
REVOKED_ACCESS_TOKENS: set[str] = set()


def issue_refresh_token(email: str, role: str, tenant_id: int | None, ttl_seconds: int = 60 * 60 * 24 * 7) -> str:
    token = token_urlsafe(48)
    REFRESH_TOKENS[token] = {"email": email, "role": role, "tenant_id": tenant_id, "expires_at": time() + ttl_seconds}
    return token


def use_refresh_token(token: str) -> dict | None:
    data = REFRESH_TOKENS.get(token)
    if not data or data["expires_at"] < time():
        REFRESH_TOKENS.pop(token, None)
        return None
    return data


def revoke_refresh_token(token: str | None) -> None:
    if token:
        REFRESH_TOKENS.pop(token, None)


def revoke_access_token(token: str | None) -> None:
    if token:
        REVOKED_ACCESS_TOKENS.add(token)


def is_access_token_revoked(token: str) -> bool:
    return token in REVOKED_ACCESS_TOKENS
