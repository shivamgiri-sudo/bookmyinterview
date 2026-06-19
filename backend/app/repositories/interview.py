from __future__ import annotations
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import InterviewSlot, InterviewBooking
from app.repositories.base import BaseRepository

class InterviewSlotRepository(BaseRepository[InterviewSlot]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, InterviewSlot)

    async def list_available_by_job(
        self,
        tenant_id: int,
        job_id: int,
        limit: int = 50,
        offset: int = 0,
    ) -> list[InterviewSlot]:
        stmt = (
            select(InterviewSlot)
            .where(
                InterviewSlot.tenant_id == tenant_id,
                InterviewSlot.job_id == job_id,
                InterviewSlot.status == "available",
            )
            .order_by(InterviewSlot.start_time)
            .limit(limit)
            .offset(offset)
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def lock_available(self, slot_id: int) -> int:
        stmt = (
            update(InterviewSlot)
            .where(
                InterviewSlot.id == slot_id,
                InterviewSlot.status == "available",
            )
            .values(status="booked")
        )
        result = await self._session.execute(stmt)
        return result.rowcount


class InterviewBookingRepository(BaseRepository[InterviewBooking]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, InterviewBooking)

    async def get_by_assessment(self, assessment_id: int) -> InterviewBooking | None:
        stmt = select(InterviewBooking).where(InterviewBooking.assessment_id == assessment_id)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()
