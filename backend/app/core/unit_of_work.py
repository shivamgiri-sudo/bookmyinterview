from __future__ import annotations
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session_async import AsyncSessionLocal
from app.repositories.tenant import TenantRepository
from app.repositories.job import JobRepository
from app.repositories.candidate import CandidateRepository
from app.repositories.assessment import AssessmentRepository
from app.repositories.assessment_response import AssessmentResponseRepository
from app.repositories.assessment_score import AssessmentScoreRepository
from app.repositories.job_assessment_path import JobAssessmentPathRepository
from app.repositories.interview import InterviewSlotRepository, InterviewBookingRepository

class UnitOfWork:
    """Transaction boundary with repository composition."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.tenants = TenantRepository(session)
        self.jobs = JobRepository(session)
        self.candidates = CandidateRepository(session)
        self.assessments = AssessmentRepository(session)
        self.assessment_responses = AssessmentResponseRepository(session)
        self.assessment_scores = AssessmentScoreRepository(session)
        self.job_assessment_paths = JobAssessmentPathRepository(session)
        self.interview_slots = InterviewSlotRepository(session)
        self.interview_bookings = InterviewBookingRepository(session)

    async def commit(self):
        await self.session.commit()

    async def rollback(self):
        await self.session.rollback()

    async def close(self):
        await self.session.close()


@asynccontextmanager
async def unit_of_work():
    session = AsyncSessionLocal()
    uow = UnitOfWork(session)
    try:
        yield uow
        await uow.commit()
    except Exception:
        await uow.rollback()
        raise
    finally:
        await uow.close()
