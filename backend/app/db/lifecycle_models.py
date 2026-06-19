from __future__ import annotations
from datetime import datetime, timezone
from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from app.db.session import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class AccountChallenge(Base):
    __tablename__ = "account_challenges"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    challenge_value: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255), index=True)
    purpose: Mapped[str] = mapped_column(String(80), index=True)
    used: Mapped[bool] = mapped_column(Boolean, default=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


class SessionGrant(Base):
    __tablename__ = "session_grants"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    grant_value: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255), index=True)
    role: Mapped[str] = mapped_column(String(80))
    tenant_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    revoked: Mapped[bool] = mapped_column(Boolean, default=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


class SessionBlock(Base):
    __tablename__ = "session_blocks"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    access_value: Mapped[str] = mapped_column(String(1024), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
