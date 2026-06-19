from app.services.enterprise_mcp import jd_intelligence, candidate_matching, compliance_check

def test_jd_intelligence_returns_readiness():
    result = jd_intelligence({"company_name": "Global Co", "designation": "Sales Manager", "location": "Remote", "must_have_skills": ["sales", "crm"]})
    assert result["mcp_server"] == "jd_intelligence_mcp"
    assert "readiness_score" in result["result"]

def test_candidate_matching_shortlist_or_review():
    result = candidate_matching({
        "job": {"designation": "Sales Manager", "must_have_skills": ["sales", "crm"], "min_experience_years": 3, "location": "Remote"},
        "candidate": {"name": "Candidate", "skills": ["sales", "crm"], "experience_years": 4, "notice_period": "30 days", "location": "Remote"}
    })
    assert result["result"]["match_score"] >= 75
    assert result["result"]["recommendation"] == "Shortlist"

def test_compliance_blocks_unapproved_web_data():
    result = compliance_check({"action": "enrich_candidate", "source_type": "web_data", "source_approved": False, "consent_status": "unknown"})
    assert result["result"]["allowed"] is False
    assert result["result"]["decision"] == "block"
