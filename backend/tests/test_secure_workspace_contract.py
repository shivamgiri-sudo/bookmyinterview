from uuid import uuid4
from fastapi.testclient import TestClient
from app.app_factory import create_app


def test_secure_workspace_requires_session_and_allows_registered_client():
    client = TestClient(create_app())
    locked = client.get("/api/secure/workspace/overview")
    assert locked.status_code == 401
    email = f"secure-{uuid4().hex[:8]}@example.test"
    registered = client.post("/api/auth/register", json={
        "email": email,
        "full_name": "Secure User",
        "role": "client_admin",
        "tenant_name": "Secure Tenant",
        "password": "StrongPass123!"
    })
    assert registered.status_code == 200
    token = registered.json()["access_token"]
    auth = {"Authorization": f"Bearer {token}"}
    opened = client.get("/api/secure/workspace/overview", headers=auth)
    assert opened.status_code == 200
    assert opened.json()["role"] == "client_admin"
    job = client.post("/api/secure/workspace/jobs", headers=auth, json={"designation": "Sales Manager", "location": "Dubai", "requirement": {"source": "test"}})
    assert job.status_code == 200
    assert job.json()["job_id"] > 0
    talent = client.post("/api/secure/workspace/talent", headers=auth, json={"full_name": "Secure Talent", "contact": f"talent-{uuid4().hex[:8]}@example.test", "location": "Remote", "consent_status": "granted"})
    assert talent.status_code == 200
    assert talent.json()["candidate_id"] > 0
