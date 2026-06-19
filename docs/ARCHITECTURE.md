# Architecture

## Frontend
React + Vite premium SPA with pages for landing, client portal, smart intake, assessment engine, candidate portal, and admin console.

## Backend
FastAPI service modules:
- `assessment.py`: dynamic assessment orchestration
- `trait_engine.py`: auto trait question generation + validation
- `scoring.py`: candidate scoring + audio/video transcript scoring
- `jd_engine.py`: JD generation and gap detection

## Production Architecture
- PostgreSQL: tenants, jobs, candidates, assessments, scores, audit logs
- Redis: queues/session caching
- S3/GCS: resumes, audio, video, reports
- Vector DB: JD/candidate semantic matching
- LLM providers: OpenAI/Claude/Gemini through provider adapter
- MCP layer: Figma, Cursor, ATS, calendar, communication, assessment vendors

## Security
- Multi-tenant isolation by company_id
- RBAC: admin, client admin, hiring manager, candidate, evaluator
- Consent tracking for candidates
- Audit logs for AI outputs and score changes
- Bias guardrails and protected attribute exclusion
