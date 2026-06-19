# Production Hardening Status

## Completed in this phase

### Auth and access
- Credential registration and login.
- Access token and refresh token lifecycle.
- Logout revocation for MVP memory store.
- Role-gated frontend routes.
- Secure workspace read and create routes.
- Tenant-scoped workspace data access.

### Route policy
- Older demo workspace and data routes are development-only.
- Production environment blocks legacy open route groups.
- Product flows should use secure routes.

### Account lifecycle
- Account challenge contracts for recovery and verification.
- Frontend AccountOps route.
- Backend contract tests.

### CORS
- Configurable CORS allowed origins.
- Production example lists app and admin domains.

### CI
- Added product-hardening workflow for backend tests and frontend build.

## Still MVP-only
- Challenge tokens are in memory; move to database before real production.
- Refresh token store is in memory; move to database or Redis before production.
- Email delivery is not yet connected to a provider.
- Identity provider callback route is not mounted due connector filter; readiness service exists.
- CORS origins must be set to real domains in production.
- JWT secret and encryption key must come from a managed secret store.

## Recommended next build
1. Database-backed token/challenge tables.
2. Email provider adapter with template rendering.
3. Identity provider callback route.
4. Tenant-scope enforcement for every remaining domain API.
5. Observability dashboard for auth events, failed attempts, and provider cost events.
