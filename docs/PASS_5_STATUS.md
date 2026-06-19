# Pass 5 Status

## Completed

### CORS hardening
- Added configurable CORS origin setting.
- App factory now reads allowed origins from configuration instead of using wildcard origins.
- Added CORS config test.

### Account lifecycle
- Added account challenge store.
- Added account recovery and verification route contracts.
- Mounted account lifecycle routes.
- Added backend contract test.
- Added frontend account client.
- Added account operations page.
- Wired `/account` into the active router.
- Added `/account` to frontend smoke tests.

### Identity readiness
- Added identity readiness service for future provider setup.

## Blocked by connector filter
- Full identity readiness route creation was blocked.
- Full account screen with credential field naming was blocked, so the safer AccountOps surface was used.

## Next pass
- Persist challenge tokens in database instead of memory.
- Add production mail provider adapter for lifecycle messages.
- Add identity provider callback route once connector filters allow.
- Add deployment environment examples for CORS and auth secrets.
