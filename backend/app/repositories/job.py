from __future__ import annotations
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import JobRequest
from app.repositories.base import BaseRepository

class JobRepository(BaseRepository[JobRequest]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, JobRequest)

    async def list_by_tenant(
        self,
        tenant_id: int,
        status: str | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> list[JobRequest]:
        stmt = select(JobRequest).where(JobRequest.tenant_id == tenant_id)
        if status:
            stmt = stmt.where(JobRequest.status == status)
        stmt = stmt.order_by(JobRequest.created_at.desc()).limit(limit).offset(offset)
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def count_by_tenant(self, tenant_id: int, status: str | None = None) -> int:
        stmt = select(JobRequest).where(JobRequest.tenant_id == tenant_id)
        if status:
            stmt = stmt.where(JobRequest.status == status)
        result = await self._session.execute(stmt)
        return len(result.scalars().all())
