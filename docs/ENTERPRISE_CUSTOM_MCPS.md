# Enterprise Custom MCPs for BOOK MY INTERVIEW

These MCPs are the product moat. They convert BOOK MY INTERVIEW from a normal recruitment tool into an enterprise AI hiring operating system.

## 1. JD Intelligence MCP
Purpose: Convert raw client hiring requirements into a complete JD, missing-gap analysis, client follow-up questions, competencies, traits, assessment preview, and scorecard.

Endpoint:
- POST `/api/mcp/jd-intelligence/analyze`

Core tools:
- analyze_hiring_requirement
- generate_jd
- detect_missing_gaps
- build_interview_scorecard

## 2. Assessment Intelligence MCP
Purpose: Decide whether a profile requires resume-only, skill test, scenario, audio, video, both, or executive simulation. It also evaluates assessment components and returns explainable final scores.

Endpoint:
- POST `/api/mcp/assessment-intelligence/orchestrate`

Core tools:
- generate_assessment_path
- evaluate_audio
- evaluate_video
- calculate_final_score

## 3. Candidate Matching MCP
Purpose: Match candidate profiles to JDs using skills, experience, salary, notice period, location, assessment readiness, evidence quality, and risk signals.

Endpoint:
- POST `/api/mcp/candidate-matching/match`

Core tools:
- match_candidate_to_job
- rank_candidates
- explain_match
- flag_candidate_risks

Important: This MCP should recommend shortlist/review/hold only. It should not automatically reject candidates without human review.

## 4. Trait Question MCP
Purpose: Generate, validate, approve, version, and evaluate trait questions for role-wise assessments.

Endpoint:
- POST `/api/mcp/trait-question/generate-validate`

Core tools:
- generate_trait_questions
- validate_trait_question
- evaluate_trait_response
- check_consistency

## 5. Compliance MCP
Purpose: Enforce consent, protected-attribute exclusion, audit logs, source approval, data minimization, and human-review requirements.

Endpoint:
- POST `/api/mcp/compliance/check`

Core tools:
- check_action_policy
- check_data_source
- mask_sensitive_data
- create_audit_event

## MCP Gateway Rules
- Deny by default.
- Every tool call must include tenant scope.
- Every tool call must create audit logs.
- Credentials come only from Superadmin Integration Vault.
- Sensitive hiring actions require human approval.
- Compliance MCP should run before sourcing, scraping, scoring, shortlist, or rejection workflows.

## Production Database Tables

### mcp_servers
- mcp_server_id
- server_key
- server_name
- risk_level
- active_status

### mcp_tools
- mcp_tool_id
- mcp_server_id
- tool_name
- endpoint
- input_schema_json
- output_schema_json
- human_approval_required

### mcp_tool_runs
- run_id
- mcp_tool_id
- tenant_id
- actor_id
- actor_role
- input_json
- output_json
- policy_result_json
- status
- created_at

### mcp_audit_logs
- audit_id
- run_id
- action
- old_json
- new_json
- ip_address
- created_at

## Current MVP Implementation
- `backend/app/services/enterprise_mcp.py`
- `backend/app/api/enterprise_mcp_routes.py`
- `mcp/enterprise_mcp_manifest.json`
