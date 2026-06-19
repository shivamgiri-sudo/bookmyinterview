# Superadmin Integration Vault

## Purpose
The Superadmin Integration Vault is the single secure control center for configuring all external facilities used by BOOK MY INTERVIEW.

## Facilities Covered
- LLM providers: OpenAI, Claude, Gemini
- Resume parsing: Affinda, RChilli, Textkernel or custom parser
- Speech-to-text and audio assessment: Deepgram, Whisper or equivalent
- Video interview storage and signed playback URLs
- Calendar and meeting providers: Google Calendar, Microsoft Graph, Zoom, Teams, Meet
- Communication: Email, WhatsApp, SMS
- Payment: Razorpay, Stripe
- Job board and ATS connectors
- Figma MCP, Cursor MCP, GitHub MCP
- Object storage and vector database

## Security Rules
- Only Superadmin can create, edit, test, rotate, or disable global credentials.
- Credentials must never be stored in plain text in production.
- Use AWS KMS, GCP KMS, Azure Key Vault, or HashiCorp Vault.
- Saved credentials must be shown only in masked form.
- Production and sandbox credentials must be separated.
- Every action must create an audit log.
- Client-specific credentials should be isolated by tenant scope.

## Backend Endpoints
- GET `/api/superadmin/integrations`
- POST `/api/superadmin/integrations/save`
- POST `/api/superadmin/integrations/test`
- GET `/api/superadmin/integrations/security-policy`

## Production Database Tables

### integration_providers
- provider_id
- facility_key
- provider_name
- category
- active_status

### integration_credentials
- credential_id
- provider_id
- tenant_scope
- company_id nullable
- environment
- encrypted_secret_reference
- masked_preview
- status
- created_by
- updated_by
- rotated_at

### integration_audit_logs
- audit_id
- provider_id
- credential_id
- action
- actor_id
- actor_role
- old_status
- new_status
- ip_address
- created_at

## UI Route
`/superadmin`
