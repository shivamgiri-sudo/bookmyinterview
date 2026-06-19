from __future__ import annotations
from typing import Any, Protocol
import httpx
from app.core.config import get_settings

class LLMProvider(Protocol):
    async def generate_json(self, system: str, user: str, schema_hint: dict[str, Any] | None = None) -> dict[str, Any]: ...

class MockLLMProvider:
    async def generate_json(self, system: str, user: str, schema_hint: dict[str, Any] | None = None) -> dict[str, Any]:
        return {
            "provider": "mock",
            "system_summary": system[:120],
            "user_summary": user[:240],
            "schema_hint": schema_hint or {},
            "result": "Mock result. Connect OpenAI/Claude/Gemini adapter through Integration Vault for production."
        }

class OpenAICompatibleProvider:
    def __init__(self, api_key: str, base_url: str = "https://api.openai.com/v1", model: str = "gpt-4.1-mini"):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.model = model

    async def generate_json(self, system: str, user: str, schema_hint: dict[str, Any] | None = None) -> dict[str, Any]:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "model": self.model,
                    "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
                    "response_format": {"type": "json_object"},
                },
            )
            response.raise_for_status()
            return response.json()

def get_llm_provider(api_key: str | None = None) -> LLMProvider:
    settings = get_settings()
    if settings.llm_provider == "openai" and api_key:
        return OpenAICompatibleProvider(api_key=api_key)
    return MockLLMProvider()
