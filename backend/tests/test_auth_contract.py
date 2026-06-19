from uuid import uuid4
from fastapi.testclient import TestClient
from app.app_factory import create_app


def test_register_login_refresh_and_me_contract():
    client = TestClient(create_app())
    email = f"qa-{uuid4().hex[:8]}@example.test"
    payload = {
        "email": email,
        "full_name": "QA User",
        "role": "client_admin",
        "tenant_name": "QA Tenant",
        "tenant_region": "global",
        "password": "StrongPass123!"
    }
    register = client.post("/api/auth/register", json=payload)
    assert register.status_code == 200
    first = register.json()
    token = first["access_token"]
    refresh_token = first["refresh_token"]
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["user"]["email"] == email
    refreshed = client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
    assert refreshed.status_code == 200
    assert refreshed.json()["access_token"]
    login = client.post("/api/auth/login", json={"email": email, "password": "StrongPass123!"})
    assert login.status_code == 200
