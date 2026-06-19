from __future__ import annotations
from typing import Any
import math

class MockVectorSearch:
    def embed(self, text: str) -> list[float]:
        buckets = [0.0] * 16
        for idx, char in enumerate(text.lower()):
            buckets[idx % 16] += (ord(char) % 31) / 31
        norm = math.sqrt(sum(x*x for x in buckets)) or 1
        return [round(x / norm, 6) for x in buckets]

    def similarity(self, a: str, b: str) -> float:
        va = self.embed(a)
        vb = self.embed(b)
        return round(sum(x*y for x, y in zip(va, vb)) * 100, 2)

    def match_texts(self, query: str, documents: list[dict[str, Any]], top_k: int = 10) -> list[dict[str, Any]]:
        ranked = []
        for doc in documents:
            text = str(doc.get("text", ""))
            ranked.append({**doc, "semantic_score": self.similarity(query, text)})
        return sorted(ranked, key=lambda item: item["semantic_score"], reverse=True)[:top_k]

def get_vector_search() -> MockVectorSearch:
    # Replace with Qdrant/Pinecone/pgvector adapter in production.
    return MockVectorSearch()
