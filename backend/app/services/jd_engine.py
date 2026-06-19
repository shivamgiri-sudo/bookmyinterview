from __future__ import annotations
from typing import Any


def generate_jd(payload: dict[str, Any], assessment_path: dict[str, Any]) -> dict[str, Any]:
    title = payload.get("designation", "Role")
    company = payload.get("company_name", "Client Company")
    location = payload.get("location", "To be confirmed")
    budget = payload.get("budget", "To be confirmed")
    missing = []
    for field in ["reporting_manager", "interview_slots", "notice_period", "must_have_skills", "deal_breakers"]:
        if not payload.get(field):
            missing.append(field)
    return {
        "title": title,
        "company": company,
        "location": location,
        "budget": budget,
        "role_summary": f"{company} is hiring a {title} for {location}. The role requires measurable ownership, role-specific capability, and a fit against the defined assessment path.",
        "responsibilities": ["Deliver role KPIs", "Manage stakeholder expectations", "Maintain quality and compliance", "Report progress with measurable outcomes"],
        "must_have_skills": payload.get("must_have_skills", ["Role knowledge", "Communication", "Execution discipline"]),
        "traits": payload.get("traits", []),
        "assessment_plan": assessment_path["recommended_path"],
        "interview_scorecard": ["Role knowledge", "Scenario judgment", "Communication", "Trait evidence", "Salary/notice fit"],
        "missing_gaps": missing,
        "suggestions": ["Confirm interview panel and slots", "Finalize non-negotiable skills", "Define first 90-day success metrics", "Confirm audio/video requirement override if any"],
    }
