from __future__ import annotations
from typing import Any

MESSAGE_TEMPLATES = {
    "assessment_invite": {
        "audience": "candidate",
        "subject_pattern": "Assessment ready for {{role}}",
        "purpose": "Invite talent to complete the role assessment.",
        "layout": "branded_card_with_primary_cta",
        "cta": "Start Assessment",
        "content_blocks": ["opening", "role_context", "assessment_scope", "preparation_guidance", "support_note"],
        "tone": "professional, clear, reassuring",
    },
    "shortlist_report": {
        "audience": "client",
        "subject_pattern": "Shortlist ready for {{role}}",
        "purpose": "Share evaluated talent shortlist with client decision makers.",
        "layout": "executive_summary_with_candidate_table",
        "cta": "Review Shortlist",
        "content_blocks": ["summary", "scorecard_context", "critical_insights", "risk_flags", "next_steps"],
        "tone": "executive, concise, evidence-led",
    },
    "review_required": {
        "audience": "internal_reviewer",
        "subject_pattern": "Review required: {{review_type}}",
        "purpose": "Notify reviewer that a sensitive hiring workflow needs human action.",
        "layout": "priority_alert_card",
        "cta": "Open Review Queue",
        "content_blocks": ["priority", "reason", "evidence_links", "policy_flags", "decision_options"],
        "tone": "urgent, precise, audit-ready",
    },
    "slot_confirmation": {
        "audience": "candidate_or_client",
        "subject_pattern": "Interview confirmed for {{role}}",
        "purpose": "Confirm interview schedule and joining instructions.",
        "layout": "calendar_card",
        "cta": "View Details",
        "content_blocks": ["slot_details", "mode", "preparation", "reschedule_policy", "support_note"],
        "tone": "clear, calm, professional",
    },
    "provider_cost_approval": {
        "audience": "superadmin",
        "subject_pattern": "Provider approval needed: {{provider_name}}",
        "purpose": "Request approval before enabling paid or plan-dependent provider usage.",
        "layout": "cost_guard_card",
        "cta": "Review Provider",
        "content_blocks": ["provider", "projected_cost", "fallback", "budget_cap", "approval_controls"],
        "tone": "controlled, financial, risk-aware",
    },
}

BLOCK_COPY = {
    "opening": "Thank you for continuing with the hiring process.",
    "role_context": "This step is aligned to the role requirements and evaluation plan.",
    "assessment_scope": "The assessment may include role skills, scenarios, communication, audio, video, or trait questions depending on the position.",
    "preparation_guidance": "Complete the step in a quiet environment and provide responses based on your own experience.",
    "support_note": "For support, contact the hiring coordination team through the platform.",
    "summary": "The evaluated shortlist is ready for review.",
    "scorecard_context": "Scores are explainable and based on the approved role matrix.",
    "critical_insights": "Critical insights highlight role readiness, risks, and interview focus areas.",
    "risk_flags": "Risk flags require review before the next decision.",
    "next_steps": "Confirm interview slots or request additional screening.",
    "priority": "This item requires attention based on priority and SLA.",
    "reason": "The review reason is included in the case details.",
    "evidence_links": "Open the scorecard and evidence trail before deciding.",
    "policy_flags": "Check compliance flags before approving or rejecting.",
    "decision_options": "Record the decision with a clear reason.",
    "slot_details": "The confirmed interview slot and mode are shown below.",
    "mode": "Use the provided meeting or location details.",
    "preparation": "Keep role-relevant documents or samples ready if requested.",
    "reschedule_policy": "Request changes through the platform before the cutoff time.",
    "provider": "Provider activation may create cost or compliance obligations.",
    "projected_cost": "Projected monthly cost must be reviewed before approval.",
    "fallback": "A free or manual fallback should be available.",
    "budget_cap": "A monthly cap and kill switch must be configured.",
    "approval_controls": "Superadmin approval is required before activation.",
}


def list_message_templates() -> dict[str, Any]:
    return {"templates": MESSAGE_TEMPLATES, "count": len(MESSAGE_TEMPLATES), "standard": "responsive branded card, preview text, clear CTA, audit-ready wording"}


def render_message_template(template_key: str, variables: dict[str, str] | None = None) -> dict[str, Any]:
    template = MESSAGE_TEMPLATES.get(template_key, MESSAGE_TEMPLATES["assessment_invite"])
    variables = variables or {}
    subject = template["subject_pattern"]
    for key, value in variables.items():
        subject = subject.replace("{{" + key + "}}", value)
    blocks = [{"block": block, "copy": BLOCK_COPY.get(block, block.replace("_", " ").title())} for block in template["content_blocks"]]
    return {"template_key": template_key, "subject": subject, "audience": template["audience"], "purpose": template["purpose"], "layout": template["layout"], "cta": template["cta"], "tone": template["tone"], "blocks": blocks}
