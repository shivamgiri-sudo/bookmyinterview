# Authentication and RBAC Status

## Completed

### Backend
- Added `backend/app/api/auth_routes.py`.
- Mounted the router under `/api/auth`.
- Added register, login, me, permission, and roles endpoints.
- Uses existing password hashing, JWT creation, and role-permission logic from `app/core/security.py`.
- Adds audit logs for registration and login.

### Frontend
- Added `frontend/src/authClient.js`.
- Added `frontend/src/AuthPage.jsx`.
- Updated `frontend/src/RouterNext.jsx` to use session state and role gates.
- Added `/login` route.
- Protected workspace pages now require a saved session.

### Tests
- Added auth routes to backend smoke test.
- Added `backend/tests/test_auth_contract.py`.
- Updated frontend smoke test to seed a superadmin session before visiting protected pages.

## Roles
- superadmin
- platform_admin
- client_admin
- hiring_manager
- candidate
- auditor

## Production still required
- Replace local JWT secret with managed secret.
- Add refresh token / session revocation.
- Add password reset and email verification.
- Add SSO provider such as Keycloak, Clerk, Auth0, or Okta.
- Add tenant-scoped middleware enforcement on every API route.
- Harden CORS for production domains only.
