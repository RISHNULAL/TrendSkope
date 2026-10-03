import io
from fastapi.testclient import TestClient
from api.index import app
from PIL import Image

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

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

def test_dashboard_endpoint():
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "model" in data
    assert "dataset" in data
    assert data["model"]["name"] == "Bayesian Ridge Regression"
    assert data["dataset"]["posts"] == 1000

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

def test_analyze_content_json():
    payload = {
        "caption": "Check out our new AI analytics suite! What feature do you want next? #ai #analytics",
        "media_type": "image",
        "followers": 5000,
        "date": "2026-10-02",
        "time": "19:30",
        "category": "Technology",
        "goal": "Engagement"
    }
    response = client.post("/api/analyze-content-json", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "prediction" in data
    assert "caption_analysis" in data
    assert "readiness" in data
    assert "signals" in data
    assert "recommendations" in data
    assert "what_if_scenarios" in data
    assert "limitations" in data

def test_analyze_content_with_image_upload():
    # Create a small in-memory test image
    img = Image.new("RGB", (1080, 1350), color=(255, 120, 60))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    files = {
        "file": ("test_post.jpg", buf.getvalue(), "image/jpeg")
    }
    data = {
        "caption": "Excited to share our portrait 4:5 launch post! #design #launch",
        "media_type": "image",
        "followers": "3200",
        "date": "2026-10-02",
        "time": "18:00",
        "category": "Design",
        "goal": "Awareness"
    }

    response = client.post("/api/analyze-content", files=files, data=data)
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert res["media_analysis"]["available"] is True
    assert "4:5" in res["media_analysis"]["dimensions"]["aspect_ratio"]
    assert res["caption_analysis"]["metrics"]["words"] > 0
    assert len(res["recommendations"]) >= 0
    assert len(res["signals"]["supportive"]) >= 0


def test_compare_scenarios_time_sensitivity():
    # Test 1: Image + same caption + 10:30 AM vs Image + same caption + 19:00 UTC
    payload = {
        "scenario_a": {
            "caption": "CyberPulse poster launch #tech #startup",
            "media_type": "image",
            "followers": 2500,
            "date": "2026-10-02",
            "time": "10:30",
        },
        "scenario_b": {
            "caption": "CyberPulse poster launch #tech #startup",
            "media_type": "image",
            "followers": 2500,
            "date": "2026-10-02",
            "time": "19:00",
        },
        "comparison_mode": "single",
    }
    response = client.post("/api/compare-scenarios", json=payload)
    assert response.status_code == 200
    comp = response.json()["comparison"]
    changed_fields = [c["field"] for c in comp["changed_parameters"]]
    assert "time" in changed_fields
    assert "caption" not in changed_fields
    assert "audio" not in changed_fields  # Audio is not applicable to Image posts


def test_compare_scenarios_caption_sensitivity():
    # Test 2: Image + Caption A + 10:30 AM vs Image + Caption B + 10:30 AM
    payload = {
        "scenario_a": {
            "caption": "Short announcement. Link in bio.",
            "media_type": "image",
            "followers": 2500,
            "date": "2026-10-02",
            "time": "10:30",
        },
        "scenario_b": {
            "caption": "✨ Revealing the full journey behind our newest release. Which feature are you most excited to try? Drop a comment below! 🔥 #innovation #buildinpublic #creative #community",
            "media_type": "image",
            "followers": 2500,
            "date": "2026-10-02",
            "time": "10:30",
        },
        "comparison_mode": "single",
    }
    response = client.post("/api/compare-scenarios", json=payload)
    assert response.status_code == 200
    comp = response.json()["comparison"]
    changed_fields = [c["field"] for c in comp["changed_parameters"]]
    assert "caption" in changed_fields
    assert "time" not in changed_fields
    assert "audio" not in changed_fields


def test_compare_scenarios_media_type():
    # Test 3: Image + Caption A vs Reel + Caption A + selected audio
    payload = {
        "scenario_a": {
            "caption": "Excited for launch day! #tech",
            "media_type": "image",
            "followers": 2500,
            "date": "2026-10-02",
            "time": "18:00",
        },
        "scenario_b": {
            "caption": "Excited for launch day! #tech",
            "media_type": "reel",
            "followers": 2500,
            "date": "2026-10-02",
            "time": "18:00",
            "audio_name": "Original Audio",
            "audio_type": "original",
        },
        "comparison_mode": "single",
    }
    response = client.post("/api/compare-scenarios", json=payload)
    assert response.status_code == 200
    comp = response.json()["comparison"]
    changed_fields = [c["field"] for c in comp["changed_parameters"]]
    assert "media_type" in changed_fields
    assert "audio" in changed_fields  # Audio changed from Not applicable to Original Audio


def test_compare_scenarios_reel_audio_no_fake_delta():
    # Test 4: Reel + Audio A vs Reel + Audio B
    # Verifies that audio differences are recognized in creative metadata,
    # but the model does not produce fake predictive delta since audio is not in the trained model
    payload = {
        "scenario_a": {
            "caption": "CyberPulse Reel #tech #innovation",
            "media_type": "reel",
            "followers": 2500,
            "date": "2026-10-02",
            "time": "19:00",
            "audio_name": "Original Audio Track",
            "audio_type": "original",
        },
        "scenario_b": {
            "caption": "CyberPulse Reel #tech #innovation",
            "media_type": "reel",
            "followers": 2500,
            "date": "2026-10-02",
            "time": "19:00",
            "audio_name": "Trending Instagram Sound",
            "audio_type": "custom",
        },
        "comparison_mode": "single",
    }
    response = client.post("/api/compare-scenarios", json=payload)
    assert response.status_code == 200
    comp = response.json()["comparison"]
    changed_fields = [c["field"] for c in comp["changed_parameters"]]
    assert "audio" in changed_fields
    # Since other trained features are identical, prediction delta should be 0.0 pp
    assert comp["delta_pp"] == 0.0
    assert comp["prediction_a"]["prediction"] == comp["prediction_b"]["prediction"]


def test_analyze_content_carousel_multislide():
    # Test Carousel with 3 slides
    img1 = Image.new("RGB", (1080, 1350), color=(255, 100, 50))
    img2 = Image.new("RGB", (1080, 1350), color=(50, 150, 250))
    img3 = Image.new("RGB", (1080, 1350), color=(100, 200, 100))
    
    b1, b2, b3 = io.BytesIO(), io.BytesIO(), io.BytesIO()
    img1.save(b1, format="JPEG")
    img2.save(b2, format="JPEG")
    img3.save(b3, format="JPEG")
    
    files = [
        ("files", ("slide1.jpg", b1.getvalue(), "image/jpeg")),
        ("files", ("slide2.jpg", b2.getvalue(), "image/jpeg")),
        ("files", ("slide3.jpg", b3.getvalue(), "image/jpeg")),
    ]
    data = {
        "caption": "Step 1 to 3 Guide on AI Models! Swipe through -> #ai #guide",
        "media_type": "carousel",
        "followers": "4000",
        "date": "2026-10-02",
        "time": "19:00",
        "category": "Education & How-To",
        "goal": "Educational Value / Saves",
    }
    
    response = client.post("/api/analyze-content", files=files, data=data)
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert res["media_analysis"]["available"] is True
    assert res["media_analysis"]["slide_count"] == 3
    assert len(res["media_analysis"]["slides"]) == 3
    assert res["media_analysis"]["slides"][0]["is_first_slide"] is True
    assert res["prediction"]["available"] is True



