from __future__ import annotations
from dataclasses import dataclass

@dataclass
class DeliveryRequest:
    recipient: str
    template_key: str
    subject: str
    body: str
    channel: str = "email"


def deliver_message(request: DeliveryRequest) -> dict:
    # MVP adapter: records the intended delivery contract without calling a paid provider.
    return {
        "status": "queued_mock",
        "channel": request.channel,
        "recipient": mask_recipient(request.recipient),
        "template_key": request.template_key,
        "provider": "mock",
    }


def mask_recipient(value: str) -> str:
    if "@" in value:
        name, domain = value.split("@", 1)
        return f"{name[:2]}***@{domain}"
    return value[:3] + "***"
