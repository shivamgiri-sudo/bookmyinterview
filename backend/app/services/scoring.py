from __future__ import annotations
from typing import Any

DEFAULT_WEIGHTS = {
    "resume_match": 15,
    "skill_test": 20,
    "scenario_test": 20,
    "audio_score": 15,
    "video_score": 10,
    "trait_score": 15,
    "salary_notice_fit": 5,
}
VOICE_HEAVY_WEIGHTS = {
    "resume_match": 10,
    "skill_test": 15,
    "scenario_test": 15,
    "audio_score": 30,
    "video_score": 5,
    "trait_score": 15,
    "salary_notice_fit": 10,
}
EXECUTIVE_WEIGHTS = {
    "resume_match": 10,
    "skill_test": 15,
    "scenario_test": 25,
    "audio_score": 10,
    "video_score": 20,
    "trait_score": 15,
    "salary_notice_fit": 5,
}


def score_candidate(scores: dict[str, float], profile_type: str = "default") -> dict[str, Any]:
    weights = DEFAULT_WEIGHTS
    if "voice" in profile_type.lower():
        weights = VOICE_HEAVY_WEIGHTS
    if "executive" in profile_type.lower():
        weights = EXECUTIVE_WEIGHTS
    weighted = {}
    final = 0.0
    missing = []
    for key, weight in weights.items():
        value = scores.get(key)
        if value is None:
            missing.append(key)
            value = 0
        weighted[key] = round(value * weight / 100, 2)
        final += weighted[key]
    recommendation = "Strong Match" if final >= 85 else "Good Match" if final >= 75 else "Conditional Match" if final >= 65 else "Weak Match" if final >= 50 else "Reject"
    red_flags = []
    if scores.get("audio_score", 100) < 55 and "voice" in profile_type.lower():
        red_flags.append("Audio score below benchmark for voice-critical role")
    if scores.get("trait_score", 100) < 50:
        red_flags.append("Low trait evidence")
    return {"final_score": round(final, 2), "weights": weights, "weighted_scores": weighted, "missing_scores": missing, "recommendation": recommendation, "red_flags": red_flags}


def evaluate_audio(transcript: str, voice_level: str = "Level 3") -> dict[str, Any]:
    word_count = len(transcript.split())
    structure_bonus = 1 if any(x in transcript.lower() for x in ["first", "second", "then", "finally", "because"]) else 0
    base = 6 + min(2, word_count / 60) + structure_bonus
    level_penalty = 1 if voice_level == "Level 5" and word_count < 60 else 0
    score = max(0, min(10, base - level_penalty))
    return {
        "voice_level": voice_level,
        "grammar_score": round(score, 1),
        "fluency_score": round(score, 1),
        "pronunciation_score": None,
        "vocabulary_score": round(min(10, score + .2), 1),
        "listening_comprehension_score": round(score, 1) if voice_level == "Level 5" else None,
        "confidence_score": round(score, 1),
        "professional_tone_score": round(score, 1),
        "final_audio_score": round(score * 10, 1),
        "note": "Pronunciation requires audio model integration. Current MVP evaluates transcript quality and structure."
    }


def evaluate_video(transcript: str) -> dict[str, Any]:
    word_count = len(transcript.split())
    structure = 8 if any(x in transcript.lower() for x in ["strategy", "team", "result", "measure", "client"]) else 6
    relevance = 8 if word_count > 45 else 6
    final = round((structure + relevance + 7) / 3 * 10, 1)
    return {"answer_structure": structure, "communication_clarity": relevance, "leadership_maturity": 7, "final_video_score": final, "protected_attribute_policy": "No scoring on appearance, age, gender, skin color, disability, or background."}
