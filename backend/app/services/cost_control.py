from __future__ import annotations
from typing import Any

PROVIDER_COST_MATRIX = [
    {"key": "local_mcp", "name": "Self-hosted MCP servers", "category": "MCP", "cost_model": "free_self_host", "free_default": True, "notes": "Protocol/server can be self-hosted; infra cost still applies."},
    {"key": "postgres", "name": "PostgreSQL", "category": "Database", "cost_model": "free_self_host_or_managed_paid", "free_default": True, "notes": "Use local/Postgres container first; managed cloud later."},
    {"key": "pgvector", "name": "pgvector", "category": "Vector Search", "cost_model": "free_open_source", "free_default": True, "notes": "Preferred MVP vector option before Pinecone/Qdrant Cloud."},
    {"key": "qdrant_local", "name": "Qdrant local", "category": "Vector Search", "cost_model": "free_self_host", "free_default": True, "notes": "Self-host for MVP; cloud may be paid."},
    {"key": "openai", "name": "OpenAI", "category": "LLM", "cost_model": "usage_paid", "free_default": False, "notes": "Use only behind budget limits and model routing."},
    {"key": "claude", "name": "Claude", "category": "LLM", "cost_model": "usage_paid", "free_default": False, "notes": "Use for premium reasoning only when enabled."},
    {"key": "gemini", "name": "Gemini", "category": "LLM", "cost_model": "usage_or_free_tier", "free_default": False, "notes": "May offer free tier; verify current quotas before production."},
    {"key": "apify", "name": "Apify", "category": "Web Data", "cost_model": "free_tier_then_paid", "free_default": False, "notes": "Use only approved actors with hard spend caps."},
    {"key": "figma", "name": "Figma / Dev Mode MCP", "category": "Design", "cost_model": "plan_dependent", "free_default": False, "notes": "Design access may depend on Figma plan."},
    {"key": "whatsapp", "name": "WhatsApp Business Platform", "category": "Communication", "cost_model": "usage_paid", "free_default": False, "notes": "Use email fallback until WhatsApp spend is justified."},
    {"key": "sendgrid_ses", "name": "Email provider", "category": "Communication", "cost_model": "free_tier_then_paid", "free_default": False, "notes": "Start with SMTP/dev mailbox; enable provider later."},
    {"key": "razorpay_stripe", "name": "Payment gateway", "category": "Billing", "cost_model": "transaction_fee", "free_default": False, "notes": "No monthly required in some cases, but transaction fees apply."},
    {"key": "s3_gcs", "name": "Object storage", "category": "Storage", "cost_model": "usage_paid", "free_default": False, "notes": "Use local/minio for MVP; cloud storage later."},
]

DEFAULT_BUDGET_POLICY = {
    "monthly_platform_budget_usd": 100,
    "llm_monthly_cap_usd": 25,
    "web_data_monthly_cap_usd": 10,
    "communication_monthly_cap_usd": 15,
    "storage_monthly_cap_usd": 10,
    "default_mode": "free_first",
    "require_superadmin_approval_for_paid_provider": True,
    "disable_provider_when_cap_reached": True,
}


def list_provider_costs() -> dict[str, Any]:
    free_first = [item for item in PROVIDER_COST_MATRIX if item["free_default"]]
    paid_or_plan = [item for item in PROVIDER_COST_MATRIX if not item["free_default"]]
    return {"policy": DEFAULT_BUDGET_POLICY, "free_first_stack": free_first, "paid_or_plan_dependent_stack": paid_or_plan, "all_providers": PROVIDER_COST_MATRIX}


def evaluate_provider_enablement(payload: dict[str, Any]) -> dict[str, Any]:
    key = payload.get("provider_key")
    projected_monthly_usd = float(payload.get("projected_monthly_usd", 0) or 0)
    provider = next((item for item in PROVIDER_COST_MATRIX if item["key"] == key), None)
    if provider is None:
        return {"allowed": False, "decision": "unknown_provider", "reason": "Provider is not in the cost matrix."}
    needs_approval = (not provider["free_default"]) or projected_monthly_usd > 0
    allowed = provider["free_default"] or payload.get("superadmin_approved") is True
    return {
        "provider": provider,
        "projected_monthly_usd": projected_monthly_usd,
        "needs_superadmin_approval": needs_approval,
        "allowed": allowed,
        "decision": "enable" if allowed else "hold_for_approval",
        "recommended_control": "hard_budget_cap_and_usage_alerts" if needs_approval else "standard_logging",
    }
