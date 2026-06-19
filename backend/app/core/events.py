from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Callable, Awaitable, Any
from app.core.logging import get_logger

logger = get_logger("events")

@dataclass
class DomainEvent:
    event_type: str
    aggregate_type: str
    aggregate_id: str | int
    tenant_id: int | None = None
    payload: dict[str, Any] = field(default_factory=dict)
    occurred_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

EventHandler = Callable[[DomainEvent], Awaitable[None]]

class EventBus:
    """Simple async domain event bus for decoupled side effects."""

    def __init__(self):
        self._handlers: dict[str, list[EventHandler]] = {}

    def subscribe(self, event_type: str, handler: EventHandler):
        self._handlers.setdefault(event_type, []).append(handler)

    async def publish(self, event: DomainEvent):
        handlers = self._handlers.get(event.event_type, [])
        if not handlers:
            return
        for handler in handlers:
            try:
                await handler(event)
            except Exception as exc:
                logger.error(
                    "event_handler_failed",
                    event_type=event.event_type,
                    handler=handler.__name__,
                    error=str(exc),
                )

event_bus = EventBus()
