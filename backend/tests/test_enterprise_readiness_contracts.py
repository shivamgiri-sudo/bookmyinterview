from app.services.sso_policy import list_sso_options, evaluate_sso_provider
from app.services.protected_config_policy import list_protection_options, evaluate_protection
from app.services.provider_catalog import readiness_summary


def test_sso_options_include_free_first_path():
    result = list_sso_options()
    keys = {item["key"] for item in result["providers"]}
    assert "keycloak" in keys
    assert "custom_jwt" in keys


def test_paid_sso_hold_when_cost_sensitive():
    result = evaluate_sso_provider({"provider_key": "okta", "enterprise_client": True, "cost_sensitive": True})
    assert result["allowed"] is False


def test_protection_blocks_local_env_for_production():
    result = evaluate_protection({"protection_key": "local_env", "production": True})
    assert result["allowed"] is False


def test_provider_catalog_has_free_fallbacks():
    result = readiness_summary()
    ready_keys = {item["key"] for item in result["ready_free_adapters"]}
    assert "mock_llm" in ready_keys
    assert "manual_resume" in ready_keys
