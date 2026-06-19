from app.services.billing import list_plans, estimate_invoice
from app.services.global_policy_engine import evaluate_global_policy

def test_global_plans_available():
    result = list_plans("us")
    assert result["currency"] == "USD"
    assert len(result["plans"]) >= 3

def test_invoice_estimate_returns_total():
    result = estimate_invoice("growth", jobs=60, assessments=2500, region="eu")
    assert result["estimated_total_usd"] > 0
    assert result["currency"] == "EUR"

def test_global_policy_allows_consented_internal_action():
    result = evaluate_global_policy({"region": "global", "consent_status": "granted", "source_type": "internal"})
    assert result["decision"] == "allow_with_controls"
