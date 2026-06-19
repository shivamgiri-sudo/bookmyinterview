# Caching Strategy

> Multi-layer caching to reduce DB load, LLM costs, and latency. Redis is the primary cache backend.

## Cache Layers

### 1. Session / Auth Cache (Redis, TTL 15 min)

- JWT token blocklist after logout.
- User profile + role cache keyed by `user:{user_id}`.
- Refresh token metadata.

### 2. Application Object Cache (Redis, TTL 1–60 min)

| Key Pattern | TTL | Use Case |
|-------------|-----|----------|
| `tenant:{tenant_id}:config` | 5 min | Tenant settings, quotas |
| `job:{job_id}:path` | 60 min | Generated assessment path |
| `job:{job_id}:jd` | 60 min | Generated job description |
| `candidate:{candidate_id}:profile` | 30 min | Parsed profile summary |
| `assessment:{assessment_id}:score` | 15 min | Final computed score |
| `traits:{designation}:{seniority}` | 24 h | Trait question templates |

### 3. Query Result Cache (Redis, TTL 5–30 min)

- Paginated lists: `jobs:{tenant_id}:page:{n}` TTL 10 min.
- Dashboard aggregates: `dashboard:{tenant_id}:{metric}` TTL 5 min.
- Available slots: `slots:{job_id}:{date}` TTL 5 min.

### 4. Rate Limit Cache (Redis, TTL 1 min)

- Sliding window counters per `(tenant_id, user_id, endpoint)`.

### 5. CDN Cache (Edge)

- Static frontend assets, resume PDFs, report downloads via signed URLs.

## Cache Invalidation Rules

| Event | Invalidation |
|-------|--------------|
| Job updated | `job:{job_id}:*`, `jobs:{tenant_id}:*` |
| Candidate profile updated | `candidate:{candidate_id}:*` |
| Assessment scored | `assessment:{assessment_id}:score` |
| Trait templates updated | `traits:*` |
| Tenant config updated | `tenant:{tenant_id}:config` |

## Implementation Patterns

### Cache-aside (Read)

```python
async def get_assessment_path(job_id: int) -> dict:
    key = f"job:{job_id}:path"
    cached = await cache.get(key)
    if cached:
        return cached
    path = await repository.get_path(job_id)
    await cache.set(key, path, ttl=3600)
    return path
```

### Write-through (Write)

```python
async def update_job(job_id: int, data: dict):
    async with unit_of_work() as uow:
        job = await uow.jobs.update(job_id, data)
        await cache.delete(f"job:{job_id}:*")
        await uow.commit()
```

### Cache Warming

- Pre-compute trait question sets for common role/seniority combinations.
- Warm dashboard aggregates via Celery beat schedule every 5 min.

## Serialization

- Values stored as compressed JSON (gzip for >1KB).
- Pydantic models provide schema validation on retrieval.

## Failure Handling

- Cache failure must not break the request (degrade to DB).
- Circuit breaker on Redis connection errors.
- Exponential backoff reconnect.
