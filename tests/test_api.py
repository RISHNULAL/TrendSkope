from fastapi.testclient import TestClient
from api.index import app

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "TrendSkope API"}

def test_model_status_untrained():
    response = client.get("/api/model-status")
    assert response.status_code == 200
    data = response.json()
    assert "trained" in data

def test_insights_endpoint():
    response = client.get("/api/insights")
    assert response.status_code == 200
    data = response.json()
    assert "available" in data

def test_template_download():
    response = client.get("/api/template")
    assert response.status_code == 200
    assert "post_id" in response.text

def test_predict_endpoint():
    payload = {
        "caption": "Excited for the big launch! #build #tech",
        "media_type": "image",
        "followers_at_or_near_collection": 2500,
        "published_at": "2025-01-20T19:00:00Z"
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "prediction" in data["result"]
    assert "lower" in data["result"]
    assert "upper" in data["result"]
    assert "band" in data["result"]
