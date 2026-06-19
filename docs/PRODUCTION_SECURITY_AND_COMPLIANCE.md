# Production Security and Compliance Blueprint

## Security Model
- Multi-tenant isolation by tenant_id.
- Role-based access control for superadmin, platform_admin, client_admin, hiring_manager, candidate, and auditor.
- JWT or enterprise SSO for authentication.
- KMS/Vault-based encryption for provider credentials.
- Object storage with private buckets and signed URLs.
- Audit logs for all AI scoring, MCP calls, credential changes, candidate status changes, and interview decisions.

## Hiring Compliance Rules
- Do not score protected attributes.
- Do not auto-reject candidates without human review.
- Candidate consent is required before assessment and data enrichment.
- Web data must be approved, sourced, logged, and compliance-checked.
- Candidate reports must show explainable scoring.
- Client-facing scorecards must separate facts, AI inference, and human decisions.

## Data Residency
Global deployments should support region selection:
- India
- UAE/Middle East
- UK/EU
- US
- APAC

## Credential Management
- Superadmin Integration Vault controls provider credentials.
- Store encrypted reference, not raw secret.
- Show masked preview only.
- Rotate high-risk credentials every 90 days.
- Separate sandbox and production credentials.

## Audit Events
Audit every event for:
- JD generation
- Assessment path generation
- Trait question generation and approval
- Candidate matching
- Audio/video scoring
- Compliance decision
- Interview booking
- Credential save/test/rotate
- Human override

## Human-in-the-loop
Required for:
- Candidate rejection
- Senior leadership assessment finalization
- High-risk compliance flags
- Unverified scraped/public web-data enrichment
- Client-specific scoring override
