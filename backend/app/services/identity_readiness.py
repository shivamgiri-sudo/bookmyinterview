from __future__ import annotations


def identity_readiness() -> dict:
    checks = [
        {"key": "provider", "label": "Provider selected", "status": "ready"},
        {"key": "issuer", "label": "Issuer configured", "status": "pending"},
        {"key": "client", "label": "Client configured", "status": "pending"},
        {"key": "callback", "label": "Callback configured", "status": "pending"},
        {"key": "role_map", "label": "Role mapping configured", "status": "pending"},
    ]
    return {"enabled": False, "provider": "keycloak", "checks": checks, "next_step": "configure issuer, client, callback, and role mapping"}
