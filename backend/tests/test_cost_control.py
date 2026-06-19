from app.services.cost_control import list_provider_costs, evaluate_provider_enablement


def test_free_first_stack_exists():
    result = list_provider_costs()
    keys = {item["key"] for item in result["free_first_stack"]}
    assert "postgres" in keys
    assert "pgvector" in keys
    assert "local_mcp" in keys


def test_paid_provider_requires_superadmin_approval():
    result = evaluate_provider_enablement({"provider_key": "openai", "projected_monthly_usd": 20, "superadmin_approved": False})
    assert result["allowed"] is False
    assert result["decision"] == "hold_for_approval"


def test_paid_provider_allowed_after_approval():
    result = evaluate_provider_enablement({"provider_key": "openai", "projected_monthly_usd": 20, "superadmin_approved": True})
    assert result["allowed"] is True
    assert result["decision"] == "enable"
