# Observability Pass Status

## Completed

### Backend
- Added operations metrics API.
- Mounted metrics route under `/api/ops-metrics`.
- Added DB lifecycle migration script.
- Added metrics contract test.

### Frontend
- Added OpsMonitor page.
- Wired `/monitor` into RouterNext.
- Added `/monitor` to frontend smoke tests.

### Lifecycle hardening
- DB lifecycle models exist for account challenges, session grants, and session blocks.
- DB session lifecycle routes exist for exchange and close.
- Message delivery adapter contract exists for future provider integration.

## Next recommended build
- Protect `/api/ops-metrics` behind role/capability checks.
- Persist account recovery/verification fully through DB-backed challenge service when connector filter allows.
- Add real provider delivery for account lifecycle messages.
- Add Prometheus/OpenTelemetry exporter.
- Add dashboard filters by tenant, actor role, event action, and risk level.
