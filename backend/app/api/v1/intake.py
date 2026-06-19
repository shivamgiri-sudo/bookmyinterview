from __future__ import annotations
import json
from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from app.core.unit_of_work import unit_of_work
from app.core.cache import cache
from app.core.events import event_bus, DomainEvent
from app.core.logging import get_logger
from app.db.models import JobRequest, User, InterviewSlot, JobAssessmentPath
from app.schemas.common import ApiResponse
from app.schemas.intake import JobIntakeCreate, JobIntakeResponse
from app.services.assessment import build_assessment_path
from app.services.jd_engine import generate_jd

logger = get_logger("api.intake")
router = APIRouter()

async def get_current_user():
    # Placeholder dependency; production uses JWT.
    return User(id=1, tenant_id=1, email="admin@example.com", full_name="Admin", password_hash="")

@router.post("/analyze", response_model=ApiResponse[JobIntakeResponse])
async def analyze_intake(payload: JobIntakeCreate, user: User = Depends(get_current_user)):
    tenant_id = user.tenant_id or 1
    async with unit_of_work() as uow:
        job = JobRequest(
            tenant_id=tenant_id,
            designation=payload.designation,
            department=payload.department or "General",
            industry=payload.industry,
            location=payload.location,
            seniority=payload.seniority,
            salary_min=payload.salary_min,
            salary_max=payload.salary_max,
            currency=payload.currency,
            status="draft",
            requirement_json=payload.model_dump_json(),
            created_by=user.id,
        )
        await uow.jobs.add(job)

        # Create interview slots provided at intake time.
        for slot_input in payload.interview_slots:
            slot = InterviewSlot(
                tenant_id=tenant_id,
                job_id=job.id,
                created_by=user.id,
                start_time=slot_input.start_time,
                end_time=slot_input.end_time,
                mode=slot_input.mode,
                status="available",
            )
            await uow.interview_slots.add(slot)

    path = build_assessment_path(payload.model_dump())
    jd = generate_jd(payload.model_dump(), path)

    # Persist assessment path and generated JD.
    jd_text = json.dumps(jd) if isinstance(jd, dict) else str(jd)
    async with unit_of_work() as uow:
        path_record = JobAssessmentPath(
            job_id=job.id,
            path_json=json.dumps(path),
            generated_by="rule_engine",
            version=1,
        )
        await uow.job_assessment_paths.add(path_record)
        await uow.jobs.update_fields(job.id, {"generated_jd": jd_text})

    # Cache and emit event.
    await cache.set(f"job:{job.id}:path", path, ttl=3600)
    await cache.set(f"job:{job.id}:jd", jd_text, ttl=3600)
    await cache.delete_pattern(f"jobs:{tenant_id}:*")
    await event_bus.publish(
        DomainEvent(
            event_type="job.intake.analyzed",
            aggregate_type="job_request",
            aggregate_id=str(job.id),
            tenant_id=job.tenant_id,
            payload={"designation": payload.designation, "slots": len(payload.interview_slots)},
        )
    )

    response = JobIntakeResponse(
        id=job.id,
        tenant_id=job.tenant_id,
        designation=job.designation,
        status=job.status,
        assessment_path=path,
        generated_jd=jd_text,
        interview_slots_count=len(payload.interview_slots),
    )
    logger.info("intake_analyzed", job_id=job.id, tenant_id=job.tenant_id, slots=len(payload.interview_slots))
    return ApiResponse(data=response)
