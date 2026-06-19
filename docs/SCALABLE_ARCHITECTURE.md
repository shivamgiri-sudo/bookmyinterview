# Scalable Production Architecture

> Target: 100K+ daily assessments, multi-region, multi-tenant, audit-ready AI Hiring OS.

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Edge Layer                                      │
│  Cloudflare / AWS CloudFront / GCP Cloud CDN                                 │
│  TLS termination, DDoS, WAF, bot management, geo-routing                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
┌─────────────────────────────────────────────────────────────────────────────┐
│                          API Gateway / Load Balancers                        │
│  Kong / AWS ALB / NGINX Ingress                                             │
│  Rate limiting, authn/authz, request routing, API versioning                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Stateless FastAPI Application Tier                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │ Intake API  │  │ Assessment  │  │ Candidate   │  │ Admin/Superadmin │   │
│  │             │  │ Orchestrator│  │ Matching    │  │ Portal API       │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └──────────────────┘   │
│  Horizontal pod autoscaling (HPA) by CPU, memory, request latency            │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Asynchronous Worker Tier                              │
│  Celery + Redis/RabbitMQ                                                      │
│  Resume parsing, LLM calls, audio/video scoring, report generation           │
│  SQS/SNS/RabbitMQ for cross-region fan-out                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Data & State Layer                                 │
│  PostgreSQL (primary) ──► Read replicas ──► pgvector                          │
│  Redis: sessions, rate limits, cache, job queues, real-time leaderboards     │
│  Object Storage: S3 / GCS / MinIO (resumes, audio, video, reports)           │
│  Elasticsearch/OpenSearch: audit search, log aggregation                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
┌─────────────────────────────────────────────────────────────────────────────┐
│                         External Adapters                                    │
│  LLM providers (OpenAI/Claude/Gemini), Resume parsers, STT, Video storage,   │
│  Calendar, WhatsApp, Email, Payment, ATS, Apify, KMS/Vault                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2. Component Structure

```
bookmyinterview-main/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/                    # Versioned REST API
│   │   │       ├── intake.py
│   │   │       ├── assessment.py
│   │   │       ├── candidate.py
│   │   │       └── admin.py
│   │   ├── core/
│   │   │   ├── config.py              # Pydantic settings, env-driven
│   │   │   ├── security.py            # JWT, RBAC, password hashing
│   │   │   ├── middleware.py          # Tenant, request-id, logging
│   │   │   ├── cache.py               # Redis cache abstraction
│   │   │   ├── events.py              # Domain event bus
│   │   │   ├── logging.py             # Structured JSON logs
│   │   │   └── unit_of_work.py        # Transaction boundaries
│   │   ├── db/
│   │   │   ├── session.py             # Async SQLAlchemy sessions
│   │   │   └── models.py              # SQLAlchemy 2.0 ORM models
│   │   ├── repositories/              # Data access abstraction
│   │   │   ├── base.py
│   │   │   ├── tenant.py
│   │   │   ├── job.py
│   │   │   ├── candidate.py
│   │   │   └── assessment.py
│   │   ├── services/                  # Domain orchestration
│   │   │   ├── intake_service.py
│   │   │   ├── assessment_service.py
│   │   │   └── candidate_service.py
│   │   ├── tasks/                     # Celery background jobs
│   │   │   ├── resume_tasks.py
│   │   │   ├── scoring_tasks.py
│   │   │   └── report_tasks.py
│   │   └── main.py                    # App factory, lifespan hooks
│   ├── alembic/                       # Database migrations
│   ├── tests/
│   └── Dockerfile
├── frontend/                          # React SPA (static/CDN)
├── deploy/
│   ├── docker-compose.prod.yml
│   ├── k8s/                           # Kubernetes manifests
│   └── terraform/                     # IaC modules
└── docs/
```

## 3. Data Flow

### 3.1 Client Intake → Assessment Path

1. Client submits job requirements (`POST /api/v1/intake/analyze`).
2. API Gateway validates JWT + tenant context.
3. Handler persists `JobRequest` via repository + unit of work.
4. `IntakeService` calls `AssessmentPathBuilder` (rule engine + LLM adapter).
5. Result cached in Redis under `job:{job_id}:path` TTL 1h.
6. Async Celery task enriches JD/skills via LLM provider.
7. Audit log written for every AI-generated artifact.
8. Client receives synchronous path; enriched JD pushed via SSE/WebSocket.

### 3.2 Candidate Application → Score

1. Candidate uploads resume (`POST /api/v1/candidates/{id}/resume`).
2. Resume stored in object storage; metadata saved to DB.
3. Celery task `parse_resume` calls adapter; writes parsed profile.
4. Candidate starts assessment; answers recorded in `audio_responses`/`video_responses`.
5. Celery task `score_response` computes score via LLM/rubric.
6. `AssessmentService` aggregates weighted scores.
7. Final recommendation cached and returned.
8. Audit log captures score changes for explainability.

### 3.3 Interview Booking

1. Client selects candidate + slot (`POST /api/v1/interviews/book`).
2. Database transaction locks slot (advisory lock / `SELECT FOR UPDATE`).
3. Calendar adapter creates event; meeting link returned.
4. Notification tasks (email/WhatsApp) queued.
5. Booking confirmed atomically.

## 4. Scalability Patterns

| Concern               | Pattern                                      |
|-----------------------|----------------------------------------------|
| Compute               | Stateless containers, HPA, spot/preemptible  |
| Database              | Read replicas, connection pooling (PgBouncer), sharding by tenant |
| Caching               | Redis multi-layer (object, query, session)   |
| Async work            | Celery with priority queues, acks-late       |
| Object storage        | S3/GCS with CloudFront/ signed URLs          |
| Search                | OpenSearch for audit/logs, pgvector for semantic |
| Multi-region          | Primary-active DB per region, event replication |
| Rate limiting         | Redis sliding window per tenant/user         |

## 5. Security & Compliance

- Row-level security (RLS) per `tenant_id` on every table.
- JWT access tokens + refresh tokens; short expiry.
- PII encrypted at rest (AES-256-GCM via KMS/Vault adapter).
- Audit log immutable append-only stream.
- Bias guardrails: protected attributes never scored.
- GDPR/CCPA: consent tracking, data retention TTL, export/delete APIs.
