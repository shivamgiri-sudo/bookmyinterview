from __future__ import annotations
from secrets import token_urlsafe
from time import time

CHALLENGES: dict[str, dict] = {}


def create_challenge(email: str, purpose: str, ttl_seconds: int = 1800) -> str:
    value = token_urlsafe(32)
    CHALLENGES[value] = {"email": email, "purpose": purpose, "expires_at": time() + ttl_seconds}
    return value


def consume_challenge(value: str, purpose: str) -> str | None:
    data = CHALLENGES.get(value)
    if not data or data["purpose"] != purpose or data["expires_at"] < time():
        CHALLENGES.pop(value, None)
        return None
    CHALLENGES.pop(value, None)
    return data["email"]
