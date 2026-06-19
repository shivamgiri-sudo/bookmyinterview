from __future__ import annotations
import os
import uuid

os.environ.setdefault("CELERY_TASK_ALWAYS_EAGER", "true")

from fastapi.testclient import TestClient
from app.app_factory import create_app

client = TestClient(create_app())


def _unique_email(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8]}@example.test"


def test_full_candidate_assessment_workflow():
    # 1. Intake creates a job and persists an assessment path.
    intake = client.post(
        "/api/v1/intake/analyze",
        json={
            "designation": "Senior Backend Engineer",
            "department": "Engineering",
            "industry": "Technology",
            "location": "Remote",
            "seniority": "Senior",
            "salary_min": 100000,
            "salary_max": 150000,
            "currency": "USD",
            "interview_slots": [
                {
                    "start_time": "2026-07-01T10:00:00Z",
                    "end_time": "2026-07-01T11:00:00Z",
                    "mode": "digital",
                }
            ],
        },
    )
    assert intake.status_code == 200
    job = intake.json()["data"]
    job_id = job["id"]
    assert job["assessment_path"]

    # 2. Create a candidate.
    candidate = client.post(
        "/api/v1/candidates",
        json={
            "full_name": "Alice Workflow",
            "email": _unique_email("alice"),
            "location": "Remote",
            "consent_status": "granted",
        },
    )
    assert candidate.status_code == 201
    candidate_id = candidate.json()["data"]["id"]

    # 3. Create an assessment for the candidate/job.
    assessment = client.post(
        "/api/v1/assessments",
        json={"job_id": job_id, "candidate_id": candidate_id},
    )
    assert assessment.status_code == 201
    assessment_id = assessment.json()["data"]["id"]

    # 4. Submit audio and video responses.
    audio = client.post(
        f"/api/v1/assessments/{assessment_id}/responses/audio",
        params={
            "transcript": "I led the backend migration project.",
            "voice_level": "Level 3",
            "question_text": "Tell us about a project you led.",
        },
    )
    assert audio.status_code == 200

    video = client.post(
        f"/api/v1/assessments/{assessment_id}/responses/video",
        params={
            "transcript": "My strategy is to measure outcomes and iterate.",
            "question_text": "How do you approach strategy?",
        },
    )
    assert video.status_code == 200

    # 5. Score the assessment.
    score = client.post(f"/api/v1/assessments/{assessment_id}/score")
    assert score.status_code == 200
    score_data = score.json()["data"]
    assert score_data["final_score"] > 0
    assert score_data["recommendation"]

    # 6. Shortlist the candidate.
    shortlist = client.post(f"/api/v1/assessments/{assessment_id}/shortlist")
    assert shortlist.status_code == 200

    # 7. List available slots and book an interview.
    slots = client.get(f"/api/v1/jobs/{job_id}/slots")
    assert slots.status_code == 200
    available_slots = slots.json()["data"]
    assert len(available_slots) == 1
    slot_id = available_slots[0]["id"]

    booking = client.post(
        f"/api/v1/assessments/{assessment_id}/book-interview",
        params={"slot_id": slot_id},
    )
    assert booking.status_code == 200
    booking_data = booking.json()["data"]
    assert booking_data["assessment_id"] == assessment_id

    # 8. Submit client feedback.
    feedback = client.post(
        f"/api/v1/assessments/{assessment_id}/client-feedback",
        json={
            "ratings": {"communication": 8.0, "technical": 9.0},
            "notes": "Strong candidate",
            "recommendation": "hire",
        },
    )
    assert feedback.status_code == 200

    # 9. Make a hiring decision.
    decision = client.post(
        f"/api/v1/assessments/{assessment_id}/decision",
        json={"decision": "hire", "notes": "Approved by hiring manager"},
    )
    assert decision.status_code == 200
    decision_data = decision.json()["data"]
    assert decision_data["client_decision"] == "hire"

    # 10. Detail endpoint shows the full picture.
    detail = client.get(f"/api/v1/assessments/{assessment_id}/detail")
    assert detail.status_code == 200
    detail_data = detail.json()["data"]
    assert detail_data["status"] == "completed"
    assert detail_data["path_id"] is not None
    assert len(detail_data["responses"]) == 2
    assert len(detail_data["scores"]) >= 2
    assert detail_data["booking"] is not None
    assert detail_data["client_decision"] == "hire"
