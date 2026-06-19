from uuid import uuid4
from fastapi.testclient import TestClient
from app.app_factory import create_app


def test_ops_metrics_requires_audit_permission_and_supports_filters_presets_rules_and_export():
    client = TestClient(create_app())
    locked = client.get("/api/ops-metrics/summary")
    assert locked.status_code == 401
    email = f"audit-{uuid4().hex[:8]}@example.test"
    registered = client.post("/api/auth/register", json={"email": email, "full_name": "Audit User", "role": "auditor", "password": "StrongPass123!"})
    assert registered.status_code == 200
    token = registered.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/ops-metrics/summary?days=7&risk=high", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "auditor"
    assert data["filters"]["days"] == 7
    assert data["filters"]["risk"] == "high"
    assert "alerts" in data
    assert "presets" in data
    assert "alert_rules" in data
    assert "latest_events" in data
    presets = client.get("/api/ops-metrics/presets", headers=headers)
    assert presets.status_code == 200
    assert len(presets.json()["presets"]) >= 1
    export = client.get("/api/ops-metrics/export?days=7", headers=headers)
    assert export.status_code == 200
    assert "id,tenant_id,actor_id" in export.text
