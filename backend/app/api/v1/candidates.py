from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException
from app.core.unit_of_work import unit_of_work
from app.core.cache import cache
from app.core.events import event_bus, DomainEvent
from app.core.logging import get_logger
from app.db.models import Candidate, User
from app.schemas.common import ApiResponse, Meta, PaginationParams
from app.schemas.candidate import CandidateCreate, CandidateResponse
from app.api.v1.intake import get_current_user
from app.tasks.resume_tasks import parse_resume

logger = get_logger("api.candidates")
router = APIRouter()

@router.post("", response_model=ApiResponse[CandidateResponse], status_code=201)
async def create_candidate(
    payload: CandidateCreate,
    user: User = Depends(get_current_user),
):
    tenant_id = user.tenant_id or 1
    async with unit_of_work() as uow:
        existing = await uow.candidates.get_by_email(tenant_id, payload.email)
        if existing:
            raise HTTPException(status_code=409, detail="Candidate already exists")
        candidate = Candidate(
            tenant_id=tenant_id,
            full_name=payload.full_name,
            email=payload.email,
            phone=payload.phone,
            location=payload.location,
            consent_status=payload.consent_status,
        )
        await uow.candidates.add(candidate)

    await event_bus.publish(
        DomainEvent(
            event_type="candidate.created",
            aggregate_type="candidate",
            aggregate_id=str(candidate.id),
            tenant_id=tenant_id,
        )
    )
    logger.info("candidate_created", candidate_id=candidate.id, tenant_id=tenant_id)
    return ApiResponse(data=CandidateResponse(**_candidate_dict(candidate)))

@router.get("", response_model=ApiResponse[list[CandidateResponse]])
async def list_candidates(
    params: PaginationParams = Depends(),
    user: User = Depends(get_current_user),
):
    tenant_id = user.tenant_id or 1
    async with unit_of_work() as uow:
        candidates = await uow.candidates.list_by_tenant(
            tenant_id=tenant_id,
            limit=params.page_size,
            offset=params.offset,
        )
        total = len(candidates)  # Simplified; production uses count query.

    data = [CandidateResponse(**_candidate_dict(c)) for c in candidates]
    meta = Meta(page=params.page, page_size=params.page_size, total=total)
    return ApiResponse(data=data, meta=meta)

@router.get("/{candidate_id}", response_model=ApiResponse[CandidateResponse])
async def get_candidate(candidate_id: int, user: User = Depends(get_current_user)):
    tenant_id = user.tenant_id or 1
    cache_key = f"candidate:{candidate_id}:profile"
    cached = await cache.get(cache_key)
    if cached:
        return ApiResponse(data=CandidateResponse(**cached))

    async with unit_of_work() as uow:
        candidate = await uow.candidates.get(candidate_id)
        if not candidate or candidate.tenant_id != tenant_id:
            raise HTTPException(status_code=404, detail="Candidate not found")

    data = _candidate_dict(candidate)
    await cache.set(cache_key, data, ttl=1800)
    return ApiResponse(data=CandidateResponse(**data))

@router.post("/{candidate_id}/resume", response_model=ApiResponse[dict])
async def upload_resume(
    candidate_id: int,
    user: User = Depends(get_current_user),
):
    tenant_id = user.tenant_id or 1
    async with unit_of_work() as uow:
        candidate = await uow.candidates.get(candidate_id)
        if not candidate or candidate.tenant_id != tenant_id:
            raise HTTPException(status_code=404, detail="Candidate not found")

    # Production: upload to object storage; here queue parse job.
    resume_url = f"https://storage.example.com/resumes/{candidate_id}.pdf"
    task = parse_resume.delay(candidate_id, resume_url)
    logger.info("resume_parse_queued", candidate_id=candidate_id, task_id=task.id)
    return ApiResponse(data={"candidate_id": candidate_id, "task_id": task.id, "resume_url": resume_url})

def _candidate_dict(candidate: Candidate) -> dict:
    return {
        "id": candidate.id,
        "tenant_id": candidate.tenant_id,
        "full_name": candidate.full_name,
        "email": candidate.email,
        "phone": candidate.phone,
        "location": candidate.location,
        "consent_status": candidate.consent_status,
        "profile_json": candidate.profile_json,
    }
