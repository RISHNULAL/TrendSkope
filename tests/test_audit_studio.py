"""
Unit and regression tests for the TrendSkope AI Content Audit, Scoring & Improvement Studio engine.
Verifies evidence-based scoring, category normalization, caption alternatives, drawbacks,
publishing-readiness checklist, and strict segregation of predictive engagement models.
"""
import pytest
from src.recommendation.audit_studio import compute_content_audit_studio


def test_audit_studio_overall_quality_scoring():
    # Context with image and caption
    media_analysis = {
        "available": True,
        "filename": "sample_post.jpg",
        "format": "JPEG",
        "dimensions": {
            "width": 1080,
            "height": 1350,
            "aspect_ratio": "4:5 (Portrait Feed)",
        },
        "visual_metrics": {
            "sharpness_var": 185.0,
            "sharpness_label": "Sharp / Standard Focus",
            "brightness_pct": 52.0,
            "brightness_label": "Balanced",
            "rms_contrast": 54.0,
            "contrast_label": "Moderate",
            "saturation_pct": 48.0,
            "saturation_label": "Balanced",
            "color_tone": "Warm Tone",
            "text_presence": "Likely Present",
            "dominant_colors": [
                {"hex": "#0B0F19", "percentage": 42.0},
                {"hex": "#FF6B4A", "percentage": 28.0},
            ],
        },
    }

    caption_analysis = {
        "metrics": {
            "characters": 180,
            "words": 32,
            "hashtags": 4,
            "uppercase_ratio": 0.05,
            "sentences": 3,
        },
        "structure": {
            "has_cta": True,
            "detected_ctas": ["let us know"],
            "has_question": True,
            "hashtag_density": "Focused (1–4)",
        },
    }

    context = {
        "media_type": "image",
        "caption": "Excited to launch our new AI model today on Oct 24th! What do you think of this breakthrough? Let us know below! #AI #Tech #Design #Startup",
        "category": "Technology & AI",
        "goal": "Engagement & Comments",
        "followers": 5000,
        "posting_hour": 19,
    }

    prediction_result = {
        "prediction": 4.25,
        "lower": 2.80,
        "upper": 5.70,
        "band": "High",
    }

    report = compute_content_audit_studio(
        prediction_result=prediction_result,
        caption_analysis=caption_analysis,
        media_analysis=media_analysis,
        audio_analysis=None,
        context=context,
    )

    # 1. Overall Quality
    oq = report["overall_quality"]
    assert 0 <= oq["score"] <= 100
    assert oq["band"] in ["Excellent", "Very good", "Good, with improvement opportunities", "Needs improvement", "Significant improvements recommended"]
    assert len(oq["contributing_categories"]) >= 3
    # Verify weights normalize properly
    assert sum(c["weight"] for c in oq["contributing_categories"]) > 0

    # 2. Image Audit
    ia = report["image_audit"]
    assert ia["evaluated"] is True
    assert len(ia["categories"]) == 8
    categories_found = {c["category"] for c in ia["categories"]}
    assert "Resolution & Format" in categories_found
    assert "Sharpness & Focus" in categories_found
    assert "Lighting & Exposure" in categories_found
    assert "Contrast & Separation" in categories_found

    # 3. Caption Audit
    ca = report["caption_audit"]
    assert ca["evaluated"] is True
    assert ca["overall_score"] is not None
    assert ca["hashtag_analysis"]["count"] == 4

    # 4. Caption Studio Alternatives
    cs = report["caption_studio"]
    assert len(cs["alternatives"]) == 3
    # Check that date entity 'Oct 24th' is preserved across alternatives
    for alt in cs["alternatives"]:
        assert len(alt["text"]) > 0
        assert alt["word_count"] > 0
        assert "Oct 24th" in alt["text"]

    # 5. Publishing Readiness Checklist
    pk = report["publishing_checklist"]
    assert len(pk["items"]) == 10
    summary = pk["summary"]
    assert summary["total"] == 10
    assert summary["passed"] >= 5
    assert summary["failed"] == 0

    # 6. Segregated Engagement Prediction
    sep = report["segregated_engagement_prediction"]
    assert sep["available"] is True
    assert sep["predicted_rate"] == 4.25
    assert "Engagement Rate %" in sep["target_definition"]
    assert "intentionally isolated" in sep["methodology_notice"]


def test_audit_studio_caption_only_mode():
    context = {
        "media_type": "image",
        "caption": "URGENT FLASH SALE: EVERYTHING 50% OFF UNTIL SUNDAY. HURRY UP AND BUY NOW. #SALE #DISCOUNT #CHEAP #BUY #NOW #DEAL #WEEKEND #PROMO #SHOP #STORE #FASHION #CLOTHES #OUTFIT #TREND",
        "category": "Promotion & Conversions",
        "goal": "Promotion & Conversions",
        "followers": 1200,
        "posting_hour": 14,
    }

    caption_analysis = {
        "metrics": {
            "characters": 160,
            "words": 28,
            "hashtags": 14,
            "uppercase_ratio": 0.85,
            "sentences": 3,
        },
        "structure": {
            "has_cta": False,
            "detected_ctas": [],
            "has_question": False,
            "hashtag_density": "Dense (11+)",
        },
    }

    report = compute_content_audit_studio(
        prediction_result={"prediction": 1.8, "band": "Low"},
        caption_analysis=caption_analysis,
        media_analysis=None,
        audio_analysis=None,
        context=context,
    )

    # Image audit should not be evaluated
    assert report["image_audit"]["evaluated"] is False
    assert report["image_audit"]["overall_score"] is None

    # Caption audit should detect issues
    ca = report["caption_audit"]
    assert ca["evaluated"] is True

    # Drawbacks should capture high uppercase and hashtag clutter
    drawbacks = report["drawbacks"]
    titles = [d["title"] for d in drawbacks]
    assert any("Uppercase" in t for t in titles)
    assert any("Hashtag" in t for t in titles)

    # 50% entity preserved in alternatives
    for alt in report["caption_studio"]["alternatives"]:
        assert "50%" in alt["text"]
