from __future__ import annotations
from datetime import datetime, timezone
from typing import Any

from app.services.assessment import build_assessment_path
from app.services.jd_engine import generate_jd
from app.services.scoring import score_candidate, evaluate_audio, evaluate_video
from app.services.trait_engine import generate_trait_questions, evaluate_trait_response

ENTERPRISE_MCP_REGISTRY = [
    {
        "server_key": "jd_intelligence_mcp",
        "name": "JD Intelligence MCP",
        "purpose": "Convert raw client hiring intake into complete JD, missing-gap analysis, competencies, traits, and interview plan.",
        "tools": ["analyze_hiring_requirement", "generate_jd", "detect_missing_gaps", "build_interview_scorecard"],
        "risk_level": "medium",
        "human_approval_required": False,
    },
    {
        "server_key": "assessment_intelligence_mcp",
        "name": "Assessment Intelligence MCP",
        "purpose": "Select role-wise assessment path and evaluate skill, scenario, audio, video, and scorecard data.",
        "tools": ["generate_assessment_path", "evaluate_audio", "evaluate_video", "calculate_final_score"],
        "risk_level": "high",
        "human_approval_required": True,
    },
    {
        "server_key": "candidate_matching_mcp",
        "name": "Candidate Matching MCP",
        "purpose": "Match candidates to JDs using skills, experience, salary, notice, location, assessment readiness, and evidence quality.",
        "tools": ["match_candidate_to_job", "rank_candidates", "explain_match", "flag_candidate_risks"],
        "risk_level": "high",
        "human_approval_required": True,
    },
    {
        "server_key": "trait_question_mcp",
        "name": "Trait Question MCP",
        "purpose": "Generate, validate, version, approve, and evaluate trait questions for role-specific assessments.",
        "tools": ["generate_trait_questions", "validate_trait_question", "evaluate_trait_response", "check_consistency"],
        "risk_level": "medium",
        "human_approval_required": True,
    },
    {
        "server_key": "compliance_mcp",
        "name": "Compliance MCP",
        "purpose": "Apply consent, protected-attribute, audit, data-source, and hiring-decision safety checks before actions are executed.",
        "tools": ["check_action_policy", "check_data_source", "mask_sensitive_data", "create_audit_event"],
        "risk_level": "critical",
        "human_approval_required": True,
    },
]

PROTECTED_TERMS = [
    "age", "gender", "religion", "caste", "marital", "disability", "medical", "political", "pregnancy", "family background"
]


def audit_envelope(server_key: str, tool_name: str, result: dict[str, Any], actor_role: str = "system") -> dict[str, Any]:
    return {
        "mcp_server": server_key,
        "tool": tool_name,
        "actor_role": actor_role,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "audit_required": True,
        "human_review_recommended": server_key in ["assessment_intelligence_mcp", "candidate_matching_mcp", "trait_question_mcp", "compliance_mcp"],
        "result": result,
    }


def registry() -> dict[str, Any]:
    return {
        "product": "BOOK MY INTERVIEW",
        "gateway_policy": {
            "deny_by_default": True,
            "tenant_scope_required": True,
            "audit_every_call": True,
            "credential_access": "superadmin_vault_only",
            "human_approval_for_sensitive_actions": True,
        },
        "servers": ENTERPRISE_MCP_REGISTRY,
    }


def jd_intelligence(payload: dict[str, Any]) -> dict[str, Any]:
    assessment_path = build_assessment_path(payload)
    jd = generate_jd(payload, assessment_path)
    missing = jd.get("missing_gaps", [])
    result = {
        "jd": jd,
        "assessment_preview": assessment_path,
        "missing_gaps": missing,
        "readiness_score": max(35, 100 - len(missing) * 9),
        "recommended_followups": [
            f"Confirm {gap.replace('_', ' ')}" for gap in missing
        ],
        "client_ready": len(missing) <= 2,
    }
    return audit_envelope("jd_intelligence_mcp", "analyze_hiring_requirement", result)


def assessment_intelligence(payload: dict[str, Any]) -> dict[str, Any]:
    job_payload = payload.get("job", payload)
    path = build_assessment_path(job_payload)
    transcript = payload.get("transcript", "")
    audio_result = evaluate_audio(transcript, path.get("voice_level") or "Level 3") if transcript else None
    video_result = evaluate_video(payload.get("video_transcript", "")) if payload.get("video_transcript") else None
    score_payload = payload.get("scores") or {
        "resume_match": 80,
        "skill_test": 78,
        "scenario_test": 76,
        "audio_score": audio_result["final_audio_score"] if audio_result else 0,
        "video_score": video_result["final_video_score"] if video_result else 0,
        "trait_score": 75,
        "salary_notice_fit": 80,
    }
    final_score = score_candidate(score_payload, path.get("profile_type", "default"))
    result = {"assessment_path": path, "audio_result": audio_result, "video_result": video_result, "final_score": final_score}
    return audit_envelope("assessment_intelligence_mcp", "generate_assessment_path", result)


def candidate_matching(payload: dict[str, Any]) -> dict[str, Any]:
    job = payload.get("job", {})
    candidate = payload.get("candidate", {})
    required_skills = {str(x).lower() for x in job.get("must_have_skills", [])}
    candidate_skills = {str(x).lower() for x in candidate.get("skills", [])}
    skill_overlap = len(required_skills & candidate_skills)
    skill_score = 100 if not required_skills else round((skill_overlap / len(required_skills)) * 100, 2)
    exp_required = float(job.get("min_experience_years", 0) or 0)
    exp_have = float(candidate.get("experience_years", 0) or 0)
    experience_score = 100 if exp_required == 0 else min(100, round((exp_have / exp_required) * 100, 2))
    salary_fit = 100 if not job.get("salary_max") else 85
    notice_fit = 100 if str(candidate.get("notice_period", "")).lower() in ["immediate", "15 days", "30 days"] else 65
    location_fit = 100 if str(candidate.get("location", "")).lower() == str(job.get("location", "")).lower() else 70
    final_match = round(skill_score * .38 + experience_score * .22 + salary_fit * .16 + notice_fit * .12 + location_fit * .12, 2)
    result = {
        "candidate_name": candidate.get("name", "Candidate"),
        "job_title": job.get("designation", "Role"),
        "match_score": final_match,
        "components": {
            "skill_score": skill_score,
            "experience_score": experience_score,
            "salary_fit": salary_fit,
            "notice_fit": notice_fit,
            "location_fit": location_fit,
        },
        "matched_skills": sorted(required_skills & candidate_skills),
        "missing_skills": sorted(required_skills - candidate_skills),
        "recommendation": "Shortlist" if final_match >= 75 else "Review" if final_match >= 60 else "Hold",
        "explanation": "Score combines skills, experience, salary, notice period, and location fit. Final hiring decision requires assessment and human review.",
    }
    return audit_envelope("candidate_matching_mcp", "match_candidate_to_job", result)


def trait_question_mcp(payload: dict[str, Any]) -> dict[str, Any]:
    role = payload.get("designation", "HR Manager")
    industry = payload.get("industry", "General")
    seniority = payload.get("seniority", "Mid")
    questions = generate_trait_questions(role, industry, seniority)
    sample_response = payload.get("sample_response")
    evaluation = evaluate_trait_response(sample_response, payload.get("trait", "Ownership")) if sample_response else None
    result = {
        "generated_question_set": questions,
        "sample_evaluation": evaluation,
        "approval_required_before_live_use": seniority.lower() in ["manager", "director", "vp", "cxo", "ceo"],
        "versioning_required": True,
    }
    return audit_envelope("trait_question_mcp", "generate_trait_questions", result)


def compliance_check(payload: dict[str, Any]) -> dict[str, Any]:
    action = payload.get("action", "unknown_action")
    text = " ".join(str(v).lower() for v in payload.values())
    protected_found = [term for term in PROTECTED_TERMS if term in text]
    source_type = payload.get("source_type", "internal")
    consent_status = payload.get("consent_status", "unknown")
    auto_decision = bool(payload.get("auto_decision", False))
    violations = []
    if protected_found:
        violations.append("Protected attribute detected")
    if source_type in ["scraped", "web_data"] and payload.get("source_approved") is not True:
        violations.append("Web data source not approved")
    if consent_status not in ["granted", "not_required"]:
        violations.append("Consent not confirmed")
    if auto_decision:
        violations.append("Auto decision requested; human review required")
    result = {
        "action": action,
        "allowed": len(violations) == 0,
        "violations": violations,
        "protected_terms_found": protected_found,
        "required_controls": ["audit_log", "tenant_scope", "data_minimization", "human_review"] if violations else ["audit_log", "tenant_scope"],
        "decision": "block" if violations else "allow_with_audit",
    }
    return audit_envelope("compliance_mcp", "check_action_policy", result, actor_role=payload.get("actor_role", "system"))
