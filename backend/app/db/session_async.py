from __future__ import annotations
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.core.config import get_settings

settings = get_settings()

# Build async URL if not explicitly provided.
def _build_async_url() -> str:
    if settings.async_database_url:
        return settings.async_database_url
    url = settings.database_url
    if url.startswith("sqlite"):
        return url.replace("sqlite://", "sqlite+aiosqlite://", 1)
    if url.startswith("postgresql+psycopg"):
        return url.replace("postgresql+psycopg", "postgresql+asyncpg", 1)
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url

def _create_async_engine():
    url = _build_async_url()
    kwargs = {"pool_pre_ping": True, "echo": settings.db_echo}
    if url.startswith("sqlite"):
        # SQLite async driver uses NullPool by default; ignore sizing params.
        return create_async_engine(url, **kwargs)
    kwargs.update(
        pool_size=settings.db_pool_size,
        max_overflow=settings.db_max_overflow,
        pool_timeout=settings.db_pool_timeout,
    )
    return create_async_engine(url, **kwargs)


async_engine = _create_async_engine()

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)

@asynccontextmanager
async def get_async_session():
    """Yield an async DB session with automatic rollback on exception."""
    session = AsyncSessionLocal()
    try:
        yield session
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    finally:
        await session.close()

async def get_db_async():
    """FastAPI dependency for async sessions."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
