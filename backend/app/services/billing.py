from __future__ import annotations
from typing import Any

GLOBAL_PLANS = [
    {
        "plan_key": "starter",
        "name": "Starter",
        "monthly_usd": 99,
        "included_jobs": 10,
        "included_assessments": 250,
        "features": ["Client portal", "Smart intake", "Basic assessment", "Email support"],
    },
    {
        "plan_key": "growth",
        "name": "Growth",
        "monthly_usd": 399,
        "included_jobs": 50,
        "included_assessments": 2000,
        "features": ["Advanced assessment", "Audio/video", "Candidate matching", "Calendar integrations", "WhatsApp/email reminders"],
    },
    {
        "plan_key": "enterprise",
        "name": "Enterprise",
        "monthly_usd": None,
        "included_jobs": None,
        "included_assessments": None,
        "features": ["SSO", "Regional data residency", "Custom MCPs", "ATS/HRMS integrations", "Dedicated success", "Compliance pack"],
    },
]

CURRENCIES = {
    "US": "USD",
    "EU": "EUR",
    "UK": "GBP",
    "INDIA": "INR",
    "UAE": "AED",
    "GLOBAL": "USD",
}


def list_plans(region: str = "global") -> dict[str, Any]:
    currency = CURRENCIES.get(region.upper(), "USD")
    return {"region": region.lower(), "currency": currency, "plans": GLOBAL_PLANS}


def estimate_invoice(plan_key: str, jobs: int, assessments: int, region: str = "global") -> dict[str, Any]:
    plan = next((item for item in GLOBAL_PLANS if item["plan_key"] == plan_key), GLOBAL_PLANS[0])
    base = plan["monthly_usd"] or 0
    extra_jobs = max(0, jobs - (plan["included_jobs"] or jobs))
    extra_assessments = max(0, assessments - (plan["included_assessments"] or assessments))
    usage = extra_jobs * 5 + extra_assessments * 0.35
    total = round(base + usage, 2)
    return {
        "plan": plan,
        "region": region.lower(),
        "currency": CURRENCIES.get(region.upper(), "USD"),
        "base_amount_usd": base,
        "usage_amount_usd": usage,
        "estimated_total_usd": total,
        "note": "Production should calculate taxes, FX, coupons, invoices, and payment-provider pricing rules."
    }
