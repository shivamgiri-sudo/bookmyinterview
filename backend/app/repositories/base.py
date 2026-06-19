from __future__ import annotations
from typing import Generic, TypeVar, Type
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

ModelT = TypeVar("ModelT")

class BaseRepository(Generic[ModelT]):
    def __init__(self, session: AsyncSession, model: Type[ModelT]):
        self._session = session
        self._model = model

    async def get(self, pk: int) -> ModelT | None:
        return await self._session.get(self._model, pk)

    async def get_by_ids(self, ids: list[int]) -> list[ModelT]:
        if not ids:
            return []
        stmt = select(self._model).where(self._model.id.in_(ids))  # type: ignore[attr-defined]
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def add(self, instance: ModelT) -> ModelT:
        self._session.add(instance)
        await self._session.flush()
        return instance

    async def update_fields(self, pk: int, fields: dict) -> int:
        stmt = update(self._model).where(self._model.id == pk).values(**fields)  # type: ignore[attr-defined]
        result = await self._session.execute(stmt)
        return result.rowcount
