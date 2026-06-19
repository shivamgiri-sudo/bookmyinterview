from __future__ import annotations
import json
from datetime import datetime, timezone
from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from app.core.unit_of_work import unit_of_work
from app.core.cache import cache
from app.core.events import event_bus, DomainEvent
from app.core.logging import get_logger
from app.db.models import (
    Assessment,
    AssessmentResponse as AssessmentResponseModel,
    AssessmentScore as AssessmentScoreModel,
    InterviewBooking,
    User,
)
from app.schemas.common import ApiResponse
from app.schemas.assessment import AssessmentCreate, AssessmentDetailResponse, AssessmentResponse, ScoreResponse
from app.schemas.interview import (
    ClientFeedbackRequest,
    DecisionRequest,
    DecisionResponse,
    InterviewBookingResponse,
    ShortlistRequest,
)
from app.api.v1.intake import get_current_user
from app.tasks.scoring_tasks import score_audio_response, score_video_response
from app.tasks.report_tasks import generate_assessment_report
from app.services.scoring import score_candidate

logger = get_logger("api.assessments")
router = APIRouter()

@router.post("", response_model=ApiResponse[AssessmentResponse], status_code=201)
async def create_assessment(
    payload: AssessmentCreate,
    user: User = Depends(get_current_user),
):
    tenant_id = user.tenant_id or 1
    async with unit_of_work() as uow:
        job = await uow.jobs.get(payload.job_id)
        if not job or job.tenant_id != tenant_id:
            raise HTTPException(status_code=404, detail="Job not found")
        if payload.candidate_id:
            candidate = await uow.candidates.get(payload.candidate_id)
            if not candidate or candidate.tenant_id != tenant_id:
                raise HTTPException(status_code=404, detail="Candidate not found")

        path_record = await uow.job_assessment_paths.get_latest_by_job(
            tenant_id, payload.job_id
        )
        assessment = Assessment(
            tenant_id=tenant_id,
            job_id=payload.job_id,
            candidate_id=payload.candidate_id,
            path_id=path_record.id if path_record else None,
            path_json=path_record.path_json if path_record else "{}",
            status="in_progress",
            started_at=datetime.now(timezone.utc),
        )
        await uow.assessments.add(assessment)

    await event_bus.publish(
        DomainEvent(
            event_type="assessment.started",
            aggregate_type="assessment",
            aggregate_id=str(assessment.id),
            tenant_id=tenant_id,
        )
    )
    logger.info("assessment_started", assessment_id=assessment.id)
    return ApiResponse(
        data=AssessmentResponse(
            id=assessment.id,
            tenant_id=assessment.tenant_id,
            job_id=assessment.job_id,
            candidate_id=assessment.candidate_id,
            status=assessment.status,
            final_score=assessment.final_score,
            recommendation=assessment.recommendation,
        )
    )

@router.get("/{assessment_id}", response_model=ApiResponse[AssessmentResponse])
async def get_assessment(assessment_id: int, user: User = Depends(get_current_user)):
    tenant_id = user.tenant_id or 1
    async with unit_of_work() as uow:
        assessment = await uow.assessments.get(assessment_id)
        if not assessment or assessment.tenant_id != tenant_id:
            raise HTTPException(status_code=404, detail="Assessment not found")
    return ApiResponse(
        data=AssessmentResponse(
            id=assessment.id,
            tenant_id=assessment.tenant_id,
            job_id=assessment.job_id,
            candidate_id=assessment.candidate_id,
            status=assessment.status,
            final_score=assessment.final_score,
            recommendation=assessment.recommendation,
        )
    )

@router.get("/{assessment_id}/detail", response_model=ApiResponse[AssessmentDetailResponse])
async def get_assessment_detail(assessment_id: int, user: User = Depends(get_current_user)):
    tenant_id = user.tenant_id or 1
    async with unit_of_work() as uow:
        assessment = await uow.assessments.get(assessment_id)
        if not assessment or assessment.tenant_id != tenant_id:
            raise HTTPException(status_code=404, detail="Assessment not found")
        responses = await uow.assessment_responses.list_by_assessment(assessment_id)
        scores = await uow.assessment_scores.list_by_assessment(assessment_id)
        booking = await uow.interview_bookings.get_by_assessment(assessment_id)

    def _json_field(value: str | None) -> dict[str, Any]:
        try:
            return json.loads(value or "{}")
        except json.JSONDecodeError:
            return {}

    response_data = [
        {
            "id": r.id,
            "response_type": r.response_type,
            "question_id": r.question_id,
            "question_text": r.question_text,
            "media_url": r.media_url,
            "transcript": r.transcript,
            "response_text": r.response_text,
            "duration_seconds": r.duration_seconds,
            "score_json": _json_field(r.score_json),
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in responses
    ]
    score_data = [
        {
            "id": s.id,
            "category": s.category,
            "raw_score": s.raw_score,
            "weighted_score": s.weighted_score,
            "explanation": s.explanation,
            "scored_by": s.scored_by,
            "created_at": s.created_at.isoformat() if s.created_at else None,
        }
        for s in scores
    ]
    booking_data = None
    if booking:
        booking_data = {
            "id": booking.id,
            "slot_id": booking.slot_id,
            "meeting_link": booking.meeting_link,
            "status": booking.status,
            "created_at": booking.created_at.isoformat() if booking.created_at else None,
        }

    return ApiResponse(
        data=AssessmentDetailResponse(
            id=assessment.id,
            tenant_id=assessment.tenant_id,
            job_id=assessment.job_id,
            candidate_id=assessment.candidate_id,
            path_id=assessment.path_id,
            path_json=_json_field(assessment.path_json),
            status=assessment.status,
            final_score=assessment.final_score,
            recommendation=assessment.recommendation,
            shortlisted_at=assessment.shortlisted_at.isoformat() if assessment.shortlisted_at else None,
            client_decision=assessment.client_decision,
            decided_at=assessment.decided_at.isoformat() if assessment.decided_at else None,
            responses=response_data,
            scores=score_data,
            booking=booking_data,
        )
    )

@router.post("/{assessment_id}/responses/audio", response_model=ApiResponse[dict])
async def submit_audio_response(
    assessment_id: int,
    transcript: str,
    voice_level: str = "Level 3",
    question_id: int | None = None,
    question_text: str | None = None,
    user: User = Depends(get_current_user),
):
    tenant_id = user.tenant_id or 1
    async with unit_of_work() as uow:
        assessment = await uow.assessments.get(assessment_id)
        if not assessment or assessment.tenant_id != tenant_id:
            raise HTTPException(status_code=404, detail="Assessment not found")

        response = AssessmentResponseModel(
            assessment_id=assessment_id,
            question_id=question_id,
            question_text=question_text,
            response_type="audio",
            transcript=transcript,
        )
        await uow.assessment_responses.add(response)

    task = score_audio_response.delay(response.id, transcript, voice_level)
    return ApiResponse(data={"response_id": response.id, "assessment_id": assessment_id, "task_id": task.id})

@router.post("/{assessment_id}/responses/video", response_model=ApiResponse[dict])
async def submit_video_response(
    assessment_id: int,
    transcript: str,
    question_id: int | None = None,
    question_text: str | None = None,
    user: User = Depends(get_current_user),
):
    tenant_id = user.tenant_id or 1
    async with unit_of_work() as uow:
        assessment = await uow.assessments.get(assessment_id)
        if not assessment or assessment.tenant_id != tenant_id:
            raise HTTPException(status_code=404, detail="Assessment not found")

        response = AssessmentResponseModel(
            assessment_id=assessment_id,
            question_id=question_id,
            question_text=question_text,
            response_type="video",
            transcript=transcript,
        )
        await uow.assessment_responses.add(response)

    task = score_video_response.delay(response.id, transcript)
    return ApiResponse(data={"response_id": response.id, "assessment_id": assessment_id, "task_id": task.id})

@router.post("/{assessment_id}/score", response_model=ApiResponse[ScoreResponse])
async def score_assessment(
    assessment_id: int,
    user: User = Depends(get_current_user),
):
    tenant_id = user.tenant_id or 1
    cache_key = f"assessment:{assessment_id}:score"
    cached = await cache.get(cache_key)
    if cached:
        return ApiResponse(data=ScoreResponse(**cached))

    async with unit_of_work() as uow:
        assessment = await uow.assessments.get(assessment_id)
        if not assessment or assessment.tenant_id != tenant_id:
            raise HTTPException(status_code=404, detail="Assessment not found")

    async with unit_of_work() as uow:
        responses = await uow.assessment_responses.list_by_assessment(assessment_id)

    audio_scores: list[float] = []
    video_scores: list[float] = []
    for response in responses:
        try:
            score_data = json.loads(response.score_json or "{}")
        except json.JSONDecodeError:
            score_data = {}
        overall = score_data.get("overall")
        if overall is None:
            continue
        if response.response_type == "audio":
            audio_scores.append(float(overall) * 10)
        elif response.response_type == "video":
            video_scores.append(float(overall) * 10)

    path = json.loads(assessment.path_json or "{}")
    profile_type = path.get("profile_type", "default")
    scores = {
        "audio_score": sum(audio_scores) / len(audio_scores) if audio_scores else 0.0,
        "video_score": sum(video_scores) / len(video_scores) if video_scores else 0.0,
        "skill_test": 70.0,
        "scenario_test": 70.0,
        "trait_score": 70.0,
        "resume_match": 70.0,
        "salary_notice_fit": 70.0,
    }
    result = score_candidate(scores, profile_type)
    score_response = ScoreResponse(
        assessment_id=assessment_id,
        final_score=result.get("final_score", 0.0),
        recommendation=result.get("recommendation", "neutral"),
        explanation=result,
    )

    await cache.set(cache_key, score_response.model_dump(), ttl=900)

    async with unit_of_work() as uow:
        for category, raw_score in scores.items():
            await uow.assessment_scores.add(
                AssessmentScoreModel(
                    assessment_id=assessment_id,
                    category=category,
                    raw_score=raw_score,
                    weighted_score=result.get("weighted_scores", {}).get(category, raw_score),
                    explanation="",
                    scored_by="llm",
                )
            )
        await uow.assessments.update_fields(
            assessment_id,
            {
                "final_score": score_response.final_score,
                "recommendation": score_response.recommendation,
                "status": "completed",
                "completed_at": datetime.now(timezone.utc),
            },
        )

    generate_assessment_report.delay(assessment_id)
    return ApiResponse(data=score_response)

@router.post("/{assessment_id}/shortlist", response_model=ApiResponse[AssessmentResponse])
async def shortlist_assessment(
    assessment_id: int,
    user: User = Depends(get_current_user),
):
    tenant_id = user.tenant_id or 1
    async with unit_of_work() as uow:
        assessment = await uow.assessments.get(assessment_id)
        if not assessment or assessment.tenant_id != tenant_id:
            raise HTTPException(status_code=404, detail="Assessment not found")
        if assessment.status != "completed":
            raise HTTPException(status_code=409, detail="Assessment must be completed before shortlisting")

        await uow.assessments.update_fields(
            assessment_id,
            {
                "shortlisted_at": datetime.now(timezone.utc),
                "shortlisted_by": user.id,
            },
        )
        await uow.session.refresh(assessment)

    await event_bus.publish(
        DomainEvent(
            event_type="assessment.shortlisted",
            aggregate_type="assessment",
            aggregate_id=str(assessment_id),
            tenant_id=tenant_id,
            payload={"shortlisted_by": user.id},
        )
    )
    logger.info("assessment_shortlisted", assessment_id=assessment_id, by=user.id)
    return ApiResponse(
        data=AssessmentResponse(
            id=assessment.id,
            tenant_id=assessment.tenant_id,
            job_id=assessment.job_id,
            candidate_id=assessment.candidate_id,
            status=assessment.status,
            final_score=assessment.final_score,
            recommendation=assessment.recommendation,
        )
    )

@router.post("/{assessment_id}/book-interview", response_model=ApiResponse[InterviewBookingResponse])
async def book_assessment_interview(
    assessment_id: int,
    slot_id: int,
    user: User = Depends(get_current_user),
):
    tenant_id = user.tenant_id or 1
    async with unit_of_work() as uow:
        assessment = await uow.assessments.get(assessment_id)
        if not assessment or assessment.tenant_id != tenant_id:
            raise HTTPException(status_code=404, detail="Assessment not found")
        if not assessment.shortlisted_at:
            raise HTTPException(status_code=409, detail="Candidate must be shortlisted before booking interview")

        # Optimistic lock: mark slot as booked.
        rows = await uow.interview_slots.lock_available(slot_id)
        if rows == 0:
            raise HTTPException(status_code=409, detail="Slot no longer available")

        slot = await uow.interview_slots.get(slot_id)
        if not slot or slot.tenant_id != tenant_id:
            raise HTTPException(status_code=404, detail="Slot not found")

        booking = InterviewBooking(
            tenant_id=tenant_id,
            slot_id=slot_id,
            candidate_id=assessment.candidate_id,
            job_id=assessment.job_id,
            assessment_id=assessment_id,
            meeting_link=f"https://meet.example.com/{assessment_id}",
            status="booked",
        )
        await uow.interview_bookings.add(booking)

    await event_bus.publish(
        DomainEvent(
            event_type="interview.booked",
            aggregate_type="assessment",
            aggregate_id=str(assessment_id),
            tenant_id=tenant_id,
            payload={"slot_id": slot_id},
        )
    )
    logger.info("interview_booked", assessment_id=assessment_id, slot_id=slot_id)
    return ApiResponse(
        data=InterviewBookingResponse(
            id=booking.id,
            slot_id=booking.slot_id,
            candidate_id=booking.candidate_id,
            assessment_id=booking.assessment_id,
            meeting_link=booking.meeting_link,
            status=booking.status,
            created_at=booking.created_at,
        )
    )

@router.post("/{assessment_id}/client-feedback", response_model=ApiResponse[AssessmentResponse])
async def submit_client_feedback(
    assessment_id: int,
    payload: ClientFeedbackRequest,
    user: User = Depends(get_current_user),
):
    tenant_id = user.tenant_id or 1
    async with unit_of_work() as uow:
        assessment = await uow.assessments.get(assessment_id)
        if not assessment or assessment.tenant_id != tenant_id:
            raise HTTPException(status_code=404, detail="Assessment not found")
        if not assessment.shortlisted_at:
            raise HTTPException(status_code=409, detail="Candidate must be shortlisted before feedback")

        await uow.assessments.update_fields(
            assessment_id,
            {
                "client_feedback_json": json.dumps({
                    "ratings": payload.ratings,
                    "notes": payload.notes,
                    "recommendation": payload.recommendation,
                }),
            },
        )
        await uow.session.refresh(assessment)

    await event_bus.publish(
        DomainEvent(
            event_type="client.feedback.submitted",
            aggregate_type="assessment",
            aggregate_id=str(assessment_id),
            tenant_id=tenant_id,
        )
    )
    logger.info("client_feedback_submitted", assessment_id=assessment_id)
    return ApiResponse(
        data=AssessmentResponse(
            id=assessment.id,
            tenant_id=assessment.tenant_id,
            job_id=assessment.job_id,
            candidate_id=assessment.candidate_id,
            status=assessment.status,
            final_score=assessment.final_score,
            recommendation=assessment.recommendation,
        )
    )

@router.post("/{assessment_id}/decision", response_model=ApiResponse[DecisionResponse])
async def submit_client_decision(
    assessment_id: int,
    payload: DecisionRequest,
    user: User = Depends(get_current_user),
):
    tenant_id = user.tenant_id or 1
    if payload.decision not in ("hire", "reject", "keep_in_pool"):
        raise HTTPException(status_code=400, detail="Decision must be hire, reject, or keep_in_pool")

    async with unit_of_work() as uow:
        assessment = await uow.assessments.get(assessment_id)
        if not assessment or assessment.tenant_id != tenant_id:
            raise HTTPException(status_code=404, detail="Assessment not found")
        if not assessment.shortlisted_at:
            raise HTTPException(status_code=409, detail="Candidate must be shortlisted before decision")

        decided_at = datetime.now(timezone.utc)
        await uow.assessments.update_fields(
            assessment_id,
            {
                "client_decision": payload.decision,
                "decided_at": decided_at,
            },
        )

    await event_bus.publish(
        DomainEvent(
            event_type="client.decision.made",
            aggregate_type="assessment",
            aggregate_id=str(assessment_id),
            tenant_id=tenant_id,
            payload={"decision": payload.decision, "notes": payload.notes},
        )
    )
    logger.info("client_decision_made", assessment_id=assessment_id, decision=payload.decision)
    return ApiResponse(
        data=DecisionResponse(
            assessment_id=assessment_id,
            client_decision=payload.decision,
            decided_at=decided_at,
        )
    )
