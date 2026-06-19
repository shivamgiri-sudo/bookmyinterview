from app.app_factory import create_app

def test_app_factory_has_core_route_groups():
    app = create_app()
    paths = {route.path for route in app.routes}
    expected = [
        "/api/mcp/registry",
        "/api/data/tenants",
        "/api/billing/plans",
        "/api/consent/candidate",
        "/api/platform/events",
        "/api/review/queue",
        "/api/cost/providers",
        "/api/sso/options",
        "/api/protected-config/options",
        "/api/providers/adapters",
        "/api/workspace/overview",
        "/api/workspace/jobs",
        "/api/workspace/talent",
        "/api/workspace/assessments",
        "/api/secure/workspace/overview",
        "/api/secure/workspace/jobs",
        "/api/secure/workspace/talent",
        "/api/secure/workspace/assessments",
        "/api/insights/roles",
        "/api/templates/library",
        "/api/auth/register",
        "/api/auth/login",
        "/api/auth/me",
        "/api/auth/permission",
        "/api/auth/roles",
    ]
    missing = [path for path in expected if path not in paths]
    assert missing == []
