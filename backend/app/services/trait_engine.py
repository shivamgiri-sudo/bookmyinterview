from __future__ import annotations
from typing import Any
from app.services.rules import ROLE_TRAITS, BANNED_TOPICS


def trait_family(title: str) -> str:
    t = title.lower()
    if "hr" in t or "recruit" in t:
        return "HR"
    if "sales" in t:
        return "Sales"
    if "operation" in t:
        return "Operations"
    if "finance" in t or "account" in t:
        return "Finance"
    if "developer" in t or "engineer" in t or "qa" in t:
        return "Technical"
    if "voice" in t or "support" in t:
        return "Voice"
    if "vp" in t or "ceo" in t or "chief" in t or "director" in t:
        return "Executive"
    return "HR"


def generate_trait_questions(title: str, industry: str = "General", seniority: str = "Mid") -> dict[str, Any]:
    family = trait_family(title)
    traits = ROLE_TRAITS[family]
    questions = []
    for trait in traits:
        qs = [
            ("behavioral", f"Tell us about a real situation where you demonstrated {trait.lower()} in a work environment."),
            ("scenario", f"You are handling a {title} responsibility and there is pressure to choose speed over quality. How would your {trait.lower()} guide your decision?"),
            ("contradiction_check", f"When can {trait.lower()} become harmful for business results? Explain with a balanced answer."),
            ("follow_up", f"What specific first action would you take in the first 24 hours to demonstrate {trait.lower()}?"),
        ]
        for qtype, text in qs:
            validation = validate_question(text, title, trait)
            questions.append({
                "trait": trait,
                "role": title,
                "industry": industry,
                "seniority": seniority,
                "question_type": qtype,
                "question": text,
                "difficulty": "High" if seniority.lower() in ["vp", "cxo", "ceo", "director"] else "Medium",
                "scoring_rubric": {
                    "excellent": f"Clear example, structured judgment, measurable action, and strong evidence of {trait}.",
                    "good": f"Relevant answer with practical action and moderate evidence of {trait}.",
                    "average": "Generic answer with limited specifics.",
                    "poor": "Vague, evasive, unrealistic, or role-mismatched response.",
                    "red_flags": ["Blame shifting", "No ownership", "Unsafe or biased judgment", "No role relevance"],
                },
                "validation": validation,
                "status": "AI Validated" if validation["status"] == "pass" else "Needs Human Review",
            })
    return {"role": title, "family": family, "traits": traits, "questions": questions}


def validate_question(text: str, role: str, trait: str) -> dict[str, Any]:
    lower = text.lower()
    banned_found = [topic for topic in BANNED_TOPICS if topic in lower]
    clarity = 9 if len(text.split()) < 35 else 7
    role_relevance = 9 if role.lower().split()[0] in lower or "work" in lower else 8
    trait_relevance = 10 if trait.lower() in lower else 7
    status = "fail" if banned_found or trait_relevance < 7 else "pass"
    return {
        "role_relevance_score": role_relevance,
        "trait_relevance_score": trait_relevance,
        "bias_risk": "High" if banned_found else "Low",
        "banned_topics": banned_found,
        "clarity_score": clarity,
        "scoring_feasibility": 9,
        "status": status,
    }


def evaluate_trait_response(response_text: str, trait: str) -> dict[str, Any]:
    words = response_text.split()
    has_structure = any(x in response_text.lower() for x in ["first", "then", "because", "measure", "document", "escalate"])
    score = min(10, 5 + (2 if len(words) > 40 else 0) + (2 if has_structure else 0) + (1 if trait.lower() in response_text.lower() else 0))
    return {
        "trait_score": score,
        "evidence": "Response length and structure indicate trait evidence." if score >= 7 else "Limited evidence found.",
        "strengths": ["Structured approach"] if has_structure else [],
        "weaknesses": [] if score >= 7 else ["Needs more specific examples and measurable action"],
        "red_flags": [] if score >= 5 else ["Low role maturity"],
        "recommendation": "Pass" if score >= 7 else "Review",
    }
