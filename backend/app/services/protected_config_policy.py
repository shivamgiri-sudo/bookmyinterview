from __future__ import annotations
from typing import Any

PROTECTION_OPTIONS = [
    {"key": "local_env", "name": "Local environment variables", "cost": "free", "production_grade": False, "use_case": "local development only"},
    {"key": "hashicorp_vault", "name": "HashiCorp Vault", "cost": "free_self_host_or_paid_cloud", "production_grade": True, "use_case": "enterprise configuration protection"},
    {"key": "aws_kms", "name": "AWS KMS + managed configuration store", "cost": "usage_paid", "production_grade": True, "use_case": "AWS deployments"},
    {"key": "gcp_kms", "name": "GCP KMS + managed configuration store", "cost": "usage_paid", "production_grade": True, "use_case": "GCP deployments"},
    {"key": "azure_key_vault", "name": "Azure Key Vault", "cost": "usage_paid", "production_grade": True, "use_case": "Microsoft enterprise deployments"},
]

PROTECTION_POLICY = {
    "store_plain_values": False,
    "show_masked_values_only": True,
    "rotate_high_risk_days": 90,
    "separate_sandbox_production": True,
    "log_every_config_event": True,
    "tenant_scoped_overrides": True,
    "superadmin_only_write": True,
}


def list_protection_options() -> dict[str, Any]:
    return {"protection_options": PROTECTION_OPTIONS, "protection_policy": PROTECTION_POLICY, "free_first_recommendation": "local_env for development, HashiCorp Vault self-host for cost-controlled pilots, cloud KMS for enterprise production"}


def evaluate_protection(payload: dict[str, Any]) -> dict[str, Any]:
    option_key = payload.get("protection_key", "local_env")
    option = next((item for item in PROTECTION_OPTIONS if item["key"] == option_key), None)
    if not option:
        return {"allowed": False, "decision": "unknown_protection_option"}
    production = bool(payload.get("production", False))
    if production and not option["production_grade"]:
        return {"allowed": False, "decision": "not_production_grade", "option": option, "recommendation": "Use HashiCorp Vault or a cloud KMS-backed option."}
    return {"allowed": True, "decision": "enable", "option": option, "policy": PROTECTION_POLICY}
