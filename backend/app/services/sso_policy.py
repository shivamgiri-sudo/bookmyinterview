from __future__ import annotations
from typing import Any

SSO_PROVIDERS = [
    {"key": "clerk", "name": "Clerk", "model": "hosted_auth", "cost": "plan_dependent", "recommended_for": "fast SaaS launch"},
    {"key": "auth0", "name": "Auth0", "model": "hosted_auth", "cost": "plan_dependent", "recommended_for": "enterprise SSO"},
    {"key": "okta", "name": "Okta", "model": "enterprise_sso", "cost": "paid_enterprise", "recommended_for": "large enterprise clients"},
    {"key": "keycloak", "name": "Keycloak", "model": "self_hosted", "cost": "free_self_host", "recommended_for": "cost-controlled enterprise auth"},
    {"key": "custom_jwt", "name": "Custom JWT", "model": "internal", "cost": "free_self_host", "recommended_for": "MVP and controlled pilots"},
]

ROLE_MATRIX = {
    "superadmin": ["all_platform", "integration_vault", "cost_control", "billing", "tenant_admin"],
    "platform_admin": ["tenant_admin", "job_admin", "review_queue", "compliance_view"],
    "client_admin": ["client_workspace", "job_create", "candidate_view", "interview_booking"],
    "hiring_manager": ["candidate_view", "scorecard_view", "interview_booking"],
    "candidate": ["own_profile", "own_assessment", "own_booking"],
    "auditor": ["audit_view", "compliance_view", "export_reports"],
}


def list_sso_options() -> dict[str, Any]:
    return {"providers": SSO_PROVIDERS, "role_matrix": ROLE_MATRIX, "default_recommendation": "custom_jwt for MVP, Keycloak for free self-host enterprise pilots, Auth0/Okta for enterprise deals"}


def evaluate_sso_provider(payload: dict[str, Any]) -> dict[str, Any]:
    provider_key = payload.get("provider_key", "custom_jwt")
    provider = next((item for item in SSO_PROVIDERS if item["key"] == provider_key), None)
    if not provider:
        return {"allowed": False, "decision": "unknown_provider"}
    enterprise_required = bool(payload.get("enterprise_client", False))
    cost_sensitive = bool(payload.get("cost_sensitive", True))
    if cost_sensitive and provider["cost"].startswith("paid"):
        return {"allowed": False, "decision": "hold_for_budget", "provider": provider}
    if enterprise_required and provider_key in ["custom_jwt"]:
        return {"allowed": True, "decision": "allowed_for_pilot_only", "provider": provider, "upgrade_required": "SSO/SAML/OIDC before enterprise production"}
    return {"allowed": True, "decision": "enable", "provider": provider}
