from __future__ import annotations
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Candidate
from app.repositories.base import BaseRepository

class CandidateRepository(BaseRepository[Candidate]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Candidate)

    async def get_by_email(self, tenant_id: int, email: str) -> Candidate | None:
        stmt = select(Candidate).where(
            Candidate.tenant_id == tenant_id,
            Candidate.email == email,
            Candidate.deleted_at.is_(None),
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_by_tenant(
        self,
        tenant_id: int,
        limit: int = 20,
        offset: int = 0,
    ) -> list[Candidate]:
        stmt = (
            select(Candidate)
            .where(Candidate.tenant_id == tenant_id, Candidate.deleted_at.is_(None))
            .order_by(Candidate.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().all())
