from __future__ import annotations
from typing import Generic, TypeVar, Any
from pydantic import BaseModel

T = TypeVar("T")

class Meta(BaseModel):
    page: int = 1
    page_size: int = 20
    total: int = 0
    pages: int = 0

class ApiResponse(BaseModel, Generic[T]):
    data: T
    meta: Meta | None = None
    error: dict[str, Any] | None = None

class PaginationParams(BaseModel):
    page: int = 1
    page_size: int = 20

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size
