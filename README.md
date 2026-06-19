# BOOK MY INTERVIEW

A premium global AI Hiring Operating System that converts a client hiring request into a validated, assessed, explainable, interview-ready candidate pipeline.

This repository implements the enterprise foundation from the BOOK MY INTERVIEW blueprint:

- Client intake and intelligent JD generation
- Dynamic assessment orchestration
- Resume/profile scoring
- Auto-generated and validated trait assessment questions
- Audio assessment levels 3 and 5
- Video interview workflow
- Candidate scoring and explainable recommendations
- Client, candidate, admin, and superadmin dashboards
- Superadmin Integration Vault for provider credentials
- Enterprise custom MCPs for JD, assessment, matching, traits, and compliance
- Multi-tenant database models
- RBAC/JWT access-control foundation
- Audit log service
- LLM and vector-search adapter layers
- MCP-ready integration architecture for Figma, Cursor, Apify, ATS, calendar, communication, payment, and assessment vendors

## Project Structure

```txt
frontend/  Modern React + Vite product UI
backend/   FastAPI backend with enterprise services, MCPs, DB models, RBAC, and adapters
docs/      Architecture, design system, global roadmap, compliance, API contracts
mcp/       MCP server specifications and integration manifests
```

## Run Locally

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Docker

```bash
docker compose up --build
```

## Core Demo Pages

- `/` Landing and product narrative
- `/client` Client hiring command center
- `/intake` Smart job intake flow
- `/assessment` Assessment orchestration engine
- `/candidate` Candidate assessment and interview booking
- `/admin` Admin control tower
- `/superadmin` Integration Vault

## Core API Areas

- `/api/intake/analyze`
- `/api/assessment/path`
- `/api/traits/generate`
- `/api/candidate/score`
- `/api/superadmin/integrations`
- `/api/access/demo-session`
- `/api/mcp/registry`
- `/api/mcp/jd-intelligence/analyze`
- `/api/mcp/assessment-intelligence/orchestrate`
- `/api/mcp/candidate-matching/match`
- `/api/mcp/trait-question/generate-validate`
- `/api/mcp/compliance/check`

## Design Principle

This is not a normal HR website. It is designed as a premium enterprise SaaS product: dark-luxury interface, glass panels, strong data density, explainable AI decisions, and high trust cues.

## Global Vision

BOOK MY INTERVIEW is being built as a global hiring intelligence layer, not an India-only hiring product. The long-term product must support multi-region compliance, multi-currency billing, multi-language assessments, data residency, enterprise SSO, and audit-ready hiring decisions.

## Production Notes

External services are abstracted behind adapters. Add keys for OpenAI/Claude/Gemini, resume parser, voice transcription, video storage, calendar, WhatsApp, email, payment, ATS, Apify, vector database, and KMS/Vault through the Superadmin Integration Vault.
