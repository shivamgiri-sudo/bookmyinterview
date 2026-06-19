from __future__ import annotations
from typing import Any

PROVIDER_ADAPTERS = [
    {"key": "mock_llm", "category": "LLM", "mode": "free", "status": "ready", "fallback": None},
    {"key": "openai", "category": "LLM", "mode": "paid", "status": "contract_ready", "fallback": "mock_llm"},
    {"key": "claude", "category": "LLM", "mode": "paid", "status": "contract_ready", "fallback": "mock_llm"},
    {"key": "manual_resume", "category": "Resume Parsing", "mode": "free", "status": "ready", "fallback": None},
    {"key": "affinda_rchilli", "category": "Resume Parsing", "mode": "paid", "status": "contract_ready", "fallback": "manual_resume"},
    {"key": "manual_transcript", "category": "Audio", "mode": "free", "status": "ready", "fallback": None},
    {"key": "deepgram_whisper", "category": "Audio", "mode": "paid_or_local", "status": "contract_ready", "fallback": "manual_transcript"},
    {"key": "local_calendar", "category": "Scheduling", "mode": "free", "status": "ready", "fallback": None},
    {"key": "google_microsoft_calendar", "category": "Scheduling", "mode": "plan_or_api", "status": "contract_ready", "fallback": "local_calendar"},
    {"key": "smtp_dev", "category": "Email", "mode": "free", "status": "ready", "fallback": None},
    {"key": "sendgrid_ses", "category": "Email", "mode": "paid_or_free_tier", "status": "contract_ready", "fallback": "smtp_dev"},
]


def list_provider_adapters() -> dict[str, Any]:
    return {"adapters": PROVIDER_ADAPTERS, "rule": "Use free fallback by default; enable paid adapter only after cost and compliance approval."}


def readiness_summary() -> dict[str, Any]:
    ready = [item for item in PROVIDER_ADAPTERS if item["status"] == "ready"]
    contract_ready = [item for item in PROVIDER_ADAPTERS if item["status"] == "contract_ready"]
    return {"ready_free_adapters": ready, "contract_ready_paid_adapters": contract_ready, "live_paid_integrations_enabled": 0}
