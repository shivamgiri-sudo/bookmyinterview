from __future__ import annotations
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import AssessmentResponse
from app.repositories.base import BaseRepository


class AssessmentResponseRepository(BaseRepository[AssessmentResponse]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, AssessmentResponse)

    async def list_by_assessment(
        self,
        assessment_id: int,
        limit: int = 100,
        offset: int = 0,
    ) -> list[AssessmentResponse]:
        stmt = (
            select(AssessmentResponse)
            .where(AssessmentResponse.assessment_id == assessment_id)
            .order_by(AssessmentResponse.created_at.asc())
            .limit(limit)
            .offset(offset)
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().all())
