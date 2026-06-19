from __future__ import annotations
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Assessment
from app.repositories.base import BaseRepository

class AssessmentRepository(BaseRepository[Assessment]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Assessment)

    async def list_by_job(
        self,
        tenant_id: int,
        job_id: int,
        limit: int = 20,
        offset: int = 0,
    ) -> list[Assessment]:
        stmt = (
            select(Assessment)
            .where(Assessment.tenant_id == tenant_id, Assessment.job_id == job_id)
            .order_by(Assessment.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def list_by_candidate(
        self,
        tenant_id: int,
        candidate_id: int,
        limit: int = 20,
        offset: int = 0,
    ) -> list[Assessment]:
        stmt = (
            select(Assessment)
            .where(
                Assessment.tenant_id == tenant_id,
                Assessment.candidate_id == candidate_id,
            )
            .order_by(Assessment.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().all())
