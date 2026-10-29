"""
End-to-end API integration tests for Content Audit Studio endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from api.index import app


@pytest.fixture
def client():
    return TestClient(app)


def test_analyze_content_json_returns_audit_studio(client):
    payload = {
        "caption": "Our flagship AI model is officially live today on Oct 29th for $49/mo! What feature are you most excited to try? Let us know below! #AI #Tech #Design #Productivity",
        "media_type": "image",
        "followers": 10000,
        "date": "2026-10-29",
        "time": "19:00",
        "category": "Technology & AI",
        "goal": "Engagement & Comments",
    }

    response = client.post("/analyze-content-json", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True

    # Verify audit studio is present in the response
    assert "audit_studio" in data
    studio = data["audit_studio"]
    assert studio is not None

    # Overall Quality
    oq = studio["overall_quality"]
    assert 0 <= oq["score"] <= 100
    assert oq["band"] in ["Excellent", "Very good", "Good, with improvement opportunities", "Needs improvement", "Significant improvements recommended"]
    assert len(oq["contributing_categories"]) >= 1

    # Caption Studio
    cs = studio["caption_studio"]
    assert cs["evaluated"] is True
    assert len(cs["alternatives"]) == 3
    # Check that both entities ($49/mo and Oct 29th) are preserved in alternatives
    for alt in cs["alternatives"]:
        assert "$49/mo" in alt["text"]
        assert "Oct 29th" in alt["text"]

    # Publishing Checklist
    pc = studio["publishing_checklist"]
    assert pc["summary"]["total"] == 10
    assert len(pc["items"]) == 10

    # Segregated Engagement Prediction
    sep = studio["segregated_engagement_prediction"]
    assert "Engagement Rate %" in sep["target_definition"]
