# Founder Execution Notes: Global Product Build

## Product Belief
BOOK MY INTERVIEW must become the hiring intelligence layer for global employers. The goal is not to copy ATS tools. The goal is to own the decision layer between hiring demand and interview-ready talent.

## What We Are Building
A global enterprise SaaS platform with:
- Smart client intake
- JD intelligence
- Assessment orchestration
- Candidate matching
- Trait evaluation
- Audio/video assessments
- Compliance controls
- Human review queue
- Integration vault
- MCP gateway
- Global billing
- Regional policy engine

## Non-Negotiables
- Premium UI/UX only.
- Explainable AI decisions only.
- Human review for risky hiring decisions.
- No protected-attribute scoring.
- No unapproved scraped data in candidate decisions.
- Tenant isolation from day one.
- Audit logs for every sensitive action.
- Global design, not India-only assumptions.

## Near-Term Engineering Focus
1. Convert SQL bootstrap into full Alembic revisions.
2. Mount all newly added API routers.
3. Build app factory for route registration.
4. Add real authentication provider.
5. Implement persistent Integration Vault using KMS/Vault references.
6. Add PostgreSQL and pgvector support.
7. Add candidate consent UX.
8. Add human review dashboard.
9. Add billing page and subscription workflow.
10. Add CI tests for all route modules.

## Global GTM Thought
Start with high-volume hiring markets where English/audio/video screening has clear value:
- India
- UAE
- Philippines
- UK
- US SMB/mid-market

Then expand into enterprise with SSO, ATS integrations, and regional data residency.
