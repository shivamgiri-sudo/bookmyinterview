from __future__ import annotations
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import JobAssessmentPath
from app.repositories.base import BaseRepository


class JobAssessmentPathRepository(BaseRepository[JobAssessmentPath]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, JobAssessmentPath)

    async def get_latest_by_job(
        self,
        tenant_id: int,
        job_id: int,
    ) -> JobAssessmentPath | None:
        """Return the most recent assessment path for a job."""
        stmt = (
            select(JobAssessmentPath)
            .where(JobAssessmentPath.job_id == job_id)
            .order_by(JobAssessmentPath.created_at.desc())
            .limit(1)
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()
