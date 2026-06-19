# End-to-End Journey Flow — BOOK MY INTERVIEW

> Complete stage-wise activity map covering all personas, system actions, data flows, decision gates, integrations, and audit points.

---

## Personas

| Persona | Goal | Primary Touchpoints |
|---------|------|---------------------|
| **Client / Hiring Manager** | Post job, review candidates, conduct final interview, review AI scorecard, make hire/reject decision | Client portal, intake form, dashboard, candidate reports, final interview panel |
| **Candidate** | Apply, complete assessments, book interview, receive outcome | Candidate portal, resume upload, audio/video recorder, calendar |
| **Evaluator / Interviewer** *(optional)* | Support panel interviews or submit supplementary feedback | Interview panel, scorecard |
| **Tenant Admin** | Manage users, jobs, integrations, billing | Admin console, user management, settings |
| **Superadmin** | Configure global providers, compliance, Integration Vault | Superadmin portal, MCP registry, audit logs |
| **System / AI** | Orchestrate assessments, score responses, generate explainable recommendations | Backend services, LLM adapters, workers, vector DB |

---

## Stage 0 — Tenant Onboarding & Configuration

### Goal
A new company (tenant) is provisioned and configured to use the platform.

### Activities

| Step | Actor | Activity | System Action | Output |
|------|-------|----------|---------------|--------|
| 0.1 | Superadmin | Creates tenant from superadmin panel | Inserts `tenants` row with slug, region, plan | Tenant record |
| 0.2 | Superadmin | Configures Integration Vault credentials (LLM, resume parser, STT, storage, calendar, WhatsApp, email, payment, ATS, KMS) | Encrypts secrets via KMS adapter; stores in `integration_credentials` | Provider credentials ready |
| 0.3 | System | Validates integrations by calling provider health endpoints | `test_connection` per facility | Integration status matrix |
| 0.4 | Tenant Admin | Invites team members and assigns roles | Creates `users` with RBAC roles | User accounts |
| 0.5 | Tenant Admin | Sets hiring policies, score thresholds, data retention rules | Writes to `tenant.settings_json` | Tenant configuration |

### Decision Gate
- If integration test fails → block paid provider usage, fall back to mock/sandbox mode.
- If data residency region differs → route storage and DB to correct region.

### Audit
- `audit_logs`: `tenant.created`, `integration.saved`, `user.invited`.

---

## Stage 1 — Client Intake & Job Requisition

### Goal
Capture hiring need and convert loose requirements into a structured job request.

### Activities

| Step | Actor | Activity | System Action | Output |
|------|-------|----------|---------------|--------|
| 1.1 | Client | Logs in to client portal, clicks "New Hiring Request" | Authenticates JWT, resolves `tenant_id` | Session started |
| 1.2 | Client | Fills intake form: designation, department, seniority, location, budget, must-have skills, traits, deal breakers | Validates `JobIntakeCreate` schema | Validated payload |
| 1.3 | System | Persists raw intake | `POST /api/v1/intake/analyze` → creates `job_requests` row with `status=draft` | Job request record |
| 1.4 | System | Runs rule engine + LLM to build assessment path | `build_assessment_path(payload)` analyzes role dependencies | Recommended assessment path |
| 1.5 | System | Generates structured JD | `generate_jd()` produces JD text/json | Generated JD |
| 1.6 | System | Generates trait questions aligned to role family & seniority | `generate_trait_questions()` creates validated questions | Trait question set |
| 1.7 | System | Caches results | Redis: `job:{id}:path`, `job:{id}:jd` | Cached artifacts |
| 1.8 | System | Enriches via async worker | Celery task calls LLM for JD refinement | Enriched JD (async) |
| 1.9 | Client | Provides available interview slots and preferred interview dates | Creates `interview_slots` rows linked to the job | Interview window defined |
| 1.10 | Client | Reviews JD, assessment path, trait questions, and interview window; approves or overrides | Updates `job_requests.status` to `active` or requests changes | Approved job with interview slots |

### Decision Gate
- If client overrides assessment path → create new `job_assessment_paths` version row; invalidate cache.
- If JD missing critical fields → flag `missing_gaps_json` and prompt client.
- If no interview slots provided → prompt client to add slots before activating job.

### Data Flow
```
Client → API Gateway → Intake Handler → UnitOfWork → JobRequest
                          ↓
                    AssessmentService → Rule Engine → LLM Adapter
                          ↓
                    Cache + Event Bus → Celery Worker
```

### Audit
- `audit_logs`: `job_request.created`, `job_request.intake.analyzed`, `job_request.activated`, `job_assessment_path.regenerated`.

---

## Stage 2 — Candidate Discovery & Application

### Goal
Attract and register candidates against an active job.

### Activities

| Step | Actor | Activity | System Action | Output |
|------|-------|----------|---------------|--------|
| 2.1 | System / ATS | Job published to career page, ATS, or job boards | Job details exported via ATS adapter | Public job posting |
| 2.2 | Candidate | Applies via public link, uploads resume, grants consent | Uploads file; system stores resume in object storage; creates `candidates` row with `consent_status=pending` | Candidate record |
| 2.3 | System | Parses resume asynchronously | Celery `parse_resume` task calls resume parser adapter | Parsed profile JSON |
| 2.4 | System | Computes semantic embedding | Writes to `candidate_profiles.embedding` (pgvector) | Vector representation |
| 2.5 | System | Matches candidate to job | Vector similarity + rule-based matching | Match score |
| 2.6 | System | Sends consent confirmation | Email/WhatsApp adapter sends consent request | Consent pending |
| 2.7 | Candidate | Confirms consent | Updates `candidates.consent_status=granted` | Eligible for assessment |

### Decision Gate
- If consent not granted → assessment cannot start; send reminders; auto-close after TTL.
- If resume parse fails → queue retry; fallback to manual review.
- If match score below threshold → candidate may be filtered or routed to different role.

### Audit
- `audit_logs`: `candidate.created`, `resume.uploaded`, `resume.parsed`, `candidate.matched`, `consent.granted`.

---

## Stage 3 — Assessment Orchestration

### Goal
Execute the right sequence of assessments for each candidate based on the job path.

### Activities

| Step | Actor | Activity | System Action | Output |
|------|-------|----------|---------------|--------|
| 3.1 | System / Client | Starts candidate assessment | `POST /api/v1/assessments` creates `assessments` row with `status=in_progress` | Assessment instance |
| 3.2 | System | Presents first assessment module | Reads `job_assessment_paths.path_json` | First module rendered |
| 3.3 | Candidate | Completes skill / cognitive / scenario assessment | Answers stored; scores computed via rule engine | Module scores |
| 3.4 | Candidate | Records audio response (Level 3) | Audio uploaded; transcript generated via STT adapter; stored in `audio_responses` | Audio + transcript |
| 3.5 | Candidate | Records video response | Video uploaded; transcript generated; stored in `video_responses` | Video + transcript |
| 3.6 | System | Scores responses asynchronously | Celery tasks `score_audio_response`, `score_video_response` call LLM/rubric | Score JSON per response |
| 3.7 | System | Validates responses for bias | Protected attribute detection; excludes protected traits | Bias-safe scores |
| 3.8 | System | Checks gating rules | If module score < threshold, may skip or add remedial module | Path adaptation |
| 3.9 | Candidate / System | Proceeds through all modules | Assessment status moves to `completed` | Completed assessment |

### Decision Gate
- If audio/video quality poor → request re-recording.
- If protected attribute detected in transcript → redact and exclude from scoring.
- If candidate attempts malpractice → flag in audit log; may invalidate assessment.

### Data Flow
```
Candidate → Assessment API → CandidateAssessment
                    ↓
            Object Storage (audio/video)
                    ↓
            Celery Worker → STT Adapter → LLM Scoring
                    ↓
            audio_responses / video_responses / assessment_scores
```

### Audit
- `audit_logs`: `assessment.started`, `audio.response.submitted`, `video.response.submitted`, `response.scored`, `assessment.completed`.

---

## Stage 4 — Scoring & Explainable Recommendation

### Goal
Aggregate all assessment signals into a final score and explainable hiring recommendation.

### Activities

| Step | Actor | Activity | System Action | Output |
|------|-------|----------|---------------|--------|
| 4.1 | System | Aggregates raw scores by category | Sums `assessment_scores` weighted by job requirements | Weighted category scores |
| 4.2 | System | Computes final score | `score_candidate()` applies category weights | Final score (0–100) |
| 4.3 | System | Generates recommendation | Maps score to `strong_reject/reject/neutral/recommend/strong_recommend` | Recommendation label |
| 4.4 | System | Generates explanation | LLM produces human-readable rationale per category | Explanation JSON |
| 4.5 | System | Caches result | Redis `assessment:{id}:score` | Cached score |
| 4.6 | System | Generates assessment report PDF | Celery `generate_assessment_report` | Report URL |
| 4.7 | Client | Reviews scorecard, explanation, and report | Reads from dashboard | Informed decision |

### Decision Gate
- If final score ≥ passing_score → candidate moves to interview shortlist.
- If borderline → flag for human evaluator review.
- If below threshold → auto-reject with explanation; client can override.

### Audit
- `audit_logs`: `assessment.scored`, `recommendation.generated`, `score.override` (if client changes).

---

## Stage 5 — Shortlisting & Interview Booking

### Goal
Shortlist qualified candidates and book final-round interviews using the slots captured at JD creation.

### Activities

| Step | Actor | Activity | System Action | Output |
|------|-------|----------|---------------|--------|
| 5.1 | Client (Hiring Manager) | Reviews AI scorecard and assessment report | Dashboard aggregates `assessment_scores` + explanation | Shortlist decision view |
| 5.2 | Client | Shortlists candidate for final client interview | Marks candidate as shortlisted; creates interview pipeline entry | Shortlisted candidate |
| 5.3 | System | Displays available interview slots from Stage 1 | `GET /api/v1/jobs/{id}/slots` filters slots still `available` | Slot list |
| 5.4 | Client / Candidate | Selects preferred slot | Slot selection payload | Selected slot |
| 5.5 | System | Books slot atomically | `SELECT FOR UPDATE` / optimistic lock on `interview_slots`; creates `interview_bookings` | Confirmed booking |
| 5.6 | System | Creates calendar event | Calendar adapter (Google/Outlook) | Calendar invite |
| 5.7 | System | Sends notifications | Email/WhatsApp adapters send reminders to client and candidate | Notifications queued |
| 5.8 | System | Generates meeting link | Video conferencing adapter (Zoom/Teams) | Meeting link |

### Decision Gate
- If candidate not shortlisted → no booking allowed.
- If slot double-booked → transaction rollback; return conflict error.
- If candidate no-shows → mark `no_show`; trigger reschedule workflow.
- If client cancels → release slot; notify candidate.

### Audit
- `audit_logs`: `interview.slot.created`, `interview.booked`, `interview.calendar.created`, `interview.cancelled`.

---

## Stage 6 — Client Final Interview & Decision

### Goal
The client (hiring manager) conducts the final round, reviews the AI scorecard and interview report, and makes the hire/reject decision.

### Activities

| Step | Actor | Activity | System Action | Output |
|------|-------|----------|---------------|--------|
| 6.1 | Client | Joins final video interview via meeting link | Authenticates, loads AI scorecard and structured scorecard | Final interview session |
| 6.2 | System | Displays AI scorecard + assessment report | Loads `assessment_scores`, explanation, and report URL | Decision-support view |
| 6.3 | Client | Conducts final round interview | Video session recorded (if enabled) | Interview recording |
| 6.4 | Client | Submits final interview ratings and notes | Stores in `assessment_scores` with `scored_by=client` | Client feedback row |
| 6.5 | System | Updates recommendation if needed | Re-runs final score with client feedback | Updated score |
| 6.6 | Client | Reviews AI scorecard, assessment report, and own interview notes | Unified candidate packet view | Final decision view |
| 6.7 | Client | Makes hire / reject / keep-in-pool decision | Updates `assessments.recommendation` | Final decision |

### Decision Gate
- If client feedback conflicts with AI score → system highlights discrepancy; client decides.
- If hire → move to offer/ATS stage.
- If reject → send candidate notification with optional feedback.
- If keep-in-pool → candidate tagged for future roles.

### Audit
- `audit_logs`: `interview.started`, `interview.feedback.submitted`, `recommendation.updated`.

---

## Stage 7 — Offer & Onboarding

### Goal
Execute the hire outcome: send offer, close job, and trigger onboarding.

### Activities

| Step | Actor | Activity | System Action | Output |
|------|-------|----------|---------------|--------|
| 7.1 | Client | Confirms hire decision | System validates decision was made in Stage 6 | Hire confirmed |
| 7.2 | System | Triggers offer workflow | Integrates with ATS/HRIS; generates offer letter; sends via email | Offer dispatched |
| 7.3 | System | Closes job requisition | `job_requests.status=closed` when position filled | Closed job |
| 7.4 | System | Triggers onboarding checklist | HRIS/onboarding adapter notified | Onboarding initiated |
| 7.5 | System | Archives assessment data per retention policy | Sets `data_retention_until` | Compliance-ready archive |

### Decision Gate
- If candidate rejects offer → reopen shortlist or re-advertise.
- If candidate accepts → move to onboarding.
- If reject decision in Stage 6 → send candidate notification; allow re-apply after cooldown.

### Audit
- `audit_logs`: `hiring.decision.made`, `offer.sent`, `job.closed`.

---

## Stage 8 — Ongoing Monitoring & Compliance

### Goal
Ensure fairness, auditability, and continuous improvement.

### Activities

| Step | Actor | Activity | System Action | Output |
|------|-------|----------|---------------|--------|
| 8.1 | Admin / Auditor | Reviews audit logs | `GET /api/v1/admin/audit-logs` with filters | Audit trail |
| 8.2 | System | Runs bias detection reports | Aggregates scores by protected attributes | Bias report |
| 8.3 | System | Monitors cost & quotas | Cost control service tracks LLM/provider spend | Usage dashboard |
| 8.4 | Superadmin | Rotates integration credentials | Updates `integration_credentials` with new secret reference | Rotated keys |
| 8.5 | System | Applies data retention policy | Anonymizes or deletes expired candidate data | GDPR/CCPA compliance |
| 8.6 | System | Generates platform metrics | Hiring velocity, time-to-hire, AI accuracy | Ops metrics |

### Audit
- `audit_logs`: `audit_log.viewed`, `credential.rotated`, `data.retention.executed`.

---

## Cross-Cutting Concerns

### Multi-Tenancy
- Every request carries `x-tenant-id` header or JWT claim.
- All queries filtered by `tenant_id`.
- Tenant isolation enforced at repository layer.

### Security
- JWT authentication + RBAC permission checks on every route.
- PII encrypted; secrets stored in KMS/Vault.
- Protected attributes excluded from scoring.

### Caching
- `job:{id}:path` / `job:{id}:jd` TTL 1h
- `candidate:{id}:profile` TTL 30m
- `assessment:{id}:score` TTL 15m
- Cache invalidated on relevant writes.

### Async Workers (Celery)
- Resume parsing
- Audio/video scoring
- JD enrichment
- Report generation
- Notification dispatch
- Data retention cleanup

### Integrations (MCP/Adapters)
- LLM: OpenAI / Claude / Gemini
- Resume parser
- Speech-to-text
- Object storage: S3 / GCS / MinIO
- Calendar: Google / Outlook
- Communication: Email / WhatsApp
- Video: Zoom / Teams
- Payment gateway
- ATS / HRIS
- KMS / Vault

---

## Journey Summary Diagram

```
[Stage 0] Tenant Onboarding
    ↓
[Stage 1] Client Intake → Job Request + JD + Assessment Path
    ↓
[Stage 2] Candidate Applies → Resume Parse → Consent → Match
    ↓
[Stage 3] Assessment Orchestration → Skill/Audio/Video Modules
    ↓
[Stage 4] AI Scoring → Explainable Recommendation + Report
    ↓
[Stage 5] Shortlist Candidate → Book Interview from Pre-Defined Slots
    ↓
[Stage 6] Client Final Interview + Review AI Scorecard & Report → Hire / Reject
    ↓
[Stage 7] Offer & Onboarding / Reject Notification
    ↓
[Stage 8] Audit, Compliance, Monitoring, Improvement
```

---

## Verification Checklist

- [x] All personas have clear touchpoints
- [x] Each stage has explicit inputs, system actions, and outputs
- [x] Decision gates are defined
- [x] Audit points cover every critical action
- [x] Integrations are mapped to stages
- [x] Async workers handle heavy/expensive operations
- [x] Multi-tenant isolation is maintained throughout
