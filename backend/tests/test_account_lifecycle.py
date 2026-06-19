from uuid import uuid4
from fastapi.testclient import TestClient
from app.app_factory import create_app


def test_account_recovery_and_verify_contract():
    client = TestClient(create_app())
    email = f"life-{uuid4().hex[:8]}@example.test"
    registered = client.post("/api/auth/register", json={"email": email, "full_name": "Life User", "role": "client_admin", "tenant_name": "Life Tenant", "password": "StrongPass123!"})
    assert registered.status_code == 200
    start = client.post("/api/account/recovery/start", json={"email": email})
    assert start.status_code == 200
    challenge = start.json()["challenge"]
    done = client.post("/api/account/recovery/complete", json={"challenge": challenge, "new_password": "NewStrongPass123!"})
    assert done.status_code == 200
    login = client.post("/api/auth/login", json={"email": email, "password": "NewStrongPass123!"})
    assert login.status_code == 200
    verify_start = client.post("/api/account/verify/start", json={"email": email})
    assert verify_start.status_code == 200
    verify_done = client.post("/api/account/verify/complete", json={"challenge": verify_start.json()["challenge"]})
    assert verify_done.status_code == 200
