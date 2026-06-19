from app.services.global_policy_engine import evaluate_global_policy

def test_eu_policy_blocks_without_consent():
    result = evaluate_global_policy({"region": "eu", "consent_status": "unknown", "action": "assessment"})
    assert result["allowed"] is False
    assert "collect_consent" in result["required_actions"]

def test_web_data_requires_source_approval():
    result = evaluate_global_policy({"region": "global", "consent_status": "granted", "source_type": "web_data", "source_approved": False})
    assert result["decision"] == "block"
    assert "source_approval" in result["required_actions"]

def test_rejection_requires_human_review_control():
    result = evaluate_global_policy({"region": "us", "consent_status": "granted", "decision": "reject"})
    assert result["allowed"] is True
    assert "human_review" in result["required_actions"]
