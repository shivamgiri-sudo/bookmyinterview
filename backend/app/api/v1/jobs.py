from __future__ import annotations
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from app.core.unit_of_work import unit_of_work
from app.core.cache import cache
from app.core.logging import get_logger
from app.db.models import User, InterviewSlot
from app.schemas.common import ApiResponse, Meta, PaginationParams
from app.schemas.interview import InterviewSlotResponse
from app.api.v1.intake import get_current_user

logger = get_logger("api.jobs")
router = APIRouter()

@router.get("", response_model=ApiResponse[list[dict]])
async def list_jobs(
    params: PaginationParams = Depends(),
    user: User = Depends(get_current_user),
):
    tenant_id = user.tenant_id or 1
    cache_key = f"jobs:{tenant_id}:page:{params.page}:size:{params.page_size}"
    cached = await cache.get(cache_key)
    if cached:
        return ApiResponse(data=cached["data"], meta=cached["meta"])

    async with unit_of_work() as uow:
        jobs = await uow.jobs.list_by_tenant(
            tenant_id=tenant_id,
            limit=params.page_size,
            offset=params.offset,
        )
        total = await uow.jobs.count_by_tenant(tenant_id=tenant_id)

    data = [
        {
            "id": j.id,
            "designation": j.designation,
            "department": j.department,
            "location": j.location,
            "seniority": j.seniority,
            "status": j.status,
            "created_at": j.created_at.isoformat() if j.created_at else None,
        }
        for j in jobs
    ]
    pages = (total + params.page_size - 1) // params.page_size
    meta = Meta(page=params.page, page_size=params.page_size, total=total, pages=pages)
    await cache.set(cache_key, {"data": data, "meta": meta.model_dump()}, ttl=600)
    return ApiResponse(data=data, meta=meta)

@router.get("/{job_id}", response_model=ApiResponse[dict])
async def get_job(job_id: int, user: User = Depends(get_current_user)):
    tenant_id = user.tenant_id or 1
    cache_key = f"job:{job_id}:meta"
    cached = await cache.get(cache_key)
    if cached:
        return ApiResponse(data=cached)

    async with unit_of_work() as uow:
        job = await uow.jobs.get(job_id)
        if not job or job.tenant_id != tenant_id:
            raise HTTPException(status_code=404, detail="Job not found")

    data = {
        "id": job.id,
        "designation": job.designation,
        "department": job.department,
        "location": job.location,
        "seniority": job.seniority,
        "status": job.status,
        "generated_jd": job.generated_jd,
    }
    await cache.set(cache_key, data, ttl=3600)
    return ApiResponse(data=data)

@router.get("/{job_id}/assessment-path", response_model=ApiResponse[dict])
async def get_job_assessment_path(job_id: int, user: User = Depends(get_current_user)):
    tenant_id = user.tenant_id or 1
    cache_key = f"job:{job_id}:path"
    cached = await cache.get(cache_key)
    if cached:
        return ApiResponse(data={"job_id": job_id, "path": cached})

    async with unit_of_work() as uow:
        job = await uow.jobs.get(job_id)
        if not job or job.tenant_id != tenant_id:
            raise HTTPException(status_code=404, detail="Job not found")

    import json
    path = json.loads(job.requirement_json) if job.requirement_json else {}
    await cache.set(cache_key, path, ttl=3600)
    return ApiResponse(data={"job_id": job_id, "path": path})

@router.get("/{job_id}/slots", response_model=ApiResponse[list[InterviewSlotResponse]])
async def list_job_slots(
    job_id: int,
    user: User = Depends(get_current_user),
):
    tenant_id = user.tenant_id or 1
    async with unit_of_work() as uow:
        job = await uow.jobs.get(job_id)
        if not job or job.tenant_id != tenant_id:
            raise HTTPException(status_code=404, detail="Job not found")
        slots = await uow.interview_slots.list_available_by_job(tenant_id, job_id)

    data = [
        InterviewSlotResponse(
            id=s.id,
            job_id=s.job_id,
            start_time=s.start_time,
            end_time=s.end_time,
            mode=s.mode,
            status=s.status,
        )
        for s in slots
    ]
    return ApiResponse(data=data)

@router.post("/{job_id}/slots", response_model=ApiResponse[list[InterviewSlotResponse]], status_code=201)
async def create_job_slots(
    job_id: int,
    slots: list[InterviewSlotResponse],
    user: User = Depends(get_current_user),
):
    tenant_id = user.tenant_id or 1
    async with unit_of_work() as uow:
        job = await uow.jobs.get(job_id)
        if not job or job.tenant_id != tenant_id:
            raise HTTPException(status_code=404, detail="Job not found")

        created = []
        for slot_input in slots:
            slot = InterviewSlot(
                tenant_id=tenant_id,
                job_id=job_id,
                created_by=user.id,
                start_time=slot_input.start_time,
                end_time=slot_input.end_time,
                mode=slot_input.mode,
                status="available",
            )
            created.append(await uow.interview_slots.add(slot))

    logger.info("job_slots_created", job_id=job_id, count=len(created))
    data = [
        InterviewSlotResponse(
            id=s.id,
            job_id=s.job_id,
            start_time=s.start_time,
            end_time=s.end_time,
            mode=s.mode,
            status=s.status,
        )
        for s in created
    ]
    return ApiResponse(data=data)
