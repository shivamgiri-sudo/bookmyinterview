# API Route Mounting Checklist

The following enterprise API modules have been added and should be mounted in `backend/app/main.py`.

Already mounted:
- `app.api.routes` as `/api`
- `app.api.enterprise_mcp_routes` as `/api/mcp`
- `app.api.access_routes` as `/api/access`
- `app.api.data_routes` as `/api/data`

Add these imports:

```python
from app.api.billing_routes import billing_router
from app.api.compliance_routes import compliance_router
from app.api.consent_routes import consent_router
from app.api.event_routes import event_router
from app.api.review_routes import review_router
```

Add these router mounts:

```python
app.include_router(billing_router, prefix="/api/billing")
app.include_router(compliance_router, prefix="/api/compliance")
app.include_router(consent_router, prefix="/api/consent")
app.include_router(event_router, prefix="/api/platform")
app.include_router(review_router, prefix="/api/review")
```

New modules:
- `backend/app/api/billing_routes.py`
- `backend/app/api/compliance_routes.py`
- `backend/app/api/consent_routes.py`
- `backend/app/api/event_routes.py`
- `backend/app/api/review_routes.py`

Why not directly mounted in this pass:
- The connector blocked the large `main.py` patch multiple times due platform write filters around sensitive route names.
- The files are already present in the repo and ready to mount locally.

Recommended production cleanup:
- Split app factory into `backend/app/app_factory.py`.
- Register routes through a `register_routers(app)` function.
- Add smoke tests for `/openapi.json` and every router prefix.
