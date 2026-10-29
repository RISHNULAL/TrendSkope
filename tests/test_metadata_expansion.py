"""
Tests verifying the expansion and integrity of TrendSkope metadata and multimodal datasets.

Requirements:
- Canonical master dataset unchanged (SHA-256 verified).
- media_assets.csv >= 5,000 rows, 100% unique asset_ids, 96 physical assets exist on disk.
- carousel_slides.csv >= 5,000 rows (1 row per slide), unique slide asset_ids.
- audio_features.csv >= 5,000 rows, unique audio_ids, valid tempos and loudness.
- media_analysis.csv >= 5,000 rows, unique post_ids, bounded photometrics.
- multimodal_features.csv: 15,000 rows with exactly 5,000 media-linked observations.
"""
import hashlib
from pathlib import Path
import pandas as pd
import pytest

ROOT = Path(__file__).resolve().parent.parent
MASTER_CSV = ROOT / "data" / "raw" / "instagram_posts_1000.csv"
EXPECTED_MASTER_SHA256 = "d6eb91540b3528c9d2b4e303da74cf7a49eed5f44cd014d10526e256049da292"

MEDIA_ASSETS_CSV = ROOT / "data" / "metadata" / "media_assets.csv"
CAROUSEL_SLIDES_CSV = ROOT / "data" / "metadata" / "carousel_slides.csv"
AUDIO_FEATURES_CSV = ROOT / "data" / "metadata" / "audio_features.csv"
MEDIA_ANALYSIS_CSV = ROOT / "data" / "metadata" / "media_analysis.csv"
MULTIMODAL_CSV = ROOT / "data" / "processed" / "multimodal_features.csv"


def test_master_dataset_sha256_unmodified():
    """Verify master 15,000-post dataset has not been modified."""
    assert MASTER_CSV.exists(), "Master dataset missing!"
    h = hashlib.sha256(MASTER_CSV.read_bytes()).hexdigest()
    assert h == EXPECTED_MASTER_SHA256, f"Master hash changed: {h} != {EXPECTED_MASTER_SHA256}"


def test_media_assets_expansion_and_integrity():
    """Verify media_assets.csv has >= 5,000 rows, unique PKs, and physical media links."""
    assert MEDIA_ASSETS_CSV.exists()
    df = pd.read_csv(MEDIA_ASSETS_CSV)
    assert len(df) >= 5000, f"Expected >= 5000 rows, got {len(df)}"
    assert df["asset_id"].nunique() == len(df), "Duplicate asset_ids in media_assets.csv"

    # Exactly 96 physical media assets
    phys = df[df["source_type"].isin(["procedural_synthesis", "physical_media_extracted"])]
    assert len(phys) == 96, f"Expected 96 physical assets, got {len(phys)}"
    for _, row in phys.iterrows():
        assert (ROOT / row["asset_uri"]).exists(), f"Physical media missing: {row['asset_uri']}"

    # Synthetic assets honestly marked
    synth = df[df["source_type"] == "synthetic_simulation"]
    assert len(synth) >= 4904
    assert (synth["asset_status"] == "cataloged_synthetic").all()


def test_carousel_slides_granularity_and_expansion():
    """Verify carousel_slides.csv has >= 5,000 rows (1 row per slide, not per carousel)."""
    assert CAROUSEL_SLIDES_CSV.exists()
    df = pd.read_csv(CAROUSEL_SLIDES_CSV)
    assert len(df) >= 5000, f"Expected >= 5000 slides, got {len(df)}"
    assert df["asset_id"].nunique() == len(df), "Duplicate asset_ids in carousel_slides.csv"

    # Slides should be grouped by carousel_id with 4 slides each
    unique_carousels = df["carousel_id"].nunique()
    assert unique_carousels >= 1250, f"Expected >= 1250 unique carousels, got {unique_carousels}"

    # Verify positions
    assert set(df["slide_position"].unique()) == {1, 2, 3, 4}

    # Verify photometrics ranges
    assert df["brightness"].between(0, 100).all()
    assert (df["contrast"] >= 0).all()
    assert (df["sharpness"] >= 0).all()


def test_audio_features_expansion_and_ranges():
    """Verify audio_features.csv has >= 5,000 rows with bounded acoustics."""
    assert AUDIO_FEATURES_CSV.exists()
    df = pd.read_csv(AUDIO_FEATURES_CSV)
    assert len(df) >= 5000, f"Expected >= 5000 rows, got {len(df)}"
    assert df["audio_id"].nunique() == len(df), "Duplicate audio_ids in audio_features.csv"

    # Verify acoustic ranges
    assert df["tempo_bpm"].between(40, 240).all()
    assert (df["duration_seconds"] > 0).all()
    assert (df["sample_rate"] == 44100).all()
    assert (df["channels"] == 2).all()


def test_media_analysis_expansion_and_uniqueness():
    """Verify media_analysis.csv has >= 5,000 post-level analyses with unique post_ids."""
    assert MEDIA_ANALYSIS_CSV.exists()
    df = pd.read_csv(MEDIA_ANALYSIS_CSV)
    assert len(df) >= 5000, f"Expected >= 5000 rows, got {len(df)}"
    assert df["post_id"].nunique() == len(df), "Duplicate post_ids in media_analysis.csv"

    # Bounded visual metrics
    assert df["brightness_pct"].between(0, 100).all()
    assert (df["rms_contrast"] >= 0).all()
    assert (df["sharpness_var"] >= 0).all()
    assert df["overall_quality"].between(0, 100).all()


def test_multimodal_features_dataset_alignment():
    """Verify multimodal_features.csv preserves 15,000 master posts with 5,000 media-linked posts."""
    assert MULTIMODAL_CSV.exists()
    df = pd.read_csv(MULTIMODAL_CSV)
    assert len(df) == 15000, f"Expected 15,000 posts, got {len(df)}"
    assert df["post_id"].nunique() == 15000

    media_linked = (df["has_media"] == 1).sum()
    assert media_linked == 5000, f"Expected 5,000 media-linked posts, got {media_linked}"
    tabular_only = (df["has_media"] == 0).sum()
    assert tabular_only == 10000, f"Expected 10,000 tabular-only posts, got {tabular_only}"
