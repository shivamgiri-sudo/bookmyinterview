from __future__ import annotations
from typing import Any

ROLE_INSIGHTS = {
    "international_voice": {
        "role": "International Voice Process",
        "critical_insights": [
            "Communication score below 78 should trigger review even if resume match is strong.",
            "Listening comprehension and pace stability are stronger predictors than accent.",
            "Night-shift readiness, escalation handling, and objection recovery must be validated before client interview.",
        ],
        "risk_signals": ["low audio clarity", "script-only answers", "weak listening accuracy", "shift concern"],
        "recommended_assessments": ["Audio Level 5", "Listening test", "Scenario call simulation", "Grammar and fluency rubric"],
        "client_report_focus": ["voice readiness", "customer empathy", "escalation maturity", "language consistency"],
    },
    "sales_manager": {
        "role": "Sales Manager",
        "critical_insights": [
            "Pitch structure, objection handling, and revenue ownership should outweigh generic confidence.",
            "A strong sales candidate must show repeatable pipeline discipline, not only verbal persuasion.",
            "Video interview should test executive presence when role is client-facing or enterprise sales.",
        ],
        "risk_signals": ["vague revenue examples", "weak CRM hygiene", "discount-led selling", "poor objection recovery"],
        "recommended_assessments": ["Sales case", "Pitch simulation", "Video response", "Negotiation scenario"],
        "client_report_focus": ["pipeline ownership", "conversion thinking", "client maturity", "forecast discipline"],
    },
    "hr_manager": {
        "role": "HR Manager",
        "critical_insights": [
            "Confidentiality and judgment must be treated as red-flag competencies, not soft skills.",
            "Policy knowledge without employee-handling maturity is not sufficient for manager roles.",
            "Case-based questions should test grievance, attrition, hiring pressure, and compliance trade-offs.",
        ],
        "risk_signals": ["confidentiality weakness", "policy-only thinking", "bias-prone answer", "poor escalation judgment"],
        "recommended_assessments": ["HR case study", "Confidentiality scenario", "Employee relations simulation", "Trait evaluation"],
        "client_report_focus": ["judgment", "employee sensitivity", "policy balance", "confidentiality"],
    },
    "operations_manager": {
        "role": "Operations Manager",
        "critical_insights": [
            "SLA ownership, root-cause thinking, and people governance should be visible in every answer.",
            "Candidates who only discuss team handling without metrics may fail in performance-heavy environments.",
            "Video or scenario assessment should test pressure response and cross-functional decision making.",
        ],
        "risk_signals": ["no SLA examples", "blame-oriented answers", "weak RCA", "low ownership language"],
        "recommended_assessments": ["SLA case", "RCA scenario", "Leadership video", "People-performance simulation"],
        "client_report_focus": ["SLA control", "RCA quality", "floor governance", "leadership maturity"],
    },
    "software_developer": {
        "role": "Software Developer",
        "critical_insights": [
            "Problem decomposition and code maintainability are as important as passing test cases.",
            "AI-assisted coding should be allowed only when declared and evaluated through explanation depth.",
            "System design should be included for senior developers even if coding score is high.",
        ],
        "risk_signals": ["copy-paste solution", "no edge-case thinking", "weak debugging", "poor explanation"],
        "recommended_assessments": ["Coding test", "Debugging task", "Code review", "System design for senior roles"],
        "client_report_focus": ["correctness", "maintainability", "debugging", "architecture thinking"],
    },
    "finance_manager": {
        "role": "Finance Manager",
        "critical_insights": [
            "Accuracy, control mindset, and audit readiness should outrank generic Excel familiarity.",
            "Scenario questions should include reconciliation, exception handling, and stakeholder pressure.",
            "Low integrity or weak documentation answers should trigger mandatory review.",
        ],
        "risk_signals": ["weak reconciliation", "poor documentation", "control bypass", "integrity concern"],
        "recommended_assessments": ["Finance case", "Excel test", "Reconciliation scenario", "Integrity judgment"],
        "client_report_focus": ["accuracy", "controls", "audit readiness", "stakeholder handling"],
    },
    "leadership": {
        "role": "VP / CXO / Senior Leadership",
        "critical_insights": [
            "Strategic clarity, trade-off thinking, and execution governance should drive the final recommendation.",
            "Leadership roles must never be auto-approved or auto-rejected without panel review.",
            "Evidence should include past scale, transformation outcomes, and crisis decision quality.",
        ],
        "risk_signals": ["buzzword-heavy answer", "no scale evidence", "weak governance", "unclear ownership"],
        "recommended_assessments": ["Executive simulation", "Leadership video", "Strategy case", "Panel review"],
        "client_report_focus": ["scale", "strategy", "governance", "decision quality"],
    },
}


def list_role_insights() -> dict[str, Any]:
    return {"roles": ROLE_INSIGHTS, "coverage": len(ROLE_INSIGHTS), "note": "Insights are configurable and should become tenant/industry specific over time."}


def get_role_insight(role_key: str) -> dict[str, Any]:
    normalized = role_key.lower().replace(" ", "_").replace("/", "_")
    return ROLE_INSIGHTS.get(normalized, ROLE_INSIGHTS.get("leadership"))


def generate_critical_insight_summary(role_key: str, scores: dict[str, float] | None = None) -> dict[str, Any]:
    insight = get_role_insight(role_key)
    scores = scores or {}
    alerts = []
    if scores.get("communication", 100) < 75:
        alerts.append("Communication risk below recommended threshold.")
    if scores.get("trait", 100) < 70:
        alerts.append("Trait-fit risk requires human review.")
    if scores.get("technical", 100) < 65:
        alerts.append("Technical readiness appears below role expectation.")
    return {"role": insight["role"], "critical_insights": insight["critical_insights"], "risk_signals": insight["risk_signals"], "recommended_assessments": insight["recommended_assessments"], "client_report_focus": insight["client_report_focus"], "score_alerts": alerts, "decision_control": "human_review_required" if alerts else "allow_with_audit"}
