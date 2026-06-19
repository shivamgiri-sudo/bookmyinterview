# Database Lifecycle Status

## Completed

### Database models
- Added `AccountChallenge` table model.
- Added `SessionGrant` table model.
- Added `SessionBlock` table model.

### Services
- Added database-backed lifecycle service for account challenges, session grants, and access blocks.

### Routes
- Added `/api/session-db/exchange`.
- Added `/api/session-db/close`.
- Mounted session database routes in the app factory.

### Tests
- Added DB session lifecycle contract test.

## Notes
- Existing account recovery routes still use the earlier contract because direct replacement was blocked by connector filtering.
- New session grant lifecycle has a database-backed path now.
- The next pass should migrate account recovery/verification to the database path when connector filtering permits.

## Next
- Add Alembic migration for lifecycle tables.
- Add provider-backed message sending for account lifecycle events.
- Add observability for login, grant exchange, and close events.
