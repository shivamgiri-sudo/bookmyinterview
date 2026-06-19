# Apify Integration Blueprint

## Why Apify
Apify can be used as BOOK MY INTERVIEW's controlled web-data acquisition layer. It provides Actors, which are serverless programs that accept structured JSON input, run scraping/browser automation/data processing tasks, and produce structured output that can be used by APIs or workflows.

## Where Apify Fits
Use Apify for:
- Public web data enrichment
- Company intelligence
- Job-market intelligence
- Salary and hiring market signals where permitted
- Public directory extraction where terms allow
- Scheduled web monitoring
- Feeding approved public data into candidate/job intelligence pipelines

Do not use Apify for:
- Circumventing access controls
- Scraping private profiles without consent
- Violating LinkedIn/Naukri/other platform terms
- Collecting sensitive personal data without lawful basis
- Making hiring decisions from unverified scraped data

## Superadmin Credentials
Fields:
- api_token
- actor_id
- dataset_id
- webhook_secret
- proxy_group

## Production Flow
1. Superadmin configures Apify credentials in Integration Vault.
2. Admin creates approved Actor policy.
3. Hiring workflow requests a web-data job.
4. System checks compliance policy.
5. Apify Actor runs with structured JSON input.
6. Output goes to staging table.
7. AI normalizes and scores data quality.
8. Human/admin approval required for sensitive enrichment.
9. Approved data moves into candidate/company intelligence layer.

## Database Tables

### apify_actor_registry
- actor_registry_id
- actor_id
- actor_name
- purpose
- allowed_input_schema_json
- output_schema_json
- compliance_level
- active_status

### apify_runs
- run_id
- actor_registry_id
- requested_by
- job_id nullable
- candidate_id nullable
- input_json
- dataset_id
- status
- started_at
- finished_at
- records_count

### apify_data_staging
- staging_id
- run_id
- source_url
- extracted_json
- data_quality_score
- consent_required
- approval_status
- approved_by
- approved_at

## API Adapter Contract
- POST `/api/web-data/apify/run`
- GET `/api/web-data/apify/runs/{run_id}`
- GET `/api/web-data/apify/datasets/{dataset_id}`
- POST `/api/web-data/apify/approve-staging`

## Compliance Guardrails
- Maintain source URL for every record.
- Store run logs and actor configuration.
- Respect robots/source terms and platform contracts.
- Rate-limit and schedule jobs.
- Do not enrich protected attributes.
- Do not auto-reject candidates using scraped data.
