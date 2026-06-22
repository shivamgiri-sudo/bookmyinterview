# BOOK MY INTERVIEW - What We Have Built So Far

This document explains the current BOOK MY INTERVIEW build in detail and includes Mermaid flowcharts for the product, backend, frontend, secure data flow, account lifecycle, monitoring, export, CI, and deployment direction.

## 1. Executive Summary

BOOK MY INTERVIEW has been built into a working full-stack AI hiring operating system MVP. It now includes a FastAPI backend, React/Vite frontend, role-based authentication, secure tenant-scoped workspace APIs, job and talent creation flows, assessment path generation, account lifecycle contracts, database lifecycle models, protected operations monitoring, alert rules, filtered exports, production CORS configuration, CI workflow, and detailed documentation.

The project is no longer only a static prototype. It now has real backend contracts, frontend pages wired to APIs, role gates, tests, and production-readiness scaffolding.

## 2. What We Have Built

### 2.1 Product Foundation

Built components:

- Full-stack project structure.
- FastAPI backend.
- React/Vite frontend.
- Premium UI routing through `RouterNext.jsx`.
- Product pages for workspace, client portal, intake, engine, talent, insights, templates, reports, status, controls, cost, and monitor.
- Local development setup support.
- Production environment example.
- GitHub Actions hardening workflow.

### 2.2 Authentication and Access

Built components:

- User registration.
- User login.
- JWT access token creation.
- Refresh token lifecycle.
- Logout flow.
- Current-user endpoint.
- Role permission map.
- Route-level frontend protection.
- Backend capability checks for secure APIs.

Roles supported:

- `superadmin`
- `platform_admin`
- `client_admin`
- `hiring_manager`
- `candidate`
- `auditor`

### 2.3 Secure Workspace

Built components:

- Tenant-scoped secure workspace APIs.
- Secure job creation.
- Secure talent creation.
- Secure job list.
- Secure talent list.
- Secure assessment list.
- Secure overview endpoint.
- Frontend secure workspace suite.
- Client portal reads secure scoped data.
- Intake page creates secure jobs.
- Talent page creates secure talent.
- Engine page reads generated assessment paths.

### 2.4 Account Lifecycle

Built components:

- Account operations frontend page.
- Account lifecycle client.
- Recovery start and complete route contracts.
- Verification start and complete route contracts.
- Account challenge helper.
- Database lifecycle models for future full migration.

### 2.5 Database Lifecycle

Built components:

- `AccountChallenge` model.
- `SessionGrant` model.
- `SessionBlock` model.
- DB lifecycle service.
- DB session exchange route.
- DB session close route.
- Alembic-style lifecycle migration script.

### 2.6 Operational Monitor

Built components:

- Protected operations metrics API.
- Audit capability protection.
- Operations monitor page.
- KPI cards.
- Tenant/action/risk/day filters.
- Saved presets.
- Alert rules.
- Alert cards.
- Event drilldown rows.
- Event detail endpoint.
- Selected event payload preview.
- Filtered CSV export endpoint.
- Browser CSV export button.

### 2.7 Production Hardening

Built components:

- CORS configurable through environment.
- Production env example.
- Development-only legacy route protection.
- CI workflow for backend tests and frontend build.
- Test coverage for core contracts.
- Detailed documentation files under `docs/`.

## 3. Current System Architecture

```mermaid
flowchart TB
    User[User / Admin / Auditor / Client] --> FE[React + Vite Frontend]
    FE --> Router[RouterNext.jsx]
    Router --> Pages[Product Pages]
    Pages --> API[FastAPI Backend]

    API --> Auth[Auth Routes]
    API --> SecureWorkspace[Secure Workspace Routes]
    API --> Account[Account Lifecycle Routes]
    API --> Monitor[Ops Metrics Routes]
    API --> Legacy[Legacy Dev-Only Routes]

    Auth --> Security[JWT + RBAC + Capabilities]
    SecureWorkspace --> Scope[Tenant Scope Enforcement]
    Monitor --> AuditCapability[audit:read Capability]

    API --> DB[(Database)]
    DB --> Tenant[Tenant]
    DB --> UserModel[User]
    DB --> Job[JobRequest]
    DB --> Candidate[Candidate]
    DB --> Assessment[Assessment]
    DB --> AuditLog[AuditLog]
    DB --> Lifecycle[Lifecycle Tables]

    Lifecycle --> AccountChallenge[AccountChallenge]
    Lifecycle --> SessionGrant[SessionGrant]
    Lifecycle --> SessionBlock[SessionBlock]
```

## 4. Frontend Flow

```mermaid
flowchart LR
    Browser[Browser] --> Index[index.html]
    Index --> Boot[bootNext.jsx]
    Boot --> Router[RouterNext.jsx]

    Router --> Public[Public Routes]
    Router --> Protected[Protected Routes]

    Public --> Home[/]
    Public --> Login[/login]
    Public --> Account[/account]

    Protected --> Workspace[/workspace]
    Protected --> Client[/client]
    Protected --> Intake[/intake]
    Protected --> Talent[/talent]
    Protected --> Engine[/engine]
    Protected --> Monitor[/monitor]

    Router --> RoleGate{Role Allowed?}
    RoleGate -->|Yes| Render[Render Page]
    RoleGate -->|No| Denied[Access Denied]
```

## 5. Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend AuthPage
    participant API as FastAPI Auth API
    participant DB as Database

    U->>FE: Enter email/password/role
    FE->>API: POST /api/auth/register or /api/auth/login
    API->>DB: Read or create user
    API->>API: Hash/verify password
    API->>API: Create JWT access token
    API->>API: Issue refresh token
    API-->>FE: User + access_token + refresh_token
    FE->>FE: Save session in localStorage
    FE->>U: Route to allowed workspace
```

## 6. Role Gate Flow

```mermaid
flowchart TD
    PageRequest[User opens route] --> LoadSession[Load bmi_session]
    LoadSession --> HasSession{Session exists?}
    HasSession -->|No| IsPublic{Public route?}
    IsPublic -->|Yes| RenderPublic[Render public page]
    IsPublic -->|No| LoginPage[Show login]

    HasSession -->|Yes| ReadRole[Read user role]
    ReadRole --> CheckRoute{Route allowed for role?}
    CheckRoute -->|Yes| RenderProtected[Render protected page]
    CheckRoute -->|No| AccessDenied[Show access denied]
```

## 7. Secure Workspace Flow

```mermaid
sequenceDiagram
    participant FE as Workspace/Intake/Talent Page
    participant API as Secure Workspace API
    participant Auth as Session Context
    participant DB as Database

    FE->>API: Request with Bearer token
    API->>Auth: Validate token and user
    Auth->>API: SessionContext(role, tenant_id)
    API->>API: Check required capability
    API->>API: Resolve tenant scope
    API->>DB: Create/read scoped data
    DB-->>API: Tenant-specific records
    API-->>FE: Secure response
```

## 8. Job Creation and Assessment Path Flow

```mermaid
flowchart TB
    Intake[Intake / Workspace Form] --> SecureJob[POST /api/secure/workspace/jobs]
    SecureJob --> Capability{job:create allowed?}
    Capability -->|No| Deny[Reject]
    Capability -->|Yes| TenantScope[Resolve tenant]
    TenantScope --> CreateJob[Create JobRequest]
    CreateJob --> PathBuilder[Build Assessment Path]
    PathBuilder --> CreateAssessment[Create Assessment]
    CreateAssessment --> Response[Return job_id + assessment_id + assessment_path]
    Response --> UI[Frontend updates workspace]
```

## 9. Talent Creation Flow

```mermaid
flowchart TB
    TalentPage[Talent Page / Workspace Form] --> SecureTalent[POST /api/secure/workspace/talent]
    SecureTalent --> Capability{candidate:create allowed?}
    Capability -->|No| Reject[Reject]
    Capability -->|Yes| TenantScope[Resolve tenant]
    TenantScope --> CandidateRecord[Create Candidate]
    CandidateRecord --> Consent[Store consent status]
    Consent --> Response[Return candidate record]
```

## 10. Account Lifecycle Flow

```mermaid
flowchart LR
    AccountOps[/account Page] --> AccountClient[accountClient.js]
    AccountClient --> StartRecovery[POST /api/account/recovery/start]
    AccountClient --> CompleteRecovery[POST /api/account/recovery/complete]
    AccountClient --> StartVerify[POST /api/account/verify/start]
    AccountClient --> CompleteVerify[POST /api/account/verify/complete]

    StartRecovery --> Challenge[Create challenge]
    CompleteRecovery --> UpdateCredential[Update account credential]
    StartVerify --> VerifyChallenge[Create verification challenge]
    CompleteVerify --> Verified[Return verified status]
```

## 11. Database Lifecycle Flow

```mermaid
flowchart TD
    SessionGrant[SessionGrant Table] --> Exchange[POST /api/session-db/exchange]
    Exchange --> ValidateGrant{Grant valid?}
    ValidateGrant -->|No| Reject[Reject]
    ValidateGrant -->|Yes| IssueAccess[Issue access token]

    IssueAccess --> Close[POST /api/session-db/close]
    Close --> Block[Create SessionBlock]
    Close --> Revoke[Mark SessionGrant revoked]
```

## 12. Operations Monitor Flow

```mermaid
sequenceDiagram
    participant UI as OpsMonitor.jsx
    participant API as /api/ops-metrics
    participant Auth as Capability Check
    participant DB as Database

    UI->>API: GET /summary with filters + Bearer token
    API->>Auth: require audit:read
    Auth-->>API: allowed
    API->>DB: Query AuditLog and lifecycle tables
    DB-->>API: Counts + latest events
    API->>API: Apply alert rules
    API-->>UI: KPIs + alerts + presets + event rows
    UI->>UI: Render cards, filters, alerts, drilldown
```

## 13. Monitor Export Flow

```mermaid
sequenceDiagram
    participant UI as OpsMonitor Export Button
    participant API as /api/ops-metrics/export
    participant DB as AuditLog
    participant Browser as Browser Download

    UI->>API: GET /export?tenant_id=&action=&risk=&days=
    API->>API: Check audit:read capability
    API->>DB: Query filtered audit rows
    DB-->>API: Up to 1000 rows
    API-->>UI: CSV text
    UI->>Browser: Create CSV Blob
    Browser-->>User: Download book-my-interview-ops-events.csv
```

## 14. Monitor Event Detail Flow

```mermaid
sequenceDiagram
    participant UI as OpsMonitor Event Row
    participant API as /api/ops-metrics/events/{id}
    participant DB as AuditLog

    UI->>API: GET event detail
    API->>API: Check audit:read capability
    API->>DB: Fetch AuditLog by id
    DB-->>API: Full event
    API-->>UI: Event payload and metadata
    UI->>UI: Render selected event panel
```

## 15. Production Route Policy Flow

```mermaid
flowchart TD
    Request[Incoming API Request] --> RouteGroup{Route Group}
    RouteGroup --> Legacy[/api/workspace or /api/data]
    RouteGroup --> Product[/api/auth, /api/secure/workspace, /api/ops-metrics]

    Legacy --> EnvCheck{APP_ENV dev-like?}
    EnvCheck -->|Yes| AllowLegacy[Allow legacy demo route]
    EnvCheck -->|No| BlockLegacy[Block in production]

    Product --> NormalAuth[Use normal auth/capability checks]
```

## 16. Deployment and CI Flow

```mermaid
flowchart LR
    Dev[Developer Push] --> GitHub[GitHub Repository]
    GitHub --> Actions[GitHub Actions]
    Actions --> BackendTests[Backend pytest]
    Actions --> FrontendBuild[Frontend npm build]

    BackendTests --> Status[Workflow Status]
    FrontendBuild --> Status

    Env[deploy/env.production.example] --> Runtime[Production Runtime]
    Runtime --> Backend[FastAPI]
    Runtime --> Frontend[React Static App]
    Runtime --> DB[(PostgreSQL)]
```

## 17. Built Backend Route Groups

| Route Group | Status | Purpose |
|---|---|---|
| `/api/auth` | Built | Register, login, refresh, logout, current user, permissions |
| `/api/secure/workspace` | Built | Tenant-scoped job, talent, assessment, overview APIs |
| `/api/account` | Built | Account recovery and verification contracts |
| `/api/session-db` | Built | DB-backed session grant exchange and close |
| `/api/ops-metrics` | Built | Protected monitor summary, presets, detail, export |
| `/api/workspace` | Dev-only | Legacy workspace/demo APIs |
| `/api/data` | Dev-only | Legacy data/demo APIs |

## 18. Built Frontend Pages

| Route | Built Page | Purpose |
|---|---|---|
| `/login` | AuthPage | Login and registration |
| `/account` | AccountOps | Account lifecycle operations |
| `/workspace` | WorkspaceSecureSuite | Secure job/talent creation and scoped data |
| `/secure` | SecureWorkspace | Secure workspace read view |
| `/client` | ClientPortalLive | Client command center |
| `/intake` | IntakeLive | Secure job intake |
| `/talent` | TalentPage | Secure candidate creation |
| `/engine` | EnginePage | Assessment path view |
| `/monitor` | OpsMonitor | Protected operations dashboard |
| `/report` | ReportStudio | Client report preview |
| `/status` | StatusBoard | Status board |
| `/controls` | ControlRoom | Regional controls |
| `/cost` | CostControlCenter | Cost governance |

## 19. Built Test Coverage

Backend tests cover:

- Auth contract.
- Secure workspace contract.
- Route mounting.
- Route policy.
- Account lifecycle contract.
- DB session lifecycle contract.
- CORS configuration.
- Delivery adapter contract.
- Operations metrics filters, presets, rules, and export.

Frontend tests cover:

- Major route render smoke checks.
- Route headings for active pages.

## 20. What Is Production-Ready vs MVP

### Strong foundation already built

- Secure route direction.
- Role-based frontend access.
- Capability-protected backend APIs.
- Tenant-scoped secure workspace.
- Operational monitoring.
- CSV export.
- CI workflow definition.
- Production environment example.
- Database lifecycle model definitions.

### Still MVP / next production work

- Some lifecycle challenge routes still use earlier helper patterns.
- Full identity provider callback is not mounted yet.
- Email/message delivery is mock-only.
- Refresh/session lifecycle should be fully consolidated around DB or Redis.
- Production secret storage must be externalized to a real secret manager.
- CI workflow status should be verified once GitHub Actions runs are visible.
- Alembic migration should be wired into actual deployment migration commands.

## 21. Next Recommended Build Plan

```mermaid
flowchart TD
    Start[Current MVP] --> Lifecycle[Move all lifecycle flows to DB or Redis]
    Lifecycle --> Mail[Add real email/message provider]
    Mail --> SSO[Add identity provider callback]
    SSO --> Audit[Add audit drilldown and export history]
    Audit --> Candidate[Add candidate assessment invite flow]
    Candidate --> Scheduling[Add interview scheduling engine]
    Scheduling --> Reports[Add client report export pack]
    Reports --> Production[Production hardening and launch]
```

## 22. Developer Handoff Checklist

Before next major release:

- Run backend tests with `pytest -q`.
- Run frontend build with `npm run build`.
- Confirm GitHub Actions status.
- Validate production env values.
- Replace mock message provider.
- Decide Redis vs database for session lifecycle.
- Complete account lifecycle DB migration.
- Add identity provider callback route.
- Add real tenant-level admin settings.

## 23. Final Summary

We have built a strong enterprise-ready foundation for BOOK MY INTERVIEW:

- A full-stack hiring SaaS MVP.
- Secure role-based authentication.
- Tenant-scoped workspace APIs.
- Job and talent creation workflows.
- Assessment path generation.
- Account lifecycle contracts.
- Database lifecycle models.
- Protected operations monitor.
- Filters, presets, alerts, drilldown, and export.
- CI and production configuration scaffolding.
- Detailed documentation and system flow maps.

The project is now ready for the next stage: replacing remaining MVP-only lifecycle pieces with production-grade DB/Redis-backed services, adding real message delivery, integrating identity provider login, and expanding the hiring workflow into candidate invites and interview scheduling.
