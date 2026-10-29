"""
Automated Pytest Suite for 9 Content Audit Datasets.
Verifies master dataset hash preservation, schema compliance, uniqueness, and linkage.
"""
from __future__ import annotations

import hashlib
from pathlib import Path
import pandas as pd
import pytest

from src.config import DATA_RAW, ROOT

CONTENT_AUDIT_DIR = ROOT / "data" / "content_audit_datasets"
MASTER_PATH = DATA_RAW / "instagram_posts_1000.csv"
EXPECTED_MASTER_SHA256 = "d6eb91540b3528c9d2b4e303da74cf7a49eed5f44cd014d10526e256049da292"

DATASET_NAMES = [
    "image_quality_dataset.csv",
    "poster_design_audit_dataset.csv",
    "video_reel_analysis_dataset.csv",
    "carousel_analysis_dataset.csv",
    "caption_analysis_dataset.csv",
    "audio_music_analysis_dataset.csv",
    "content_drawbacks_dataset.csv",
    "content_improvement_recommendations.csv",
    "multimodal_content_features.csv",
]


def test_master_dataset_sha256_unmodified():
    """Verify master dataset hash is 100% bit-for-bit preserved."""
    assert MASTER_PATH.exists()
    hasher = hashlib.sha256()
    with open(MASTER_PATH, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    assert hasher.hexdigest() == EXPECTED_MASTER_SHA256, "Master dataset hash changed!"


@pytest.mark.parametrize("filename", DATASET_NAMES)
def test_dataset_exists_and_has_at_least_5000_rows(filename: str):
    """Verify each of the 9 datasets exists and contains at least 5,000 records."""
    path = CONTENT_AUDIT_DIR / filename
    assert path.exists(), f"File {filename} is missing!"
    df = pd.read_csv(path)
    assert len(df) >= 5000, f"{filename} has {len(df)} rows, expected >= 5000"


@pytest.mark.parametrize("filename", DATASET_NAMES)
def test_dataset_primary_key_is_unique(filename: str):
    """Verify primary keys have zero duplicates in each dataset."""
    path = CONTENT_AUDIT_DIR / filename
    df = pd.read_csv(path)
    assert "record_id" in df.columns
    assert df["record_id"].nunique() == len(df), f"Duplicate record_ids found in {filename}"


@pytest.mark.parametrize("filename", DATASET_NAMES)
def test_dataset_content_id_foreign_keys_resolve(filename: str):
    """Verify all foreign keys ('content_id') resolve to valid master posts."""
    path = CONTENT_AUDIT_DIR / filename
    df = pd.read_csv(path)
    master_df = pd.read_csv(MASTER_PATH)
    master_post_ids = set(master_df["post_id"].dropna())

    if "content_id" in df.columns:
        content_ids = set(df["content_id"].dropna())
        assert content_ids.issubset(master_post_ids), f"Orphaned content_ids in {filename}"


def test_provenance_and_physical_media_distinction():
    """Verify physical vs synthetic data sources are clearly distinguished."""
    df_iq = pd.read_csv(CONTENT_AUDIT_DIR / "image_quality_dataset.csv")
    sources = set(df_iq["source_type"].unique())
    assert "physical_media_extracted" in sources
    assert "synthetic_simulation_benchmark" in sources

    df_vid = pd.read_csv(CONTENT_AUDIT_DIR / "video_reel_analysis_dataset.csv")
    v_sources = set(df_vid["source_type"].unique())
    assert "physical_media_extracted" in v_sources

    df_aud = pd.read_csv(CONTENT_AUDIT_DIR / "audio_music_analysis_dataset.csv")
    a_sources = set(df_aud["source_type"].unique())
    assert "physical_media_extracted" in a_sources
