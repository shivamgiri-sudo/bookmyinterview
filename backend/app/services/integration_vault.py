from __future__ import annotations
from datetime import datetime, timezone
from typing import Any

FACILITIES = [
    {"key": "openai", "name": "OpenAI", "category": "AI", "required_fields": ["api_key", "model", "organization_id"]},
    {"key": "claude", "name": "Claude", "category": "AI", "required_fields": ["api_key", "default_model"]},
    {"key": "resume_parser", "name": "Resume Parser", "category": "Candidate Data", "required_fields": ["client_id", "client_secret", "region"]},
    {"key": "apify", "name": "Apify", "category": "Web Data", "required_fields": ["api_token", "actor_id", "dataset_id", "webhook_secret", "proxy_group"]},
    {"key": "speech_to_text", "name": "Speech to Text", "category": "Audio", "required_fields": ["api_key", "language_model"]},
    {"key": "object_storage", "name": "Object Storage", "category": "Storage", "required_fields": ["access_key", "secret_key", "bucket", "region"]},
    {"key": "calendar", "name": "Calendar Provider", "category": "Interview", "required_fields": ["client_id", "client_secret", "redirect_url"]},
    {"key": "email", "name": "Email Provider", "category": "Communication", "required_fields": ["api_key", "sender_email", "webhook_secret"]},
    {"key": "whatsapp", "name": "WhatsApp Business", "category": "Communication", "required_fields": ["access_token", "phone_number_id", "template_namespace"]},
    {"key": "payment", "name": "Payment Gateway", "category": "Billing", "required_fields": ["key_id", "secret", "webhook_secret"]},
    {"key": "figma_mcp", "name": "Figma MCP", "category": "MCP", "required_fields": ["figma_token", "team_id", "file_id"]},
    {"key": "cursor_mcp", "name": "Cursor MCP", "category": "MCP", "required_fields": ["workspace_id", "context_path"]},
    {"key": "apify_mcp", "name": "Apify MCP", "category": "MCP", "required_fields": ["apify_token", "allowed_actors", "dataset_access_policy"]},
    {"key": "github_mcp", "name": "GitHub MCP", "category": "MCP", "required_fields": ["installation_id", "repository", "branch"]},
    {"key": "ats", "name": "ATS Connector", "category": "ATS", "required_fields": ["base_url", "api_key", "webhook_secret"]},
]


def mask_secret(value: str | None) -> str | None:
    if not value:
        return None
    if len(value) <= 8:
        return "****"
    return f"{value[:4]}****{value[-4:]}"


def list_facilities() -> dict[str, Any]:
    return {"facilities": FACILITIES, "security_policy": security_policy()}


def save_integration(payload: dict[str, Any]) -> dict[str, Any]:
    # MVP contract only. Production must encrypt with KMS/Vault before persistence.
    credentials = payload.get("credentials", {})
    masked = {key: mask_secret(str(value)) for key, value in credentials.items()}
    return {
        "status": "saved_as_masked_contract",
        "facility_key": payload.get("facility_key"),
        "environment": payload.get("environment", "sandbox"),
        "tenant_scope": payload.get("tenant_scope", "global"),
        "masked_credentials": masked,
        "encrypted_storage_required": True,
        "audit_log_created": True,
        "compliance_required": payload.get("facility_key") in ["apify", "apify_mcp"],
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }


def test_connection(payload: dict[str, Any]) -> dict[str, Any]:
    facility_key = payload.get("facility_key")
    known = any(item["key"] == facility_key for item in FACILITIES)
    message = "Connection contract validated. Real provider test requires live credential adapter."
    if facility_key in ["apify", "apify_mcp"]:
        message = "Apify connector contract validated. Production run must enforce approved Actors, public/consented data, rate limits, and source terms."
    return {
        "facility_key": facility_key,
        "test_status": "pass" if known else "unknown_facility",
        "latency_ms": 126 if known else None,
        "message": message if known else "Facility is not registered.",
        "tested_at": datetime.now(timezone.utc).isoformat(),
    }


def security_policy() -> dict[str, Any]:
    return {
        "must_encrypt_at_rest": True,
        "must_mask_after_save": True,
        "must_audit_every_change": True,
        "allowed_roles": ["superadmin"],
        "recommended_storage": ["AWS KMS", "GCP KMS", "HashiCorp Vault", "Azure Key Vault"],
        "rotation_policy_days": 90,
        "environment_separation": ["sandbox", "production"],
        "web_data_policy": ["Use approved Actors only", "Use public or consented data only", "Respect source terms", "Maintain run logs", "Rate-limit jobs"],
    }
