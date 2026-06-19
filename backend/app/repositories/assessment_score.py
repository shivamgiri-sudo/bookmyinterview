from __future__ import annotations
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import AssessmentScore
from app.repositories.base import BaseRepository


class AssessmentScoreRepository(BaseRepository[AssessmentScore]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, AssessmentScore)

    async def list_by_assessment(
        self,
        assessment_id: int,
    ) -> list[AssessmentScore]:
        stmt = select(AssessmentScore).where(AssessmentScore.assessment_id == assessment_id)
        result = await self._session.execute(stmt)
        return list(result.scalars().all())
