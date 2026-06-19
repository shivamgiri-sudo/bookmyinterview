from __future__ import annotations
from typing import Any

REGION_POLICIES = {
    "global": {
        "consent_required": True,
        "human_review_for_rejection": True,
        "protected_attribute_scoring_allowed": False,
        "web_data_requires_source_approval": True,
        "retention_days": 365,
    },
    "eu": {
        "consent_required": True,
        "human_review_for_rejection": True,
        "protected_attribute_scoring_allowed": False,
        "web_data_requires_source_approval": True,
        "data_export_delete_required": True,
        "retention_days": 180,
    },
    "us": {
        "consent_required": True,
        "human_review_for_rejection": True,
        "protected_attribute_scoring_allowed": False,
        "adverse_action_review_required": True,
        "retention_days": 365,
    },
    "india": {
        "consent_required": True,
        "human_review_for_rejection": True,
        "protected_attribute_scoring_allowed": False,
        "dpdp_notice_required": True,
        "retention_days": 365,
    },
    "uae": {
        "consent_required": True,
        "human_review_for_rejection": True,
        "protected_attribute_scoring_allowed": False,
        "cross_border_review_required": True,
        "retention_days": 365,
    },
}

PROTECTED_ATTRIBUTES = ["age", "gender", "religion", "caste", "marital", "disability", "health", "pregnancy", "political"]


def get_region_policy(region: str = "global") -> dict[str, Any]:
    return REGION_POLICIES.get(region.lower(), REGION_POLICIES["global"])


def evaluate_global_policy(payload: dict[str, Any]) -> dict[str, Any]:
    region = str(payload.get("region", "global")).lower()
    policy = get_region_policy(region)
    text = " ".join(str(value).lower() for value in payload.values())
    protected_found = [term for term in PROTECTED_ATTRIBUTES if term in text]
    violations = []
    required_actions = ["audit_log"]
    if policy.get("consent_required") and payload.get("consent_status") not in ["granted", "not_required"]:
        violations.append("Consent requirement not satisfied")
        required_actions.append("collect_consent")
    if protected_found:
        violations.append("Protected attribute detected")
        required_actions.append("remove_protected_attribute")
    if payload.get("source_type") in ["web_data", "scraped"] and policy.get("web_data_requires_source_approval") and not payload.get("source_approved"):
        violations.append("Web data source approval required")
        required_actions.append("source_approval")
    if payload.get("decision") == "reject" and policy.get("human_review_for_rejection"):
        required_actions.append("human_review")
    return {
        "region": region,
        "policy": policy,
        "allowed": len(violations) == 0,
        "violations": violations,
        "required_actions": sorted(set(required_actions)),
        "decision": "block" if violations else "allow_with_controls",
    }
