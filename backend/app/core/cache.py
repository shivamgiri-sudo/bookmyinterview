from __future__ import annotations
import gzip
import json
import redis.asyncio as aioredis
from typing import Any
from app.core.config import get_settings
from app.core.logging import get_logger

settings = get_settings()
logger = get_logger("cache")

class Cache:
    """Async Redis cache abstraction with compression and graceful degradation."""

    def __init__(self):
        self._redis: aioredis.Redis | None = None
        self._disabled = False

    async def connect(self):
        if self._redis or self._disabled:
            return
        try:
            self._redis = aioredis.from_url(
                settings.redis_url,
                socket_timeout=settings.redis_socket_timeout,
                socket_connect_timeout=settings.redis_socket_connect_timeout,
                health_check_interval=settings.redis_health_check_interval,
                decode_responses=False,
            )
            await self._redis.ping()
            logger.info("redis_connected")
        except Exception as exc:
            logger.error("redis_connect_failed", error=str(exc))
            self._disabled = True

    async def get(self, key: str) -> Any | None:
        if self._disabled or not self._redis:
            return None
        try:
            raw = await self._redis.get(key)
            if raw is None:
                return None
            if isinstance(raw, bytes):
                try:
                    raw = gzip.decompress(raw)
                except OSError:
                    pass
            return json.loads(raw)
        except Exception as exc:
            logger.warning("cache_get_failed", key=key, error=str(exc))
            return None

    async def set(
        self,
        key: str,
        value: Any,
        ttl: int | None = None,
        compress: bool = True,
    ) -> bool:
        if self._disabled or not self._redis:
            return False
        try:
            data = json.dumps(value, default=str).encode("utf-8")
            if compress and len(data) > 1024:
                data = gzip.compress(data)
            await self._redis.setex(
                key,
                ttl or settings.cache_default_ttl_seconds,
                data,
            )
            return True
        except Exception as exc:
            logger.warning("cache_set_failed", key=key, error=str(exc))
            return False

    async def delete(self, key: str) -> bool:
        if self._disabled or not self._redis:
            return False
        try:
            await self._redis.delete(key)
            return True
        except Exception as exc:
            logger.warning("cache_delete_failed", key=key, error=str(exc))
            return False

    async def delete_pattern(self, pattern: str) -> int:
        if self._disabled or not self._redis:
            return 0
        try:
            keys = []
            async for key in self._redis.scan_iter(match=pattern):
                keys.append(key)
            if keys:
                await self._redis.delete(*keys)
            return len(keys)
        except Exception as exc:
            logger.warning("cache_delete_pattern_failed", pattern=pattern, error=str(exc))
            return 0

    async def health(self) -> dict[str, Any]:
        if self._disabled or not self._redis:
            return {"status": "unavailable"}
        try:
            pong = await self._redis.ping()
            info = await self._redis.info("server")
            return {
                "status": "ok" if pong else "degraded",
                "version": info.get("redis_version"),
            }
        except Exception as exc:
            return {"status": "error", "error": str(exc)}


cache = Cache()
