from __future__ import annotations
from typing import Any
from app.services.rules import ROLE_DEFAULTS, infer_role_key


def build_assessment_path(payload: dict[str, Any]) -> dict[str, Any]:
    title = payload.get("designation") or payload.get("title") or "Recruiter"
    seniority = (payload.get("seniority") or "").lower()
    client_overrides = payload.get("client_overrides") or {}
    role_key = infer_role_key(title)
    base = ROLE_DEFAULTS[role_key].copy()

    if "manager" in title.lower() or seniority in ["manager", "senior manager"]:
        base["leadership"] = max(base["leadership"], 65)
        base["decision"] = max(base["decision"], 70)
    if seniority in ["vp", "cxo", "ceo", "director"] or any(x in title.lower() for x in ["vp", "ceo", "chief", "director"]):
        base["leadership"] = max(base["leadership"], 92)
        base["decision"] = max(base["decision"], 92)

    path = ["Resume Screening"]
    reasons: dict[str, str] = {}
    if base["technical"] >= 70:
        path.append("Technical / Skill Assessment")
        reasons["skill_required"] = f"Technical dependency score is {base['technical']}."
    else:
        path.append("Role Skill Assessment")

    if base["risk"] >= 60 or base["decision"] >= 60 or "manager" in title.lower():
        path.append("Scenario / Case Assessment")
        reasons["scenario_required"] = "Role requires judgment, compliance, decision-making, or managerial maturity."

    voice_level = None
    if base["communication"] >= 70 or base["client_facing"] >= 70:
        voice_level = "Level 5" if base["communication"] >= 90 else "Level 3"
        path.append(f"Audio Interview {voice_level}")
        reasons["audio_required"] = f"Communication dependency score is {base['communication']} and client-facing score is {base['client_facing']}."

    video_required = base["leadership"] >= 60 or base["client_facing"] >= 85 or any(x in title.lower() for x in ["manager", "vp", "ceo", "trainer", "sales"])
    if video_required:
        path.append("Video Interview")
        reasons["video_required"] = f"Leadership/client-facing dependency requires visual communication assessment. Leadership score: {base['leadership']}."

    if base["leadership"] >= 90:
        path.append("Executive Strategic Simulation")
        reasons["executive_case_required"] = "Senior leadership role requires strategic simulation before client round."

    for item in client_overrides.get("add", []):
        if item not in path:
            path.append(item)
    for item in client_overrides.get("remove", []):
        if item in path and item != "Resume Screening":
            path.remove(item)

    passing_score = 82 if base["leadership"] >= 90 else 78 if base["communication"] >= 85 else 75
    return {
        "role": title,
        "role_key": role_key,
        "profile_type": base["profile"],
        "dependency_scores": base,
        "recommended_path": path,
        "voice_level": voice_level,
        "passing_score": client_overrides.get("passing_score", passing_score),
        "reasoning": reasons,
        "generated_by": "AI_RECOMMENDED_RULE_ENGINE",
        "modifiable_by_client": True,
    }
