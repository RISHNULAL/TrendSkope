"""
Comprehensive test suite for Dataset Validation, Incremental Append, Leakage-Free Retraining,
Duplicate Handling, and Safe Failure Rollback.
"""
from __future__ import annotations

import io
import shutil
from pathlib import Path
import pandas as pd
import pytest
from fastapi.testclient import TestClient

from api.index import app
from src.config import DATA_RAW, MODELS, REPORTS
from src.dataset_manager import (
    MASTER_DATASET_PATH,
    get_provenance_history,
    load_master_dataset,
    merge_and_retrain,
    validate_uploaded_dataframe,
)

client = TestClient(app)


@pytest.fixture(autouse=True)
def preserve_master_dataset_and_models():
    """Fixture that guarantees master dataset and models are backed up and restored for test isolation."""
    master_backup = DATA_RAW / "master_test_backup.csv"
    model_backup = MODELS / "model_test_backup.joblib"
    metrics_backup = REPORTS / "metrics_test_backup.json"
    comp_backup = REPORTS / "comp_test_backup.csv"

    if MASTER_DATASET_PATH.exists():
        shutil.copy2(MASTER_DATASET_PATH, master_backup)
    if (MODELS / "final_model.joblib").exists():
        shutil.copy2(MODELS / "final_model.joblib", model_backup)
    if (REPORTS / "metrics.json").exists():
        shutil.copy2(REPORTS / "metrics.json", metrics_backup)
    if (REPORTS / "model_comparison.csv").exists():
        shutil.copy2(REPORTS / "model_comparison.csv", comp_backup)

    yield

    # Restore
    if master_backup.exists():
        shutil.copy2(master_backup, MASTER_DATASET_PATH)
        master_backup.unlink(missing_ok=True)
    if model_backup.exists():
        shutil.copy2(model_backup, MODELS / "final_model.joblib")
        model_backup.unlink(missing_ok=True)
    if metrics_backup.exists():
        shutil.copy2(metrics_backup, REPORTS / "metrics.json")
        metrics_backup.unlink(missing_ok=True)
    if comp_backup.exists():
        shutil.copy2(comp_backup, REPORTS / "model_comparison.csv")
        comp_backup.unlink(missing_ok=True)


def test_validate_csv_endpoint_valid_10_rows():
    """Test 1: Upload a valid 10-row CSV; verify validation breakdown."""
    rows = [
        {
            "post_id": f"test_new_{i:03d}",
            "account_id": f"acc_{(i%3)+1:03d}",
            "published_at": f"2026-09-20T{12+i:02d}:00:00Z",
            "media_type": "reel" if i % 2 == 0 else "image",
            "caption": f"Sample test post #{i} #test #trending",
            "likes": 150 + i * 10,
            "comments": 12 + i,
            "followers_at_or_near_collection": 3000 + i * 100,
            "saves": 5,
            "shares": 2,
        }
        for i in range(10)
    ]
    df = pd.DataFrame(rows)
    buf = io.BytesIO()
    df.to_csv(buf, index=False)
    buf.seek(0)

    files = {"file": ("new_posts_10.csv", buf.getvalue(), "text/csv")}
    response = client.post("/api/validate-csv", files=files)

    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is True
    assert data["total_uploaded"] == 10
    assert data["valid_count"] == 10
    assert data["invalid_count"] == 0
    assert data["new_count"] == 10
    assert data["duplicate_count"] == 0
    assert len(data["errors"]) == 0
    assert len(data["preview"]) == 5


def test_add_and_retrain_endpoint_10_rows():
    """Test 2: Add 10 new valid records and trigger model retraining."""
    master_before = len(load_master_dataset())

    rows = [
        {
            "post_id": f"test_retrain_row_{i:03d}",
            "account_id": f"acc_{(i%4)+1:03d}",
            "published_at": f"2026-09-22T{10+i:02d}:00:00Z",
            "media_type": "carousel" if i % 3 == 0 else "reel",
            "caption": f"Retraining test post #{i} #machinelearning #data",
            "likes": 200 + i * 15,
            "comments": 20 + i * 2,
            "followers_at_or_near_collection": 4500,
            "saves": 8,
            "shares": 3,
        }
        for i in range(10)
    ]
    df = pd.DataFrame(rows)
    buf = io.BytesIO()
    df.to_csv(buf, index=False)
    buf.seek(0)

    files = {"file": ("new_batch_10.csv", buf.getvalue(), "text/csv")}
    response = client.post("/api/add-and-retrain", files=files)

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["rows_added"] == 10
    assert data["resulting_size"] == master_before + 10
    assert data["selected_model"] in [
        "Bayesian Ridge Regression",
        "Ridge Regression",
        "Linear Regression",
        "Lasso Regression",
        "KNN Regressor",
        "Decision Tree Regressor",
    ]
    assert "test_metrics" in data
    assert data["test_metrics"]["mae"] > 0

    # Verify master dataset on disk actually grew
    master_after = len(load_master_dataset())
    assert master_after == master_before + 10


def test_duplicates_handling_5_existing_5_new():
    """Test 3: Upload 10 rows containing 5 existing post_ids and 5 new post_ids."""
    master_df = load_master_dataset()
    existing_5_ids = list(master_df["post_id"].head(5))

    rows = []
    # 5 duplicate rows
    for i, pid in enumerate(existing_5_ids):
        rows.append({
            "post_id": pid,
            "account_id": "acc_001",
            "published_at": f"2026-09-25T10:00:00Z",
            "media_type": "image",
            "caption": f"Duplicate post #{i}",
            "likes": 100,
            "comments": 10,
            "followers_at_or_near_collection": 2000,
        })
    # 5 new rows
    for i in range(5):
        rows.append({
            "post_id": f"test_brand_new_id_{i:03d}",
            "account_id": "acc_002",
            "published_at": f"2026-09-25T1{i}:00:00Z",
            "media_type": "image",
            "caption": f"Brand new post #{i}",
            "likes": 120,
            "comments": 12,
            "followers_at_or_near_collection": 2500,
        })

    df = pd.DataFrame(rows)
    buf = io.BytesIO()
    df.to_csv(buf, index=False)
    buf.seek(0)

    # 1. Validation check
    files = {"file": ("dup_test.csv", buf.getvalue(), "text/csv")}
    val_resp = client.post("/api/validate-csv", files=files)
    assert val_resp.status_code == 200
    val_data = val_resp.json()
    assert val_data["valid"] is True
    assert val_data["total_uploaded"] == 10
    assert val_data["duplicate_count"] == 5
    assert val_data["new_count"] == 5

    # 2. Add and retrain check
    buf.seek(0)
    files = {"file": ("dup_test.csv", buf.getvalue(), "text/csv")}
    retrain_resp = client.post("/api/add-and-retrain", files=files)
    assert retrain_resp.status_code == 200
    retrain_data = retrain_resp.json()
    assert retrain_data["rows_added"] == 5
    assert retrain_data["duplicates_skipped"] == 5
    assert retrain_data["resulting_size"] == len(master_df) + 5


def test_invalid_records_rejected():
    """Test 4: Invalid rows (negative followers, invalid media_type, broken timestamps) are rejected."""
    master_before = len(load_master_dataset())

    invalid_rows = [
        {
            "post_id": "inv_1",
            "account_id": "acc_1",
            "published_at": "not-a-valid-date",  # Invalid timestamp
            "media_type": "image",
            "caption": "Invalid timestamp post",
            "likes": 100,
            "comments": 10,
            "followers_at_or_near_collection": 1000,
        },
        {
            "post_id": "inv_2",
            "account_id": "acc_1",
            "published_at": "2026-09-20T12:00:00Z",
            "media_type": "audio",  # Invalid media_type
            "caption": "Invalid media type post",
            "likes": 100,
            "comments": 10,
            "followers_at_or_near_collection": 1000,
        },
        {
            "post_id": "inv_3",
            "account_id": "acc_1",
            "published_at": "2026-09-20T12:00:00Z",
            "media_type": "image",
            "caption": "Invalid negative followers post",
            "likes": 100,
            "comments": 10,
            "followers_at_or_near_collection": -500,  # Invalid followers <= 0
        },
    ]

    df = pd.DataFrame(invalid_rows)
    buf = io.BytesIO()
    df.to_csv(buf, index=False)
    buf.seek(0)

    # 1. Validation should fail
    files = {"file": ("invalid_posts.csv", buf.getvalue(), "text/csv")}
    val_resp = client.post("/api/validate-csv", files=files)
    assert val_resp.status_code == 200
    val_data = val_resp.json()
    assert val_data["valid"] is False
    assert val_data["invalid_count"] == 3
    assert len(val_data["errors"]) > 0

    # 2. Add and retrain must reject invalid data (HTTP 400)
    buf.seek(0)
    files = {"file": ("invalid_posts.csv", buf.getvalue(), "text/csv")}
    retrain_resp = client.post("/api/add-and-retrain", files=files)
    assert retrain_resp.status_code == 400

    # Verify master dataset remains untouched
    assert len(load_master_dataset()) == master_before


def test_safe_failure_preserves_active_model(monkeypatch):
    """Test 5: If model training fails mid-way, previous model and dataset are preserved."""
    master_before = len(load_master_dataset())
    model_mtime_before = (MODELS / "final_model.joblib").stat().st_mtime

    # Monkeypatch train_and_evaluate_corpus to simulate unexpected training crash
    import src.dataset_manager as dm

    def mock_failing_training(dataset_path):
        raise RuntimeError("Simulated compute engine out-of-memory or model crash")

    monkeypatch.setattr(dm, "train_and_evaluate_corpus", mock_failing_training)

    rows = [
        {
            "post_id": f"safe_fail_row_{i:03d}",
            "account_id": "acc_001",
            "published_at": f"2026-09-28T1{i}:00:00Z",
            "media_type": "image",
            "caption": f"Valid post #{i}",
            "likes": 100,
            "comments": 10,
            "followers_at_or_near_collection": 2000,
        }
        for i in range(5)
    ]
    df = pd.DataFrame(rows)
    buf = io.BytesIO()
    df.to_csv(buf, index=False)
    buf.seek(0)

    files = {"file": ("safe_fail_batch.csv", buf.getvalue(), "text/csv")}
    resp = client.post("/api/add-and-retrain", files=files)

    assert resp.status_code == 500
    assert "previous active model remains in use" in resp.json()["detail"]

    # Verify master dataset was restored to exact previous state
    assert len(load_master_dataset()) == master_before
    assert (MODELS / "final_model.joblib").exists()


def test_validate_and_retrain_with_photo_media_type():
    """Test 6: Verify that media_type='photo' is accepted, validated, normalized to 'image', and retrained."""
    master_before = len(load_master_dataset())

    rows = [
        {
            "post_id": f"test_photo_row_{i:03d}",
            "account_id": f"acc_{(i%3)+1:03d}",
            "published_at": f"2026-09-29T1{i}:00:00Z",
            "media_type": "photo",  # Uses 'photo' instead of 'image'
            "caption": f"Photo media type post #{i} #photography",
            "likes": 180 + i * 5,
            "comments": 15 + i,
            "followers_at_or_near_collection": 3200,
            "saves": 6,
            "shares": 1,
        }
        for i in range(10)
    ]
    df = pd.DataFrame(rows)
    buf = io.BytesIO()
    df.to_csv(buf, index=False)
    buf.seek(0)

    # 1. Validation check: must succeed with 10 valid, 0 invalid
    files = {"file": ("photo_posts_10.csv", buf.getvalue(), "text/csv")}
    val_resp = client.post("/api/validate-csv", files=files)
    assert val_resp.status_code == 200
    val_data = val_resp.json()
    assert val_data["valid"] is True
    assert val_data["total_uploaded"] == 10
    assert val_data["valid_count"] == 10
    assert val_data["invalid_count"] == 0
    assert val_data["duplicate_count"] == 0
    assert val_data["new_count"] == 10

    # 2. Retraining check: must succeed and merge into master dataset
    buf.seek(0)
    files = {"file": ("photo_posts_10.csv", buf.getvalue(), "text/csv")}
    retrain_resp = client.post("/api/add-and-retrain", files=files)
    assert retrain_resp.status_code == 200
    retrain_data = retrain_resp.json()
    assert retrain_data["success"] is True
    assert retrain_data["rows_added"] == 10
    assert retrain_data["resulting_size"] == master_before + 10

    # 3. Canonical check: verify master dataset on disk has normalized 'photo' to 'image'
    master_df = load_master_dataset()
    added_posts = master_df[master_df["post_id"].str.startswith("test_photo_row_")]
    assert len(added_posts) == 10
    # All added posts must have canonical media_type == 'image'
    assert (added_posts["media_type"] == "image").all()
    # The entire master dataset should have only canonical values (image, carousel, reel)
    assert set(master_df["media_type"].unique()).issubset({"image", "carousel", "reel"})

