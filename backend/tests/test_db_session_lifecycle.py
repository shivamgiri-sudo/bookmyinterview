from uuid import uuid4
from fastapi.testclient import TestClient
from app.app_factory import create_app
from app.db.session import SessionLocal, Base, engine
from app.services.db_lifecycle import create_session_grant


def test_db_session_grant_exchange_and_close():
    Base.metadata.create_all(bind=engine)
    client = TestClient(create_app())
    email = f"grant-{uuid4().hex[:8]}@example.test"
    registered = client.post("/api/auth/register", json={"email": email, "full_name": "Grant User", "role": "client_admin", "tenant_name": "Grant Tenant", "password": "StrongPass123!"})
    assert registered.status_code == 200
    user = registered.json()["user"]
    db = SessionLocal()
    try:
        grant = create_session_grant(db, email=email, role=user["role"], tenant_id=user["tenant_id"])
    finally:
        db.close()
    exchanged = client.post("/api/session-db/exchange", json={"value": grant})
    assert exchanged.status_code == 200
    access = exchanged.json()["access_token"]
    closed = client.post("/api/session-db/close", headers={"Authorization": f"Bearer {access}"}, json={"value": grant})
    assert closed.status_code == 200
    exchanged_again = client.post("/api/session-db/exchange", json={"value": grant})
    assert exchanged_again.status_code == 401
