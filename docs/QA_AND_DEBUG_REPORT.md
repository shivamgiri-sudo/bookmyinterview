# QA and Debug Report

## Issues Found and Fixed

### 1. Backend route mounting gap
Problem: New enterprise routers were added but not all were mounted in `main.py`.
Fix: Added `backend/app/app_factory.py` and switched `backend/app/main.py` to use `create_app()`.
Impact: All route groups can now be registered centrally.

### 2. Missing automated backend test workflow
Problem: Existing CI compiled backend code but did not run tests.
Fix: Added `.github/workflows/backend-tests.yml`.
Impact: Backend tests will run on push and pull request.

### 3. Missing route smoke test
Problem: No test confirmed that enterprise route groups were mounted.
Fix: Added `backend/tests/test_app_factory_routes.py`.
Impact: CI can catch broken route registration.

### 4. UI lacked global enterprise command view
Problem: The interface had strong pages but no founder/global operating view.
Fix: Added `frontend/src/GlobalCommandCenter.jsx` and `frontend/src/global.css`, then wired `/global` into navigation.
Impact: Product now has a premium global HQ view for launch readiness, compliance, revenue, regions, and enterprise signals.

## Known Remaining Issues

### 1. Alembic env upload blocked by connector filter
`backend/alembic.ini` and SQL bootstrap exist, but `backend/alembic/env.py` upload was blocked multiple times by the connector safety filter. Local developer should add the standard Alembic env file from SQLAlchemy metadata.

### 2. GitHub workflow status not available yet
After pushing, no workflow run/status was returned for the latest commit through the connector. This means CI was configured, but I cannot honestly claim it has passed yet.

### 3. Integration Vault persistence still needs production KMS/Vault implementation
Credential contracts and security helpers exist, but production storage must use AWS KMS, GCP KMS, Azure Key Vault, or HashiCorp Vault.

## Next Debug Pass
- Run backend tests in GitHub Actions.
- Run frontend production build.
- Convert SQL bootstrap into Alembic revision.
- Add API integration tests using FastAPI TestClient.
- Add Playwright frontend smoke tests for `/`, `/global`, `/intake`, `/assessment`, `/superadmin`.
