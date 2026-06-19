-- BOOK MY INTERVIEW Global Enterprise Foundation
-- Run against PostgreSQL or adapt through Alembic migrations.

CREATE TABLE IF NOT EXISTS tenants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  region VARCHAR(40) DEFAULT 'global',
  plan VARCHAR(40) DEFAULT 'starter',
  status VARCHAR(40) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(160) NOT NULL,
  role VARCHAR(60) DEFAULT 'client_admin',
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_requests (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id),
  designation VARCHAR(160) NOT NULL,
  industry VARCHAR(120) DEFAULT 'General',
  location VARCHAR(120) DEFAULT 'Remote',
  seniority VARCHAR(80) DEFAULT 'Mid',
  budget VARCHAR(120),
  status VARCHAR(60) DEFAULT 'draft',
  requirement_json TEXT DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidates (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id),
  full_name VARCHAR(160) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(80),
  location VARCHAR(120),
  consent_status VARCHAR(50) DEFAULT 'unknown',
  profile_json TEXT DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, email)
);

CREATE TABLE IF NOT EXISTS candidate_profiles (
  id SERIAL PRIMARY KEY,
  candidate_id INTEGER REFERENCES candidates(id) NOT NULL,
  resume_url VARCHAR(500),
  resume_hash VARCHAR(64),
  parsed_profile_json TEXT DEFAULT '{}',
  skills_json TEXT DEFAULT '[]',
  experience_years FLOAT,
  current_ctc INTEGER,
  expected_ctc INTEGER,
  notice_period_days INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_candidate_profiles_candidate_id ON candidate_profiles(candidate_id);

CREATE TABLE IF NOT EXISTS assessment_templates (
  id SERIAL PRIMARY KEY,
  role_family VARCHAR(120) NOT NULL,
  designation VARCHAR(160) NOT NULL,
  seniority_level VARCHAR(80),
  industry VARCHAR(120),
  default_path_json TEXT DEFAULT '[]',
  passing_score FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_assessment_templates_role_family ON assessment_templates(role_family);
CREATE INDEX IF NOT EXISTS ix_assessment_templates_designation ON assessment_templates(designation);

CREATE TABLE IF NOT EXISTS assessment_rules (
  id SERIAL PRIMARY KEY,
  condition_field VARCHAR(120) NOT NULL,
  operator VARCHAR(40) NOT NULL,
  threshold_value TEXT DEFAULT '{}',
  assessment_to_add VARCHAR(120) NOT NULL,
  priority INTEGER DEFAULT 0,
  active_status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_assessment_paths (
  id SERIAL PRIMARY KEY,
  job_id INTEGER REFERENCES job_requests(id) NOT NULL,
  path_json TEXT DEFAULT '[]',
  generated_by VARCHAR(60),
  version INTEGER DEFAULT 1,
  modification_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_job_assessment_paths_job_id ON job_assessment_paths(job_id);

CREATE TABLE IF NOT EXISTS trait_questions (
  id SERIAL PRIMARY KEY,
  trait_id VARCHAR(80) NOT NULL,
  role_family VARCHAR(120),
  question_text TEXT NOT NULL,
  scoring_rubric_json TEXT DEFAULT '{}',
  validation_status VARCHAR(60) DEFAULT 'pending',
  active_status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_trait_questions_trait_id ON trait_questions(trait_id);
CREATE INDEX IF NOT EXISTS ix_trait_questions_role_family ON trait_questions(role_family);

CREATE TABLE IF NOT EXISTS assessments (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) NOT NULL,
  job_id INTEGER REFERENCES job_requests(id) NOT NULL,
  candidate_id INTEGER REFERENCES candidates(id),
  path_id INTEGER REFERENCES job_assessment_paths(id),
  path_json TEXT DEFAULT '{}',
  final_score FLOAT,
  recommendation VARCHAR(80),
  status VARCHAR(60) DEFAULT 'draft',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  shortlisted_at TIMESTAMPTZ,
  shortlisted_by INTEGER REFERENCES users(id),
  client_feedback_json TEXT DEFAULT '{}',
  client_decision VARCHAR(40),
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_assessments_tenant_id ON assessments(tenant_id);
CREATE INDEX IF NOT EXISTS ix_assessments_candidate_id ON assessments(candidate_id);
CREATE INDEX IF NOT EXISTS ix_assessments_job_id ON assessments(job_id);

CREATE TABLE IF NOT EXISTS assessment_responses (
  id SERIAL PRIMARY KEY,
  assessment_id INTEGER REFERENCES assessments(id) NOT NULL,
  question_id INTEGER REFERENCES trait_questions(id),
  question_text TEXT,
  response_type VARCHAR(20) DEFAULT 'text',
  media_url VARCHAR(500),
  transcript TEXT,
  response_text TEXT,
  duration_seconds INTEGER,
  score_json TEXT DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_assessment_responses_assessment_id ON assessment_responses(assessment_id);

CREATE TABLE IF NOT EXISTS assessment_scores (
  id SERIAL PRIMARY KEY,
  assessment_id INTEGER REFERENCES assessments(id) NOT NULL,
  category VARCHAR(120) NOT NULL,
  raw_score FLOAT,
  weighted_score FLOAT,
  explanation TEXT,
  scored_by VARCHAR(60),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_assessment_scores_assessment_id ON assessment_scores(assessment_id);

CREATE TABLE IF NOT EXISTS interview_slots (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) NOT NULL,
  job_id INTEGER REFERENCES job_requests(id) NOT NULL,
  interviewer_id INTEGER REFERENCES users(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  mode VARCHAR(40) DEFAULT 'digital',
  status VARCHAR(40) DEFAULT 'available',
  version INTEGER DEFAULT 1,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_interview_slots_tenant_id ON interview_slots(tenant_id);
CREATE INDEX IF NOT EXISTS ix_interview_slots_job_id ON interview_slots(job_id);
CREATE INDEX IF NOT EXISTS ix_interview_slots_interviewer_id ON interview_slots(interviewer_id);
CREATE INDEX IF NOT EXISTS ix_interview_slots_start_time ON interview_slots(start_time);
CREATE INDEX IF NOT EXISTS ix_interview_slots_available ON interview_slots(status) WHERE status = 'available';

CREATE TABLE IF NOT EXISTS interview_bookings (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) NOT NULL,
  slot_id INTEGER REFERENCES interview_slots(id) UNIQUE NOT NULL,
  assessment_id INTEGER REFERENCES assessments(id),
  candidate_id INTEGER REFERENCES candidates(id) NOT NULL,
  job_id INTEGER REFERENCES job_requests(id) NOT NULL,
  meeting_link VARCHAR(500),
  report_url VARCHAR(500),
  reminder_sent_at TIMESTAMPTZ,
  status VARCHAR(40) DEFAULT 'booked',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_interview_bookings_tenant_id ON interview_bookings(tenant_id);
CREATE INDEX IF NOT EXISTS ix_interview_bookings_candidate_id ON interview_bookings(candidate_id);
CREATE INDEX IF NOT EXISTS ix_interview_bookings_job_id ON interview_bookings(job_id);
CREATE INDEX IF NOT EXISTS ix_interview_bookings_assessment_id ON interview_bookings(assessment_id);

CREATE TABLE IF NOT EXISTS integration_credentials (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id),
  facility_key VARCHAR(120) NOT NULL,
  provider_name VARCHAR(160) NOT NULL,
  environment VARCHAR(40) DEFAULT 'sandbox',
  encrypted_secret_reference TEXT NOT NULL,
  masked_preview VARCHAR(255) NOT NULL,
  status VARCHAR(60) DEFAULT 'active',
  rotated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id),
  actor_id INTEGER REFERENCES users(id),
  actor_role VARCHAR(80) DEFAULT 'system',
  entity_type VARCHAR(120) NOT NULL,
  entity_id VARCHAR(120),
  action VARCHAR(120) NOT NULL,
  risk_level VARCHAR(60) DEFAULT 'low',
  payload_json TEXT DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS human_review_queue (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id),
  entity_type VARCHAR(120) NOT NULL,
  entity_id VARCHAR(120),
  review_type VARCHAR(120) NOT NULL,
  priority VARCHAR(40) DEFAULT 'normal',
  reason TEXT NOT NULL,
  status VARCHAR(40) DEFAULT 'open',
  assigned_to INTEGER REFERENCES users(id),
  decision VARCHAR(80),
  decision_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);
