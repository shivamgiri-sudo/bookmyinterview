# Persistence and Human Review Layer

## What Was Added

### Persistent data APIs
File: `backend/app/api/data_routes.py`

Routes:
- POST `/api/data/tenants`
- GET `/api/data/tenants/{tenant_id}`
- POST `/api/data/jobs`
- GET `/api/data/jobs/{job_id}`
- POST `/api/data/candidates`

Behavior:
- Creates tenants, jobs, and candidates.
- When a job is created, the backend generates the assessment path automatically.
- Every sensitive data creation event writes an audit log.

### Database bootstrap
File: `backend/db_bootstrap.sql`

Includes:
- tenants
- users
- job_requests
- candidates
- assessments
- integration_credentials
- audit_logs
- human_review_queue

### Human review queue
Files:
- `backend/app/db/review_models.py`
- `backend/app/api/review_routes.py`

Routes to mount:
- POST `/api/review/queue`
- GET `/api/review/queue`
- POST `/api/review/queue/{review_id}/resolve`

Mounting instruction:
Add this in `backend/app/main.py`:

```python
from app.api.review_routes import review_router
app.include_router(review_router, prefix="/api/review")
```

## Why Human Review Matters
For a global enterprise hiring product, high-risk decisions should not be fully automatic. Human review is required for:
- Candidate rejection
- Compliance flags
- High-risk scraped or public data enrichment
- Senior leadership assessments
- Client-specific scoring override
- Low confidence AI evaluation

## Production Direction
- Replace MVP `Base.metadata.create_all` with Alembic migrations.
- Add reviewer assignment logic.
- Add SLA timers and escalation rules.
- Add audit dashboard.
- Add reviewer conflict-of-interest controls.
