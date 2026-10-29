"""
Automated validation and integration tests for TrendSkope 15,000 Dataset Expansion.
Covers:
- Exact target record count (15,000)
- Unique post IDs
- Duplicate content detection
- Required schema columns
- Valid media types
- Valid timestamps & chronological order
- Non-negative engagement counts
- Positive follower counts
- Historical-feature leakage prevention
- Training & inference compatibility
- Correct dashboard counts (master vs training vs test)
- Safe repeated execution
- Failure recovery & rollback safety
"""
from __future__ import annotations

import io
from pathlib import Path
import numpy as np
import pandas as pd
import pytest
from fastapi.testclient import TestClient

from api.index import app
from src.config import DATA_RAW, MODELS, REPORTS, REQUIRED_COLUMNS
from src.data_cleaning import clean_posts, validate_posts
from src.dataset_manager import (
    MASTER_DATASET_PATH,
    load_master_dataset,
    validate_uploaded_dataframe,
)
from src.feature_engineering import add_target, build_features
from src.historical_features import add_historical_features
from src.predict import load_artifact, predict_one
from scripts.generate_dataset import expand_master_dataset

client = TestClient(app)


def test_exact_15k_record_count():
    """Verify canonical master dataset contains exactly 15,000 records."""
    assert MASTER_DATASET_PATH.exists(), f"Master dataset not found at {MASTER_DATASET_PATH}"
    df = pd.read_csv(MASTER_DATASET_PATH)
    assert len(df) == 15000, f"Expected exactly 15,000 records, got {len(df)}"


def test_unique_post_ids():
    """Verify all 15,000 post_ids are strictly unique with zero duplicates."""
    df = pd.read_csv(MASTER_DATASET_PATH)
    n_unique = df["post_id"].nunique()
    assert n_unique == 15000, f"Expected 15,000 unique post_ids, found {n_unique}"
    assert df.duplicated(subset=["post_id"]).sum() == 0, "Found duplicate post_ids in master dataset"


def test_required_columns_and_no_nulls():
    """Verify all required columns are present with zero missing values."""
    df = pd.read_csv(MASTER_DATASET_PATH)
    missing_cols = REQUIRED_COLUMNS - set(df.columns)
    assert not missing_cols, f"Missing required columns: {missing_cols}"
    for col in REQUIRED_COLUMNS:
        assert df[col].isna().sum() == 0, f"Column {col} has null values"


def test_valid_media_types():
    """Verify media types are normalized to image, carousel, or reel."""
    df = pd.read_csv(MASTER_DATASET_PATH)
    valid_types = {"image", "carousel", "reel"}
    actual_types = set(df["media_type"].unique())
    assert actual_types.issubset(valid_types), f"Found invalid media types: {actual_types - valid_types}"


def test_valid_timestamps_and_chronological_ordering():
    """Verify published_at timestamps are valid UTC and strictly monotonically increasing."""
    df = pd.read_csv(MASTER_DATASET_PATH)
    dt_series = pd.to_datetime(df["published_at"], errors="coerce", utc=True)
    assert not dt_series.isna().any(), "Found invalid or unparseable timestamps"
    assert dt_series.is_monotonic_increasing, "Master dataset is not sorted chronologically"


def test_non_negative_engagement_counts():
    """Verify engagement metrics are non-negative integer values."""
    df = pd.read_csv(MASTER_DATASET_PATH)
    for col in ["likes", "comments", "saves", "shares"]:
        if col in df.columns:
            vals = df[col]
            assert (vals >= 0).all(), f"Found negative values in {col}"
            assert (vals % 1 == 0).all(), f"Found non-integer values in {col}"


def test_positive_follower_counts():
    """Verify follower counts are strictly positive numbers."""
    df = pd.read_csv(MASTER_DATASET_PATH)
    followers = df["followers_at_or_near_collection"]
    assert (followers > 0).all(), "Found non-positive follower counts"


def test_duplicate_content_detection():
    """Verify zero duplicate rows and zero duplicate (account, published_at, caption) tuples."""
    df = pd.read_csv(MASTER_DATASET_PATH)
    assert df.duplicated().sum() == 0, "Found exact duplicate rows"
    combo_dups = df.duplicated(subset=["account_id", "published_at", "caption"]).sum()
    assert combo_dups == 0, f"Found {combo_dups} duplicate account/timestamp/caption tuples"


def test_historical_feature_leakage_prevention():
    """Verify historical feature calculation uses only information available before publication."""
    test_df = pd.DataFrame([
        {
            "account_id": "ACC_TEST",
            "published_at": "2025-01-01T10:00:00Z",
            "media_type": "image",
            "caption": "First post",
            "likes": 100,
            "comments": 10,
            "followers_at_or_near_collection": 1000,
            "saves": 5,
            "shares": 2,
        },
        {
            "account_id": "ACC_TEST",
            "published_at": "2025-01-02T10:00:00Z",
            "media_type": "reel",
            "caption": "Second post",
            "likes": 500,
            "comments": 50,
            "followers_at_or_near_collection": 1000,
            "saves": 25,
            "shares": 10,
        },
    ])
    cleaned = clean_posts(test_df)
    with_target = add_target(cleaned)
    with_features = build_features(with_target)
    with_history = add_historical_features(with_features)

    # Post 1 must have 0 historical posts and NaN statistics
    p1 = with_history.iloc[0]
    assert p1["historical_post_count"] == 0
    assert np.isnan(p1["historical_mean_engagement"])
    assert np.isnan(p1["historical_median_engagement"])

    # Post 2 must use Post 1's engagement rate only (11.7%)
    p2 = with_history.iloc[1]
    assert p2["historical_post_count"] == 1
    assert round(p2["historical_mean_engagement"], 2) == round(p1["engagement_rate"], 2)


def test_training_and_inference_compatibility():
    """Verify the active model loads and generates valid predictions for posts from the 15k dataset."""
    model_path = MODELS / "final_model.joblib"
    assert model_path.exists(), "Active model artifact final_model.joblib not found"

    artifact = load_artifact(model_path)
    df = pd.read_csv(MASTER_DATASET_PATH)

    # Test sample from head, middle, and tail of dataset
    samples = pd.concat([df.head(3), df.iloc[7500:7503], df.tail(3)])
    for _, row in samples.iterrows():
        pred_res = predict_one(artifact, row.to_dict())
        assert "prediction" in pred_res
        assert "lower" in pred_res
        assert "upper" in pred_res
        assert "band" in pred_res
        assert pred_res["prediction"] >= 0
        assert pred_res["lower"] <= pred_res["upper"]
        assert pred_res["band"] in ["Low", "Medium", "High"]


def test_dashboard_dataset_distinction():
    """Verify dashboard API accurately distinguishes master dataset, training corpus, and test split."""
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True

    dataset_stats = data["dataset"]
    model_stats = data["model"]

    # Master dataset count
    assert dataset_stats["posts"] == 15000
    assert dataset_stats["accounts"] >= 40
    assert dataset_stats["duplicate_rows"] == 0
    assert dataset_stats["missing_values"] == 0

    # Training & evaluation counts
    splits = model_stats["splits"]
    assert splits is not None
    assert splits["train"] == 10500  # 70%
    assert splits["validation"] == 2250  # 15%
    assert splits["test"] == 2250  # 15%

    # Active model trained on train + validation = 12,750 (85%)
    # Test set evaluated on held-out 2,250 (15%)
    assert splits["train"] + splits["validation"] == 12750
    assert splits["train"] + splits["validation"] + splits["test"] == 15000


def test_safe_repeated_execution():
    """Verify that rerunning the expansion on an already complete 15,000 dataset is safe and idempotent."""
    res_df, status = expand_master_dataset(target_count=15000)
    assert len(res_df) == 15000
    assert status.get("status") in ["already_target_size", "complete"]


def test_failure_recovery_on_invalid_upload():
    """Verify that uploading invalid records rejects the batch and leaves the master dataset unchanged."""
    master_before = len(load_master_dataset())

    invalid_df = pd.DataFrame([
        {
            "post_id": "test_err_1",
            "account_id": "acc_1",
            "published_at": "invalid-timestamp",
            "media_type": "image",
            "caption": "Invalid row",
            "likes": -10,  # Negative likes
            "comments": 0,
            "followers_at_or_near_collection": 0,  # Zero followers
        }
    ])
    buf = io.BytesIO()
    invalid_df.to_csv(buf, index=False)
    buf.seek(0)

    val_resp = client.post("/api/validate-csv", files={"file": ("invalid.csv", buf.getvalue(), "text/csv")})
    assert val_resp.status_code == 200
    assert val_resp.json()["valid"] is False

    master_after = len(load_master_dataset())
    assert master_after == master_before == 15000
