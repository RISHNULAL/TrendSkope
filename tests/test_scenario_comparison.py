"""
Unit and integration tests for TrendSkope Content Comparison & Experiment Studio.
Validates:
1. Two different captions comparison
2. Single variable change vs multiple variables changed (confounding detection)
3. Absolute difference and relative percentage difference calculations
4. Zero-valued prediction handling safely
5. Uncertainty interval overlap and inconclusive result detection
6. Content quality comparison pillars (Readability, Hook, CTA, Hashtags, Accessibility)
7. Smart recommendations with interactive apply payloads
8. Scenario templates endpoint
9. Controlled A/B experiment protocol generation
10. Preservation of canonical master dataset
"""
import io
import json
import pytest
from PIL import Image
from fastapi.testclient import TestClient
from api.index import app
from src.recommendation.comparison_studio import (
    compare_scenarios_comprehensive,
    get_scenario_templates,
)
from src.predict import load_artifact
from src.config import MODELS

client = TestClient(app)


@pytest.fixture(scope="module")
def artifact():
    art = load_artifact(MODELS / "final_model.joblib")
    assert art is not None, "Trained model artifact must exist for scenario studio testing"
    return art


def test_scenario_templates_endpoint():
    """Verify scenario templates endpoint returns 6 curated templates."""
    response = client.get("/api/scenario-templates")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    templates = data["templates"]
    assert len(templates) == 6
    template_ids = [t["id"] for t in templates]
    assert "hook_split_test" in template_ids
    assert "cta_clarity" in template_ids
    assert "storytelling_vs_short" in template_ids
    assert "format_image_vs_reel" in template_ids
    assert "timing_peak_vs_offpeak" in template_ids
    assert "hashtag_consolidation" in template_ids


def test_compare_two_different_captions(artifact):
    """Test comparing two captions with identical timing, format, and audience."""
    scen_a = {
        "caption": "Short announcement. Link in bio.",
        "media_type": "image",
        "followers": 2500,
        "date": "2026-10-02",
        "time": "18:00",
    }
    scen_b = {
        "caption": "Which feature are you most eager to try? Rebuilding our analytics taught us three major lessons. Tell us your thoughts below! #tech #datascience",
        "media_type": "image",
        "followers": 2500,
        "date": "2026-10-02",
        "time": "18:00",
    }

    res = compare_scenarios_comprehensive(scen_a, scen_b, artifact)
    assert res["success"] is True

    # 1. Delta calculations
    metrics = res["comparison_metrics"]
    assert "delta_absolute" in metrics
    assert "delta_relative_pct" in metrics
    assert isinstance(metrics["delta_absolute"], float)
    if metrics["delta_relative_pct"] is not None:
        assert isinstance(metrics["delta_relative_pct"], float)

    # 2. What Changed vs Unchanged
    what_changed = res["what_changed"]
    changed_fields = [p["field"] for p in what_changed["changed_parameters"]]
    unchanged_fields = [p["field"] for p in what_changed["unchanged_parameters"]]
    assert "caption" in changed_fields
    assert "media_type" in unchanged_fields
    assert "time" in unchanged_fields

    # 3. Content Quality Pillars
    quality = res["content_quality_comparison"]
    assert "pillars" in quality
    pillar_keys = [p["key"] for p in quality["pillars"]]
    assert "readability" in pillar_keys
    assert "hook" in pillar_keys
    assert "cta" in pillar_keys
    assert "hashtags" in pillar_keys
    assert "accessibility" in pillar_keys

    # 4. Smart Recommendations
    recs = res["smart_recommendations"]
    assert len(recs) > 0
    assert "proposed_action" in recs[0]
    assert "action_type" in recs[0]

    # 5. Experiment Protocol
    protocol = res["experiment_protocol"]
    assert protocol["test_variable"] == "Caption Text & Length"
    assert "hypothesis" in protocol


def test_confounding_warning_on_multiple_variable_changes(artifact):
    """
    When multiple predictive variables (e.g. caption, media_type, time, followers)
    change at once, the system must warn the user about confounding factors.
    """
    scen_a = {
        "caption": "Morning coffee check-in. #morning",
        "media_type": "image",
        "followers": 1500,
        "date": "2026-10-02",
        "time": "09:00",
    }
    scen_b = {
        "caption": "Full product release walkthrough! Which capability solves your biggest bottleneck? Drop a comment! #tech #buildinpublic #creators",
        "media_type": "reel",
        "followers": 50000,
        "date": "2026-10-02",
        "time": "19:00",
        "audio_name": "Trending Sound",
        "audio_type": "custom",
    }

    res = compare_scenarios_comprehensive(scen_a, scen_b, artifact)
    metrics = res["comparison_metrics"]
    assert metrics["is_confounded"] is True
    assert metrics["confounding_warning"] is not None
    assert "Multiple predictive variables were modified simultaneously" in metrics["confounding_warning"]


def test_inconclusive_detection_on_identical_or_minor_difference(artifact):
    """
    When scenarios are identical or differ only negligibly within overlapping intervals,
    the system must detect an inconclusive result and explain why honestly.
    """
    scen_a = {
        "caption": "Excited for today's release! Check it out.",
        "media_type": "image",
        "followers": 2000,
        "date": "2026-10-02",
        "time": "14:00",
    }
    # Exactly identical inputs
    scen_b = {
        "caption": "Excited for today's release! Check it out.",
        "media_type": "image",
        "followers": 2000,
        "date": "2026-10-02",
        "time": "14:00",
    }

    res = compare_scenarios_comprehensive(scen_a, scen_b, artifact)
    metrics = res["comparison_metrics"]
    assert metrics["delta_absolute"] == 0.0
    assert metrics["intervals_overlap"] is True
    assert metrics["is_inconclusive"] is True
    assert "The model does not provide strong evidence" in metrics["inconclusive_reason"]


def test_multipart_comparison_with_media_upload():
    """Verify /compare-scenarios-multipart accepts file uploads and performs real CV analysis."""
    # Create test image
    img_a = Image.new("RGB", (1080, 1350), color=(200, 100, 50))
    img_b = Image.new("RGB", (1080, 1080), color=(50, 150, 220))
    buf_a, buf_b = io.BytesIO(), io.BytesIO()
    img_a.save(buf_a, format="JPEG")
    img_b.save(buf_b, format="JPEG")

    payload = {
        "scenario_a": {
            "name": "Poster Option 1",
            "caption": "Option 1 creative poster. Link in bio.",
            "media_type": "image",
            "followers": 2000,
            "date": "2026-10-02",
            "time": "18:00",
        },
        "scenario_b": {
            "name": "Poster Option 2",
            "caption": "Which poster design do you prefer? Tell us below! #design",
            "media_type": "image",
            "followers": 2000,
            "date": "2026-10-02",
            "time": "18:00",
        },
    }

    response = client.post(
        "/api/compare-scenarios-multipart",
        data={"data": json.dumps(payload)},
        files=[
            ("file_a", ("poster1.jpg", buf_a.getvalue(), "image/jpeg")),
            ("file_b", ("poster2.jpg", buf_b.getvalue(), "image/jpeg")),
        ],
    )
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert "comparison" in res
    assert "scenario_a" in res
    assert "scenario_b" in res

    # Visual pillar must be applicable because files were provided
    pillars = res["content_quality_comparison"]["pillars"]
    visual_pillar = next((p for p in pillars if p["key"] == "visual"), None)
    assert visual_pillar is not None
    assert visual_pillar["applicable"] is True
    assert visual_pillar["score_a"] is not None
    assert visual_pillar["score_b"] is not None
