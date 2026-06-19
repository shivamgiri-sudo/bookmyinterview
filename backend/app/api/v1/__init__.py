from __future__ import annotations
from fastapi import APIRouter
from app.api.v1 import health, intake, jobs, candidates, assessments

router = APIRouter(prefix="/v1")
router.include_router(health.router)
router.include_router(intake.router, prefix="/intake", tags=["intake"])
router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
router.include_router(candidates.router, prefix="/candidates", tags=["candidates"])
router.include_router(assessments.router, prefix="/assessments", tags=["assessments"])
