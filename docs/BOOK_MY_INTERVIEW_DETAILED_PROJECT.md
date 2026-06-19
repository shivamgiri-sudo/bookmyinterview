# BOOK MY INTERVIEW - Detailed Project Documentation

## 1. Product Overview

BOOK MY INTERVIEW is an AI-powered hiring operating system designed to help companies create hiring requirements, generate assessment paths, manage talent records, monitor operations, and move candidates toward interview-ready status through a secure, tenant-scoped SaaS workflow.

The current platform has evolved from a static prototype into a working MVP with backend APIs, a premium React frontend, authentication, role-based access, tenant-scoped secure workspace APIs, account lifecycle flows, operational monitoring, CI configuration, deployment examples, and database lifecycle models.

## 2. Core Product Goal

The goal is to build a world-class hiring platform that can:

- Let clients create hiring requirements.
- Generate assessment paths for roles.
- Store tenant-specific jobs, candidates, and assessment records.
- Provide role-gated frontend workspaces.
- Support client admins, platform admins, auditors, hiring managers, and candidates.
- Monitor operational audit activity and lifecycle activity.
- Prepare for production deployment with secure route policies, CORS controls, CI, and database-backed lifecycle models.

## 3. Current Repository

Repository:

```text
shivamgiri-sudo/bookmyinterview
```

Primary branch:

```text
main
```

## 4. High-Level Architecture

The project is structured as a full-stack SaaS product.

```text
BOOK MY INTERVIEW
├── backend/                 FastAPI backend
├── frontend/                React + Vite frontend
├── deploy/                  Deployment environment examples
├── docs/                    Product, architecture, and implementation docs
├── backend/tests/           Backend contract and route tests
├── frontend/tests/          Frontend Playwright smoke tests
└── .github/workflows/       CI workflow definitions
```

## 5. Backend Stack

The backend is built on:

- FastAPI
- SQLAlchemy ORM
- Pydantic models
- JWT authentication
- Passlib password hashing
- SQLite for local MVP default
- PostgreSQL-ready configuration for production
- Alembic-style migration script for lifecycle tables

## 6. Frontend Stack

The frontend is built on:

- React
- Vite
- Lucide React icons
- Custom premium UI components and page layout
- Client-side session storage
- Role-gated routing through `RouterNext.jsx`
- Playwright smoke tests

## 7. Active Frontend Boot Flow

The active frontend boot path is:

```text
frontend/index.html
  -> frontend/src/bootNext.jsx
  -> frontend/src/RouterNext.jsx
```

The product currently routes through `RouterNext.jsx`, not the older router files.

## 8. Main Frontend Routes

The current active route map includes:

| Route | Page | Purpose |
|---|---|---|
| `/` | LandingPage | Marketing/product landing page |
| `/login` | AuthPage | Login/register with role selection |
| `/account` | AccountOps | Account lifecycle operations |
| `/monitor` | OpsMonitor | Protected operational metrics and audit monitor |
| `/secure` | SecureWorkspace | Secure workspace read page |
| `/workspace` | WorkspaceSecureSuite | Secure job/talent creation and scoped data view |
| `/client` | ClientPortalLive | Client command center using secure workspace APIs |
| `/intake` | IntakeLive | Secure job intake and assessment path generation |
| `/engine` | EnginePage | Assessment path visibility |
| `/talent` | TalentPage | Secure talent creation |
| `/insights` | InsightsCenter | Role insight summaries |
| `/templates` | TemplateStudio | Message template previews |
| `/master` | MasterStudio | Master setup console |
| `/report` | ReportStudio | Client-ready report preview |
| `/flow` | FlowStudio | Candidate assessment flow preview |
| `/status` | StatusBoard | Platform status board |
| `/hub` | LiveHub | Secure summary hub |
| `/vault` | VaultOps | Provider/cost configuration view |
| `/controls` | ControlRoom | Regional controls view |
| `/plans` | PlansPage | Plans and billing setup |
| `/cost` | CostControlCenter | Provider cost center |

## 9. Role-Based Access Model

The application supports the following roles:

- `superadmin`
- `platform_admin`
- `client_admin`
- `hiring_manager`
- `candidate`
- `auditor`

Backend permissions are defined in `backend/app/core/security.py`.

Current permission model:

```text
superadmin      -> wildcard access
platform_admin  -> tenant/job/candidate/assessment/integration capabilities
client_admin    -> job/candidate/assessment/interview capabilities
hiring_manager  -> read-oriented job/candidate/assessment/interview capabilities
candidate       -> candidate self, assessment self, interview self
auditor         -> audit read and compliance read
```

The frontend route gate mirrors this model so pages are hidden or blocked based on the active user role.

## 10. Authentication and Session Lifecycle

The backend supports:

- User registration
- User login
- JWT access token generation
- Refresh token lifecycle
- Logout and token revocation
- Current-user lookup
- Permission checking
- Public role permission listing

Main auth routes:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/permission
GET  /api/auth/roles
```

Frontend auth helper:

```text
frontend/src/authClient.js
```

The frontend stores the active session under local storage key:

```text
bmi_session
```

## 11. Account Lifecycle

The platform includes MVP account lifecycle contracts.

Backend route group:

```text
/api/account
```

Routes:

```text
POST /api/account/recovery/start
POST /api/account/recovery/complete
POST /api/account/verify/start
POST /api/account/verify/complete
```

Frontend files:

```text
frontend/src/accountClient.js
frontend/src/AccountOps.jsx
```

The account operations page is available at:

```text
/account
```

## 12. Secure Workspace APIs

The secure workspace is now the primary product data path.

Route group:

```text
/api/secure/workspace
```

Supported endpoints:

```text
GET  /api/secure/workspace/overview
GET  /api/secure/workspace/jobs
POST /api/secure/workspace/jobs
GET  /api/secure/workspace/talent
POST /api/secure/workspace/talent
GET  /api/secure/workspace/assessments
```

These endpoints require:

- Bearer token session
- Role capability
- Tenant scoping

The secure workspace APIs are used by:

- WorkspaceSecureSuite
- SecureWorkspace
- ClientPortalLive
- IntakeLive
- TalentPage
- EnginePage
- LiveHub

## 13. Development-Only Legacy Route Policy

Older open/demo route groups are now gated by environment.

Development-style environments are allowed:

```text
local
dev
development
demo
test
testing
```

In production-style environments, legacy open routes are blocked.

Legacy route groups:

```text
/api/workspace
/api/data
```

Production product flows should use:

```text
/api/auth
/api/secure/workspace
/api/ops-metrics
```

## 14. Data Model

Core database models are defined in:

```text
backend/app/db/models.py
```

Main entities:

| Model | Purpose |
|---|---|
| Tenant | Client/company workspace |
| User | Platform, client, auditor, candidate users |
| JobRequest | Hiring requirement/job intake |
| Candidate | Talent/candidate record |
| Assessment | Generated assessment path |
| IntegrationCredential | Provider credential storage |
| AuditLog | Operational and lifecycle audit events |

Lifecycle database models are defined in:

```text
backend/app/db/lifecycle_models.py
```

Lifecycle entities:

| Model | Purpose |
|---|---|
| AccountChallenge | Account lifecycle challenge tracking |
| SessionGrant | Database-backed session/refresh grant tracking |
| SessionBlock | Access-token block/revocation tracking |

## 15. Assessment Path Generation

Job intake generates an assessment path through backend services.

Important flow:

```text
POST /api/secure/workspace/jobs
  -> creates JobRequest
  -> calls assessment path builder
  -> creates Assessment
  -> returns assessment path
```

Frontend pages using this flow:

```text
frontend/src/IntakeLive.jsx
frontend/src/WorkspaceSecureSuite.jsx
```

## 16. Operational Metrics and Monitor

The platform includes a protected operations monitor.

Route group:

```text
/api/ops-metrics
```

Endpoints:

```text
GET /api/ops-metrics/summary
GET /api/ops-metrics/presets
GET /api/ops-metrics/events/{event_id}
GET /api/ops-metrics/export
```

The monitor requires `audit:read` capability.

Allowed roles:

- `superadmin`
- `auditor`

Frontend page:

```text
frontend/src/OpsMonitor.jsx
```

Frontend route:

```text
/monitor
```

## 17. Monitor Features

The monitor currently supports:

- KPI cards
- Audit event count
- Account challenge count
- Session grant count
- Blocked session count
- Tenant filter
- Action filter
- Risk filter
- Day-window filter
- Saved presets
- Alert cards
- Alert rule metadata
- Applied filter display
- Event drilldown rows
- Selected event payload panel
- CSV export action

CSV export endpoint:

```text
GET /api/ops-metrics/export
```

Export file name in browser:

```text
book-my-interview-ops-events.csv
```

## 18. Monitor Presets

Current presets:

| Key | Label | Filters |
|---|---|---|
| `last_7_high` | Last 7 days high risk | days = 7, risk = high |
| `last_30_all` | Last 30 days all events | days = 30 |
| `system_activity` | System activity | days = 30, action = user_login |

## 19. Alert Rules

Current alert rules:

| Key | Level | Metric | Threshold |
|---|---|---|---|
| `high_risk_volume` | high | high_risk_audit_events | 3 |
| `blocked_volume` | medium | blocked_sessions | 3 |

These rules are returned to the frontend so the UI can display why an alert is appearing.

## 20. Message Delivery Adapter

A mock message delivery adapter exists for future provider integration.

File:

```text
backend/app/services/message_delivery.py
```

Purpose:

- Define delivery request contract
- Mask recipient values
- Return mock queued status
- Prepare for future email/SMS/WhatsApp provider wiring

Current provider:

```text
mock
```

## 21. Identity Readiness

A readiness service exists for future identity provider setup.

File:

```text
backend/app/services/identity_readiness.py
```

Purpose:

- Track identity provider setup readiness
- Prepare for future Keycloak/Auth0/Okta style integration
- Track issuer, client, callback, and role mapping readiness

The service exists but route mounting was not completed yet due connector restrictions during implementation.

## 22. CORS and Production Configuration

CORS is configurable through settings.

Config field:

```text
cors_allow_origins
```

Production example:

```text
deploy/env.production.example
```

Example values:

```text
APP_ENV=production
JWT_SECRET_KEY=replace-with-strong-random-secret
DATABASE_URL=postgresql+psycopg://...
CORS_ALLOW_ORIGINS=https://app.bookmyinterview.example,https://admin.bookmyinterview.example
```

## 23. Environment Variables

Important environment variables:

| Variable | Purpose |
|---|---|
| APP_ENV | Controls production/development route policy |
| DATABASE_URL | Backend database connection |
| JWT_SECRET_KEY | JWT signing secret |
| CORS_ALLOW_ORIGINS | Comma-separated allowed frontend origins |
| ENCRYPTION_KEY | Secret encryption seed/key placeholder |
| VITE_API_BASE_URL | Frontend API base URL |
| POSTGRES_PASSWORD | Database password for deployment |
| LLM_PROVIDER | LLM provider selection |
| VECTOR_PROVIDER | Vector provider selection |
| MONTHLY_PLATFORM_BUDGET_USD | Cost control setting |

## 24. CI/CD

CI workflow file:

```text
.github/workflows/product-hardening.yml
```

CI currently includes:

- Backend dependency installation
- Backend pytest execution
- Frontend dependency installation
- Frontend production build

CI triggers:

```text
push to main
pull request to main
```

## 25. Backend Tests

Backend tests include coverage for:

- App factory route mounting
- Auth registration/login/refresh contract
- Secure workspace contract
- Route policy local vs production behavior
- Account lifecycle contract
- DB session lifecycle contract
- Delivery adapter contract
- CORS configuration
- Operations metrics filters, presets, rules, and export

Test directory:

```text
backend/tests
```

Run command:

```bash
cd backend
pytest -q
```

## 26. Frontend Tests

Frontend smoke tests are in:

```text
frontend/tests/navigation.spec.js
```

They verify that major routes render expected headings.

Run command:

```bash
cd frontend
npm run test
```

If Playwright is configured separately, use the project test command defined in `package.json`.

## 27. Local Development Setup

Backend local setup:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend local setup:

```bash
cd frontend
npm install
npm run dev
```

Default frontend URL:

```text
http://localhost:5173
```

Default backend URL:

```text
http://localhost:8000
```

## 28. Current Production Readiness Status

Completed:

- Full-stack app shell
- Premium frontend route system
- Login/register
- Role-gated frontend routing
- Secure tenant-scoped workspace API
- Secure job creation
- Secure talent creation
- Assessment path generation
- Development-only legacy route policy
- Account lifecycle contracts
- DB lifecycle models
- DB session lifecycle route group
- Operational metrics monitor
- Monitor filters
- Monitor presets
- Monitor alerts
- Event detail retrieval
- CSV export
- CORS config
- Production env example
- CI workflow

Still MVP/needs production replacement:

- Some account lifecycle routes still use in-memory challenge helper.
- DB lifecycle models exist, but full migration into all account routes is not complete.
- Message delivery uses mock provider.
- Identity provider callback flow is not mounted yet.
- Secrets need managed secret storage.
- Real production DB migrations should be wired through Alembic execution in deployment.
- Workflow status has not yet been confirmed from GitHub run output.

## 29. Recommended Next Build Items

Priority 1 - production security:

1. Move all account lifecycle flows fully to DB-backed challenge service.
2. Replace in-memory refresh token store with DB or Redis-backed store everywhere.
3. Add email provider adapter for account lifecycle messages.
4. Add login attempt throttling.
5. Add password policy checks.
6. Add secure cookie/session option for browser deployments.

Priority 2 - identity and enterprise:

1. Mount identity provider readiness route.
2. Add OIDC callback route.
3. Add role mapping configuration.
4. Add organization-level identity settings.
5. Add SSO login button in frontend.

Priority 3 - operations:

1. Add saved custom monitor presets per user.
2. Add audit export history.
3. Add alert notification routing.
4. Add tenant-level operations dashboard.
5. Add event detail route in navigation.

Priority 4 - hiring product depth:

1. Add candidate assessment invite flow.
2. Add interview slot scheduling engine.
3. Add candidate portal with self-service assessment flow.
4. Add client approval workflow for shortlisted candidates.
5. Add role scorecards and evaluation rubrics.
6. Add reporting pack export for clients.

Priority 5 - integrations:

1. Add calendar connector.
2. Add email provider connector.
3. Add ATS connector.
4. Add payment/billing connector.
5. Add LLM provider adapter.
6. Add vector search provider adapter.

## 30. Suggested Development Rules

- New product flows should use `/api/secure/workspace` instead of legacy `/api/workspace` or `/api/data`.
- New admin/ops pages should check role capability before exposing data.
- Legacy routes should remain development-only.
- Every new backend route should have a contract test.
- Every new frontend page should have smoke route coverage.
- Secrets must never be committed.
- Production values must come from environment variables or managed secret stores.
- Long-lived lifecycle state should be stored in database or Redis, not memory.

## 31. Developer Handoff Summary

BOOK MY INTERVIEW is now a working full-stack MVP with a secure SaaS direction. The most important active surfaces are:

```text
Frontend:
- /login
- /workspace
- /client
- /intake
- /talent
- /engine
- /monitor

Backend:
- /api/auth
- /api/secure/workspace
- /api/account
- /api/session-db
- /api/ops-metrics
```

The immediate next production step is to finish replacing remaining memory-backed account/session flows with DB-backed or Redis-backed lifecycle services, then integrate a real message provider and identity provider.

## 32. Glossary

| Term | Meaning |
|---|---|
| Tenant | A client/company workspace |
| JobRequest | A hiring requirement/intake record |
| Candidate | A talent profile |
| Assessment | Generated assessment path for a job |
| Secure Workspace | Authenticated tenant-scoped product data API |
| AuditLog | Operational event record |
| SessionGrant | DB-backed refresh/session grant model |
| SessionBlock | DB-backed blocked access-token model |
| AccountChallenge | DB-backed lifecycle challenge model |
| Monitor | Protected operational metrics page |
| Preset | Saved monitor filter definition |
| Alert Rule | Threshold rule for operational attention |

---

Last updated: 2026-06-18
