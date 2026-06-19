from app.services.message_delivery import DeliveryRequest, deliver_message


def test_delivery_contract_returns_mock_status():
    result = deliver_message(DeliveryRequest(recipient="account12345", template_key="account", subject="Subject", body="Body"))
    assert result["status"] == "queued_mock"
    assert result["provider"] == "mock"
    assert result["recipient"].endswith("***")
