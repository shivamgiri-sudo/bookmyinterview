from __future__ import annotations
from typing import Any

ROLE_DEFAULTS: dict[str, dict[str, Any]] = {
    "data entry": {"communication": 10, "leadership": 5, "technical": 55, "risk": 20, "client_facing": 5, "decision": 10, "profile": "Back Office"},
    "mis executive": {"communication": 25, "leadership": 10, "technical": 82, "risk": 35, "client_facing": 10, "decision": 25, "profile": "Analytical"},
    "customer support": {"communication": 92, "leadership": 20, "technical": 30, "risk": 45, "client_facing": 85, "decision": 35, "profile": "High Voice"},
    "international voice": {"communication": 96, "leadership": 20, "technical": 25, "risk": 45, "client_facing": 90, "decision": 35, "profile": "High Voice"},
    "recruiter": {"communication": 78, "leadership": 35, "technical": 45, "risk": 50, "client_facing": 70, "decision": 45, "profile": "Talent Acquisition"},
    "hr executive": {"communication": 76, "leadership": 30, "technical": 42, "risk": 60, "client_facing": 55, "decision": 42, "profile": "HR"},
    "hr manager": {"communication": 84, "leadership": 72, "technical": 48, "risk": 75, "client_facing": 65, "decision": 78, "profile": "Managerial"},
    "sales executive": {"communication": 88, "leadership": 25, "technical": 35, "risk": 35, "client_facing": 92, "decision": 45, "profile": "Sales"},
    "sales manager": {"communication": 91, "leadership": 74, "technical": 38, "risk": 45, "client_facing": 96, "decision": 76, "profile": "Client Facing"},
    "operations manager": {"communication": 66, "leadership": 78, "technical": 60, "risk": 70, "client_facing": 50, "decision": 85, "profile": "Operations Leadership"},
    "finance executive": {"communication": 35, "leadership": 15, "technical": 78, "risk": 75, "client_facing": 20, "decision": 45, "profile": "Finance"},
    "finance manager": {"communication": 52, "leadership": 64, "technical": 82, "risk": 92, "client_facing": 35, "decision": 80, "profile": "Finance Leadership"},
    "software developer": {"communication": 30, "leadership": 18, "technical": 96, "risk": 35, "client_facing": 12, "decision": 50, "profile": "Technical"},
    "qa tester": {"communication": 38, "leadership": 15, "technical": 86, "risk": 50, "client_facing": 10, "decision": 45, "profile": "Technical Quality"},
    "trainer": {"communication": 92, "leadership": 62, "technical": 50, "risk": 45, "client_facing": 78, "decision": 62, "profile": "Training"},
    "product manager": {"communication": 78, "leadership": 72, "technical": 74, "risk": 50, "client_facing": 70, "decision": 86, "profile": "Product"},
    "vp": {"communication": 86, "leadership": 96, "technical": 62, "risk": 86, "client_facing": 80, "decision": 96, "profile": "Executive"},
    "ceo": {"communication": 92, "leadership": 100, "technical": 65, "risk": 92, "client_facing": 88, "decision": 100, "profile": "Executive"},
}

ROLE_TRAITS = {
    "HR": ["Empathy", "Confidentiality", "Fairness", "Conflict Handling", "Judgment"],
    "Sales": ["Persuasion", "Resilience", "Ownership", "Target Orientation", "Objection Handling"],
    "Operations": ["Discipline", "Urgency", "Accountability", "Decision Making", "People Management"],
    "Finance": ["Accuracy", "Integrity", "Risk Control", "Confidentiality", "Compliance Judgment"],
    "Technical": ["Problem Solving", "Precision", "Learning Agility", "Ownership", "Collaboration"],
    "Voice": ["Patience", "Clarity", "Empathy", "Listening", "Professional Tone"],
    "Executive": ["Strategic Thinking", "Influence", "Decision Quality", "Ambiguity Handling", "Executive Presence"],
}

BANNED_TOPICS = ["caste", "religion", "gender", "age", "marital", "disability", "political", "health", "family background"]


def infer_role_key(title: str) -> str:
    normalized = title.lower().strip()
    for key in ROLE_DEFAULTS:
        if key in normalized:
            return key
    if "support" in normalized or "voice" in normalized:
        return "customer support"
    if "sales" in normalized:
        return "sales manager" if "manager" in normalized else "sales executive"
    if "hr" in normalized or "human resource" in normalized:
        return "hr manager" if "manager" in normalized else "hr executive"
    if "operation" in normalized:
        return "operations manager"
    if "finance" in normalized or "account" in normalized:
        return "finance manager" if "manager" in normalized else "finance executive"
    if "developer" in normalized or "engineer" in normalized:
        return "software developer"
    return "recruiter"
