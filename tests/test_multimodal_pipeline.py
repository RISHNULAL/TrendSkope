"""
Automated unit and integration test suite for TrendSkope Multimodal Media Dataset Expansion.
Covers:
- Physical media directory structure and 96 real media files
- Metadata schemas, stable post-to-asset linking, and URI resolution
- Real image computer vision analysis (Laplacian sharpness, dominant colors, contrast)
- Real video frame sampling, motion intensity, and scene-change detection via OpenCV
- Real carousel slide ordering, cross-slide consistency, and cover hook quality
- Real audio acoustic feature extraction (tempo BPM, RMS loudness, duration alignment)
- Missing-modality handling and explicit presence indicators
- Multimodal machine learning inference and prediction consistency
- API endpoints: /api/media-summary, /api/dashboard, /api/analyze-content
- Preservation of text-only baseline prediction functionality
"""
from __future__ import annotations

import io
from pathlib import Path
import numpy as np
import pandas as pd
import pytest
from fastapi.testclient import TestClient

from api.index import app, get_model_artifact, get_multimodal_artifact
from src.config import (
    AUDIO_FEATURES_CSV,
    CAROUSEL_SLIDES_CSV,
    DATA_RAW,
    MEDIA_ANALYSIS_CSV,
    MEDIA_ASSETS_CSV,
    MEDIA_AUDIO,
    MEDIA_CAROUSEL,
    MEDIA_IMAGES,
    MEDIA_QUALITY_REPORT,
    MEDIA_VIDEOS,
    MODELS,
    MULTIMODAL_FEATURES_PARQUET,
    ROOT,
)
from src.media_analysis import (
    analyze_audio_bytes,
    analyze_audio_metadata,
    analyze_carousel_images,
    analyze_image_bytes,
    analyze_video_bytes,
)
from src.predict import predict_one

client = TestClient(app)


def test_media_assets_directory_and_files_exist():
    """Verify all 4 media directories and 96 physical media files exist on disk with non-zero size."""
    for d in [MEDIA_IMAGES, MEDIA_VIDEOS, MEDIA_CAROUSEL, MEDIA_AUDIO]:
        assert d.exists(), f"Directory missing: {d}"

    images = list(MEDIA_IMAGES.glob("*.jpg"))
    videos = list(MEDIA_VIDEOS.glob("*.mp4"))
    carousel_slides = list(MEDIA_CAROUSEL.glob("*.jpg"))
    audio_files = list(MEDIA_AUDIO.glob("*.wav"))

    assert len(images) == 24, f"Expected 24 image files, found {len(images)}"
    assert len(videos) == 12, f"Expected 12 video files, found {len(videos)}"
    assert len(carousel_slides) == 48, f"Expected 48 carousel slides, found {len(carousel_slides)}"
    assert len(audio_files) == 12, f"Expected 12 audio files, found {len(audio_files)}"

    total_files = len(images) + len(videos) + len(carousel_slides) + len(audio_files)
    assert total_files == 96, f"Expected 96 total media files, found {total_files}"

    for f in images + videos + carousel_slides + audio_files:
        assert f.stat().st_size > 1024, f"File {f.name} is too small or corrupted"


def test_media_metadata_schemas_and_integrity():
    """Verify metadata CSVs conform to schema, have zero duplicate IDs, and resolve to real files."""
    assert MEDIA_ASSETS_CSV.exists()
    assert CAROUSEL_SLIDES_CSV.exists()
    assert AUDIO_FEATURES_CSV.exists()
    assert MEDIA_ANALYSIS_CSV.exists()

    df_assets = pd.read_csv(MEDIA_ASSETS_CSV)
    required_asset_cols = [
        "asset_id", "post_id", "account_id", "media_type", "asset_uri",
        "asset_status", "mime_type", "file_size_bytes", "width", "height",
        "duration_seconds", "carousel_id", "carousel_position", "audio_asset_id",
        "source_type", "license_status", "analysis_status", "created_at"
    ]
    for col in required_asset_cols:
        assert col in df_assets.columns, f"Missing column {col} in media_assets.csv"

    assert len(df_assets) >= 5000, f"Expected >= 5000 rows in media_assets.csv, got {len(df_assets)}"
    assert df_assets["asset_id"].nunique() == len(df_assets), "Duplicate asset_ids found in media_assets.csv"

    # Verify physical media asset_uris resolve to existing files on disk (96 physical assets)
    physical_assets = df_assets[df_assets["source_type"].isin(["procedural_synthesis", "physical_media_extracted"])]
    assert len(physical_assets) == 96, f"Expected 96 physical media assets, found {len(physical_assets)}"
    for _, row in physical_assets.iterrows():
        resolved_path = ROOT / row["asset_uri"]
        assert resolved_path.exists(), f"Physical asset URI does not resolve: {resolved_path}"

    # Verify carousel slides ordering and record count (>= 5,000 slides, 1 row per slide)
    df_slides = pd.read_csv(CAROUSEL_SLIDES_CSV)
    assert len(df_slides) >= 5000, f"Expected >= 5000 slides in carousel_slides.csv, got {len(df_slides)}"
    assert set(df_slides["slide_position"].unique()) == {1, 2, 3, 4}

    # Verify audio features (>= 5,000 audio assets)
    df_audio = pd.read_csv(AUDIO_FEATURES_CSV)
    assert len(df_audio) >= 5000, f"Expected >= 5000 audio rows in audio_features.csv, got {len(df_audio)}"
    assert (df_audio["duration_seconds"] > 0).all()
    assert (df_audio["tempo_bpm"] > 0).all()


def test_image_analyzer_computer_vision_metrics():
    """Test actual image analysis pipeline on a physical image asset."""
    sample_img = list(MEDIA_IMAGES.glob("*.jpg"))[0]
    with open(sample_img, "rb") as f:
        img_bytes = f.read()

    res = analyze_image_bytes(img_bytes, filename=sample_img.name)
    assert res["available"] is True
    assert res["media_category"] == "image"
    assert res["dimensions"]["width"] > 0
    assert res["dimensions"]["height"] > 0
    assert "aspect_ratio" in res["dimensions"]

    vm = res["visual_metrics"]
    assert 0.0 <= vm["brightness_pct"] <= 100.0
    assert vm["rms_contrast"] > 0.0
    assert vm["sharpness_var"] >= 0.0
    assert "sharpness_label" in vm
    assert "overall_quality_score" in vm

    # Dominant colors
    assert "dominant_colors" in res
    assert len(res["dominant_colors"]) >= 2
    for c in res["dominant_colors"]:
        assert c["hex"].startswith("#")
        assert len(c["rgb"]) == 3
        assert 0.0 <= c["percentage"] <= 100.0


def test_video_analyzer_frame_sampling_and_motion():
    """Test actual video analysis pipeline on a physical MP4 asset using OpenCV."""
    sample_vid = list(MEDIA_VIDEOS.glob("*.mp4"))[0]
    with open(sample_vid, "rb") as f:
        vid_bytes = f.read()

    res = analyze_video_bytes(vid_bytes, filename=sample_vid.name)
    assert res["available"] is True
    assert res["media_category"] == "reel"
    assert res["duration"]["seconds"] > 0.5
    assert res["dimensions"]["width"] == 720
    assert res["dimensions"]["height"] == 1280
    assert "9:16" in res["dimensions"]["aspect_ratio"]
    assert res["sampled_frames_count"] > 0
    assert "motion" in res
    assert res["motion"]["score"] >= 0.0
    assert "scene_structure" in res
    assert "hook_analysis" in res


def test_carousel_analyzer_consistency():
    """Test carousel pipeline with ordered slides and visual consistency."""
    sample_slides = sorted(list(MEDIA_CAROUSEL.glob("carousel_tech_*.jpg")))[:4]
    slides_data = []
    for s in sample_slides:
        with open(s, "rb") as f:
            slides_data.append((f.read(), s.name))

    res = analyze_carousel_images(slides_data)
    assert res["available"] is True
    assert res["slide_count"] == 4
    assert len(res["slides"]) == 4
    assert res["slides"][0]["is_first_slide"] is True
    assert res["slides"][0]["slide_index"] == 1
    assert "visual_consistency" in res
    assert "exposure_std_dev" in res["visual_consistency"]


def test_audio_analyzer_acoustic_signals():
    """Test audio analysis pipeline extracting tempo, loudness, and duration alignment."""
    sample_aud = list(MEDIA_AUDIO.glob("*.wav"))[0]
    with open(sample_aud, "rb") as f:
        aud_bytes = f.read()

    res = analyze_audio_bytes(aud_bytes, filename=sample_aud.name, video_duration_sec=5.5)
    assert res["available"] is True
    assert res["duration_seconds"] > 0.0
    assert res["channels"] == 2
    assert res["sample_rate_hz"] == 44100
    assert res["loudness_dbfs"] < 0.0
    assert res["estimated_bpm"] > 0.0
    assert "alignment_with_video" in res
    assert "Suggested audio style — not verified as currently trending" in res["trend_status"]["explanation"]


def test_multimodal_dataset_parquet_and_missing_modality_handling():
    """Verify parquet multimodal dataset contains 15,000 records with explicit modality indicators."""
    assert MULTIMODAL_FEATURES_PARQUET.exists()
    df = pd.read_parquet(MULTIMODAL_FEATURES_PARQUET)
    assert len(df) == 15000
    assert "has_media" in df.columns
    assert "has_text" in df.columns
    assert "audio_present" in df.columns
    assert "overall_quality" in df.columns
    assert "motion_intensity" in df.columns

    # Check that 5,000 posts have media and 10,000 are tabular-only
    non_media = df[df["has_media"] == 0]
    assert len(non_media) == 10000
    media_posts = df[df["has_media"] == 1]
    assert len(media_posts) == 5000


def test_multimodal_model_inference_consistency():
    """Verify multimodal model can predict on both text-only posts and multimodal posts."""
    artifact = get_multimodal_artifact()
    assert artifact is not None, "multimodal_model.joblib not found"

    # 1. Text-only post
    post_text_only = {
        "caption": "Exploring new scalable database indexing strategies today! What is your favorite pattern? #tech #database",
        "media_type": "image",
        "followers_at_or_near_collection": 5000,
        "published_at": "2026-10-15T19:00:00Z",
    }
    pred_text = predict_one(artifact, post_text_only)
    assert "prediction" in pred_text
    assert pred_text["prediction"] > 0.0
    assert pred_text["modalities_used"]["text"] is True
    assert pred_text["modalities_used"]["media_visual"] is False

    # 2. Multimodal post with media features
    media_feat = {
        "has_media": 1,
        "brightness_pct": 52.0,
        "rms_contrast": 58.0,
        "saturation_pct": 60.0,
        "sharpness_var": 180.0,
        "overall_quality": 85.0,
        "motion_intensity": 25.0,
        "scene_change_count": 2,
        "audio_bpm": 120.0,
        "audio_loudness_db": -14.0,
        "carousel_slide_count": 1,
        "audio_present": 1,
    }
    pred_multi = predict_one(artifact, post_text_only, media_features=media_feat)
    assert "prediction" in pred_multi
    assert pred_multi["prediction"] > 0.0
    assert pred_multi["modalities_used"]["media_visual"] is True
    assert pred_multi["modalities_used"]["audio"] is True


def test_api_media_summary_endpoint():
    """Test GET /api/media-summary returns verified counts matching physical storage."""
    resp = client.get("/api/media-summary")
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["master_posts_total"] == 15000
    assert data["media_assets_total"] >= 5000
    assert data["physical_media_assets"] == 96
    assert data["asset_breakdown"]["image_assets"] >= 24
    assert data["asset_breakdown"]["video_assets"] >= 12
    assert data["asset_breakdown"]["carousel_posts"] >= 12
    assert data["asset_breakdown"]["carousel_slides"] >= 5000
    assert data["asset_breakdown"]["audio_assets"] >= 5000
    assert data["analysis_status"]["analyzed_successfully"] >= 5000
    assert data["analysis_status"]["failed"] == 0
    assert data["analysis_status"]["missing_file_references"] == 0


def test_api_dashboard_includes_media_summary():
    """Test GET /api/dashboard contains both canonical dataset and media_dataset breakdown."""
    resp = client.get("/api/dashboard")
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert "dataset" in data
    assert data["dataset"]["posts"] == 15000

    assert "media_dataset" in data
    media_summary = data["media_dataset"]
    assert media_summary["available"] is True
    assert media_summary["master_posts"] == 15000
    assert media_summary["total_media_assets"] >= 5000
    assert media_summary["image_assets"] >= 24
    assert media_summary["video_assets"] >= 12
    assert media_summary["carousel_posts"] >= 12
    assert media_summary["carousel_slides"] >= 5000
    assert media_summary["audio_assets"] >= 5000
    assert media_summary["analyzed_successfully"] >= 5000


def test_api_analyze_content_with_image_upload():
    """Test POST /api/analyze-content with an actual image upload."""
    sample_img = list(MEDIA_IMAGES.glob("*.jpg"))[0]
    with open(sample_img, "rb") as f:
        file_bytes = f.read()

    files = {"file": (sample_img.name, file_bytes, "image/jpeg")}
    data = {
        "caption": "Deep dive into distributed systems caching! What do you think? #tech #backend",
        "media_type": "image",
        "followers": "5000",
        "category": "Technology & AI",
        "goal": "Engagement",
    }
    resp = client.post("/api/analyze-content", data=data, files=files)
    assert resp.status_code == 200
    res = resp.json()
    assert res["success"] is True
    assert res["prediction"]["available"] is True
    assert res["prediction"]["expected_engagement_rate"] > 0.0
    assert res["media_analysis"]["available"] is True
    assert res["media_analysis"]["dimensions"]["width"] > 0
    assert "dominant_colors" in res["media_analysis"]
    assert len(res["recommendations"]) > 0


def test_api_analyze_content_with_carousel_upload():
    """Test POST /api/analyze-content with multiple carousel slides."""
    slides = sorted(list(MEDIA_CAROUSEL.glob("carousel_tech_*.jpg")))[:3]
    files = []
    for s in slides:
        with open(s, "rb") as f:
            files.append(("files", (s.name, f.read(), "image/jpeg")))

    data = {
        "caption": "3-step guide to database sharding! Save this carousel for reference. #database #tech",
        "media_type": "carousel",
        "followers": "10000",
        "category": "Technology & AI",
    }
    resp = client.post("/api/analyze-content", data=data, files=files)
    assert resp.status_code == 200
    res = resp.json()
    assert res["success"] is True
    assert res["media_analysis"]["available"] is True
    assert res["media_analysis"]["slide_count"] == 3
    assert "visual_consistency" in res["media_analysis"]


def test_api_analyze_content_with_video_upload():
    """Test POST /api/analyze-content with a real MP4 video upload."""
    sample_vid = list(MEDIA_VIDEOS.glob("*.mp4"))[0]
    with open(sample_vid, "rb") as f:
        vid_bytes = f.read()

    files = {"file": (sample_vid.name, vid_bytes, "video/mp4")}
    data = {
        "caption": "Quick 5-second breakdown of system throughput bottlenecks! #shorts #tech",
        "media_type": "reel",
        "followers": "8000",
        "category": "Technology & AI",
    }
    resp = client.post("/api/analyze-content", data=data, files=files)
    assert resp.status_code == 200
    res = resp.json()
    assert res["success"] is True
    assert res["media_analysis"]["available"] is True
    assert res["media_analysis"]["duration"]["seconds"] > 0.5
    assert "motion" in res["media_analysis"]
