# Production Database Schema

> PostgreSQL 16+ with `pgvector` extension. Row-level security per `tenant_id`. JSONB used for flexible schemas. Soft deletes via `status`/`deleted_at`.

## Core Tables

### tenants
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK | |
| name | VARCHAR(180) | |
| slug | VARCHAR(80) UNIQUE | URL-safe identifier |
| region | VARCHAR(40) | data residency region |
| plan | VARCHAR(40) | starter/growth/enterprise |
| billing_status | VARCHAR(40) | active/trial/suspended |
| settings_json | JSONB | feature flags, quotas |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### users
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK | |
| tenant_id | BIGINT FK → tenants | indexed |
| email | VARCHAR(255) | indexed, unique per tenant |
| full_name | VARCHAR(160) | |
| role | VARCHAR(60) | superadmin/tenant_admin/hiring_manager/evaluator/candidate |
| password_hash | VARCHAR(255) | bcrypt |
| is_active | BOOLEAN | default true |
| last_login_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | soft delete |

### job_requests
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK | |
| tenant_id | BIGINT FK → tenants | indexed |
| designation | VARCHAR(160) | indexed |
| department | VARCHAR(120) | |
| industry | VARCHAR(120) | |
| location | VARCHAR(120) | |
| seniority | VARCHAR(80) | |
| salary_min | INTEGER | |
| salary_max | INTEGER | |
| currency | VARCHAR(3) | default USD |
| status | VARCHAR(60) | draft/active/closed/archived |
| requirement_json | JSONB | raw intake data |
| generated_jd | TEXT | generated JD |
| created_by | BIGINT FK → users | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### job_requirements
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK | |
| job_id | BIGINT FK → job_requests | indexed |
| skills_json | JSONB | list of skills + weights |
| traits_json | JSONB | list of traits + rubrics |
| competencies_json | JSONB | |
| interview_process_json | JSONB | stages, order, dependencies |
| missing_gaps_json | JSONB | detected requirement gaps |

### candidates
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK | |
| tenant_id | BIGINT FK → tenants | indexed |
| full_name | VARCHAR(160) | |
| email | VARCHAR(255) | indexed |
| phone | VARCHAR(80) | encrypted |
| location | VARCHAR(120) | |
| consent_status | VARCHAR(50) | pending/granted/withdrawn |
| consent_granted_at | TIMESTAMPTZ | |
| data_retention_until | DATE | |
| profile_json | JSONB | summary |
| created_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |
| UNIQUE(tenant_id, email) | |

### candidate_profiles
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK | |
| candidate_id | BIGINT FK → candidates | indexed |
| resume_url | VARCHAR(500) | object storage URL |
| resume_hash | VARCHAR(64) | sha256 of file |
| parsed_profile_json | JSONB | structured resume data |
| skills_json | JSONB | normalized skills |
| experience_years | FLOAT | |
| current_ctc | INTEGER | |
| expected_ctc | INTEGER | |
| notice_period_days | INTEGER | |
| embedding | VECTOR(1536) | pgvector semantic embedding (optional extension) |

### assessment_templates
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK | |
| role_family | VARCHAR(120) | indexed |
| designation | VARCHAR(160) | indexed |
| seniority_level | VARCHAR(80) | |
| industry | VARCHAR(120) | |
| default_path_json | JSONB | |
| passing_score | FLOAT | |

### assessment_rules
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK | |
| condition_field | VARCHAR(120) | |
| operator | VARCHAR(40) | eq/gt/lt/in |
| threshold_value | JSONB | |
| assessment_to_add | VARCHAR(120) | |
| priority | INTEGER | |
| active_status | BOOLEAN | default true |

### job_assessment_paths
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK | |
| job_id | BIGINT FK → job_requests | indexed |
| path_json | JSONB | final assessment path |
| generated_by | VARCHAR(60) | rule_engine/llm/manual |
| version | INTEGER | default 1 |
| modification_reason | TEXT | |
| created_at | TIMESTAMPTZ | |

### trait_questions
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK | |
| trait_id | VARCHAR(80) | indexed |
| role_family | VARCHAR(120) | indexed |
| question_text | TEXT | |
| scoring_rubric_json | JSONB | |
| validation_status | VARCHAR(60) | pending/approved/rejected |
| active_status | BOOLEAN | default true |

### assessments
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK | |
| tenant_id | BIGINT FK → tenants | indexed |
| candidate_id | BIGINT FK → candidates | indexed |
| job_id | BIGINT FK → job_requests | indexed |
| path_id | BIGINT FK → job_assessment_paths | nullable |
| path_json | JSONB | snapshot of assessment path |
| status | VARCHAR(60) | draft/in_progress/completed/cancelled |
| final_score | FLOAT | nullable |
| recommendation | VARCHAR(80) | strong_reject/reject/neutral/recommend/strong_recommend |
| started_at | TIMESTAMPTZ | |
| completed_at | TIMESTAMPTZ | |
| shortlisted_at | TIMESTAMPTZ | set when client shortlists |
| shortlisted_by | BIGINT FK → users | who shortlisted |
| client_feedback_json | JSONB | final interview ratings + notes |
| client_decision | VARCHAR(40) | hire/reject/keep_in_pool |
| decided_at | TIMESTAMPTZ | when client decided |
| created_at | TIMESTAMPTZ | |

### assessment_responses
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK | |
| assessment_id | BIGINT FK → assessments | indexed |
| question_id | BIGINT FK → trait_questions | nullable |
| question_text | TEXT | snapshot of question |
| response_type | VARCHAR(20) | audio/video/text |
| media_url | VARCHAR(500) | S3 URL if audio/video |
| transcript | TEXT | STT output |
| response_text | TEXT | typed/text response |
| duration_seconds | INTEGER | |
| score_json | JSONB | model scores |
| created_at | TIMESTAMPTZ | |

### audio_responses (deprecated)
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK | |
| assessment_id | BIGINT FK → assessments | indexed |
| question_id | BIGINT FK → trait_questions | |
| audio_url | VARCHAR(500) | |
| transcript | TEXT | |
| duration_seconds | INTEGER | |
| score_json | JSONB | |
| created_at | TIMESTAMPTZ | |

### video_responses (deprecated)
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK | |
| assessment_id | BIGINT FK → assessments | indexed |
| question_id | BIGINT FK → trait_questions | |
| video_url | VARCHAR(500) | |
| transcript | TEXT | |
| score_json | JSONB | |
| created_at | TIMESTAMPTZ | |

### assessment_scores
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK | |
| assessment_id | BIGINT FK → assessments | indexed |
| category | VARCHAR(120) | skill/trait/competency |
| raw_score | FLOAT | |
| weighted_score | FLOAT | |
| explanation | TEXT | explainable AI output |
| scored_by | VARCHAR(60) | llm/rule/manual |
| created_at | TIMESTAMPTZ | |

### interview_slots
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK | |
| tenant_id | BIGINT FK → tenants | indexed |
| job_id | BIGINT FK → job_requests | indexed |
| interviewer_id | BIGINT FK → users | nullable |
| start_time | TIMESTAMPTZ | indexed |
| end_time | TIMESTAMPTZ | |
| mode | VARCHAR(40) | digital/physical |
| status | VARCHAR(40) | available/booked/cancelled/closed |
| version | INTEGER | optimistic locking |
| created_by | BIGINT FK → users | who created the slot |
| created_at | TIMESTAMPTZ | |

### interview_bookings
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK | |
| tenant_id | BIGINT FK → tenants | indexed |
| slot_id | BIGINT FK → interview_slots | unique |
| assessment_id | BIGINT FK → assessments | candidate assessment round |
| candidate_id | BIGINT FK → candidates | |
| job_id | BIGINT FK → job_requests | |
| meeting_link | VARCHAR(500) | |
| report_url | VARCHAR(500) | |
| reminder_sent_at | TIMESTAMPTZ | |
| status | VARCHAR(40) | booked/completed/cancelled/no_show |
| created_at | TIMESTAMPTZ | |

### integration_credentials
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK | |
| tenant_id | BIGINT FK → tenants | nullable (global) |
| facility_key | VARCHAR(120) | indexed |
| provider_name | VARCHAR(160) | |
| environment | VARCHAR(40) | sandbox/production |
| encrypted_secret_reference | TEXT | Vault/KMS reference |
| masked_preview | VARCHAR(255) | |
| status | VARCHAR(60) | active/rotated/revoked |
| rotated_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |

### audit_logs
| Column | Type | Notes |
|--------|------|-------|
| id | BIGSERIAL PK | |
| tenant_id | BIGINT FK → tenants | indexed |
| actor_id | BIGINT FK → users | nullable |
| actor_role | VARCHAR(80) | |
| entity_type | VARCHAR(120) | indexed |
| entity_id | VARCHAR(120) | indexed |
| action | VARCHAR(120) | indexed |
| risk_level | VARCHAR(60) | low/medium/high/critical |
| payload_json | JSONB | |
| created_at | TIMESTAMPTZ | indexed |

## Indexes

- All foreign keys indexed.
- `audit_logs`: BRIN index on `created_at` for time-series queries.
- `candidate_profiles`: ivfflat index on `embedding` for vector search.
- `interview_slots`: partial index on `status = 'available'`.
- `job_requests`: GIN index on `requirement_json`.

## Integrity Rules

1. Every `job_request`, `candidate`, `assessment`, `interview_booking`, `audit_log` belongs to one `tenant`.
2. Candidate consent must be `granted` before assessment start.
3. Score changes create an immutable `audit_log` entry.
4. Soft delete: set `deleted_at`; never physically delete hiring records.
5. Interview slot booking uses optimistic locking (`version`) to prevent double-booking.
