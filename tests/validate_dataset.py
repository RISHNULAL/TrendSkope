"""
Validation script for TrendSkope 1,000 post research dataset.
Verifies uniqueness, schema compliance, chronological order, and absence of data corruption.
"""
from __future__ import annotations
import sys
from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
DATA_RAW = ROOT / "data" / "raw"

REQUIRED_COLUMNS = [
    "post_id",
    "account_id",
    "published_at",
    "media_type",
    "caption",
    "likes",
    "comments",
    "followers_at_or_near_collection",
]

def validate_dataset_file(csv_path: Path) -> dict:
    if not csv_path.exists():
        raise FileNotFoundError(f"Dataset file not found: {csv_path}")

    df = pd.read_csv(csv_path)
    n_rows = len(df)
    
    # 1. Row count check (target ~1,000)
    assert 950 <= n_rows <= 1100, f"Expected 950-1100 rows, got {n_rows}"

    # 2. Schema check
    for col in REQUIRED_COLUMNS:
        assert col in df.columns, f"Missing required column: {col}"

    # 3. Unique post_id check
    n_unique_ids = df["post_id"].nunique()
    assert n_unique_ids == n_rows, f"post_id not unique: {n_unique_ids} unique vs {n_rows} total rows"

    # 4. Exact duplicate rows check
    dup_rows = df.duplicated().sum()
    assert dup_rows == 0, f"Found {dup_rows} exact duplicate rows"

    # 5. Duplicate combinations check
    dup_combos = df.duplicated(subset=["account_id", "published_at", "caption"]).sum()
    assert dup_combos == 0, f"Found {dup_combos} duplicate account/timestamp/caption combinations"

    # 6. Null checks on required columns
    for col in REQUIRED_COLUMNS:
        null_count = df[col].isna().sum()
        assert null_count == 0, f"Found {null_count} nulls in column {col}"

    # 7. Follower counts check
    assert (df["followers_at_or_near_collection"] > 0).all(), "Found invalid non-positive follower counts"

    # 8. Engagement values check
    assert (df["likes"] >= 0).all(), "Found negative likes"
    assert (df["comments"] >= 0).all(), "Found negative comments"
    if "saves" in df.columns:
        assert (df["saves"] >= 0).all(), "Found negative saves"
    if "shares" in df.columns:
        assert (df["shares"] >= 0).all(), "Found negative shares"

    # 9. Media types check
    valid_media = {"image", "carousel", "reel"}
    actual_media = set(df["media_type"].str.lower().unique())
    assert actual_media.issubset(valid_media), f"Invalid media types found: {actual_media - valid_media}"

    # 10. Account diversity check
    n_accounts = df["account_id"].nunique()
    assert n_accounts >= 30, f"Expected at least 30 accounts, got {n_accounts}"

    # 11. Chronological order check
    dates = pd.to_datetime(df["published_at"], utc=True)
    assert dates.is_monotonic_increasing, "Dataset published_at is not chronologically sorted"

    return {
        "status": "PASS",
        "rows": n_rows,
        "unique_post_ids": n_unique_ids,
        "duplicate_rows": int(dup_rows),
        "unique_accounts": int(n_accounts),
        "start_date": str(dates.min()),
        "end_date": str(dates.max()),
        "media_distribution": df["media_type"].value_counts().to_dict(),
    }


def test_dataset_validation():
    target_csv = DATA_RAW / "instagram_posts_1000.csv"
    res = validate_dataset_file(target_csv)
    assert res["status"] == "PASS"
    assert res["rows"] == 1000
    assert res["unique_post_ids"] == 1000
    assert res["duplicate_rows"] == 0


if __name__ == "__main__":
    csv_file = DATA_RAW / "instagram_posts_1000.csv"
    if len(sys.argv) > 1:
        csv_file = Path(sys.argv[1])
    results = validate_dataset_file(csv_file)
    print("Dataset Validation Passed Successfully!")
    for k, v in results.items():
        print(f"  {k}: {v}")
