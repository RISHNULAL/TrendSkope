"""
Dataset provenance, validation, incremental merge, and safe model retraining engine.
Maintains a single canonical master dataset and guarantees chronological, leakage-free feature computation.
"""
from __future__ import annotations

import io
import json
import shutil
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import BayesianRidge, Lasso, LinearRegression, Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.neighbors import KNeighborsRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.tree import DecisionTreeRegressor

from src.config import DATA_RAW, MODELS, RANDOM_STATE, REPORTS, REQUIRED_COLUMNS
from src.data_cleaning import clean_posts
from src.feature_engineering import add_target, build_features
from src.historical_features import add_historical_features

MASTER_DATASET_FILE = "instagram_posts_1000.csv"
MASTER_DATASET_PATH = DATA_RAW / MASTER_DATASET_FILE
PROVENANCE_PATH = REPORTS / "dataset_provenance.json"

NUMERIC_FEATURES = [
    "posting_hour", "posting_day_of_week", "posting_day", "posting_month", "is_weekend",
    "followers", "log_followers", "caption_length", "word_count", "hashtag_count",
    "mention_count", "url_count", "emoji_count", "exclamation_count", "question_count",
    "uppercase_ratio", "average_word_length", "historical_post_count",
    "historical_mean_engagement", "historical_median_engagement", "historical_std_engagement",
    "recent_5_median", "recent_10_median", "recent_20_median"
]
CATEGORICAL_FEATURES = ["media_type"]


def build_pipeline(model):
    pre = ColumnTransformer([
        ("num", Pipeline([("impute", SimpleImputer(strategy="median")), ("scale", StandardScaler())]), NUMERIC_FEATURES),
        ("cat", Pipeline([("impute", SimpleImputer(strategy="most_frequent")), ("onehot", OneHotEncoder(handle_unknown="ignore"))]), CATEGORICAL_FEATURES)
    ])
    return Pipeline([("preprocess", pre), ("model", model)])


def compute_metrics(y_true, y_pred):
    return {
        "mae": float(mean_absolute_error(np.expm1(y_true), np.expm1(y_pred))),
        "rmse": float(mean_squared_error(np.expm1(y_true), np.expm1(y_pred)) ** 0.5),
        "r2": float(r2_score(y_true, y_pred)),
        "median_absolute_error": float(np.median(abs(np.expm1(y_true) - np.expm1(y_pred))))
    }


def load_master_dataset() -> pd.DataFrame:
    if MASTER_DATASET_PATH.exists():
        try:
            return pd.read_csv(MASTER_DATASET_PATH)
        except Exception:
            pass
    return pd.DataFrame(columns=list(REQUIRED_COLUMNS))


def validate_uploaded_dataframe(
    df: pd.DataFrame,
    master_df: Optional[pd.DataFrame] = None
) -> Dict[str, Any]:
    """
    Validates schema, data types, timestamp formatting, values, and master duplicates.
    Does NOT modify the master dataset.
    """
    if master_df is None:
        master_df = load_master_dataset()

    missing_cols = REQUIRED_COLUMNS - set(df.columns)
    if missing_cols:
        return {
            "valid": False,
            "total_uploaded": len(df),
            "valid_count": 0,
            "invalid_count": len(df),
            "duplicate_count": 0,
            "new_count": 0,
            "errors": [f"Missing required column(s): {', '.join(sorted(missing_cols))}"],
            "invalid_details": [f"Header Error: Missing required column(s): {', '.join(sorted(missing_cols))}"],
            "duplicate_ids": [],
            "current_master_size": len(master_df),
            "projected_master_size": len(master_df),
            "preview": [],
            "status_message": "Validation failed due to missing required schema columns.",
        }

    if df.empty:
        return {
            "valid": False,
            "total_uploaded": 0,
            "valid_count": 0,
            "invalid_count": 0,
            "duplicate_count": 0,
            "new_count": 0,
            "errors": ["The uploaded file contains 0 rows."],
            "invalid_details": ["The uploaded file contains no data rows."],
            "duplicate_ids": [],
            "current_master_size": len(master_df),
            "projected_master_size": len(master_df),
            "preview": [],
            "status_message": "The uploaded CSV contains no records.",
        }

    # Track master post IDs for duplicate detection
    existing_post_ids = set()
    if not master_df.empty and "post_id" in master_df.columns:
        existing_post_ids = set(master_df["post_id"].dropna().astype(str))

    valid_indices: List[int] = []
    invalid_details: List[str] = []
    seen_in_batch: set[str] = set()
    duplicate_ids: List[str] = []
    new_valid_indices: List[int] = []

    for idx, row in df.iterrows():
        row_num = idx + 2  # 1-indexed plus header row
        reasons: List[str] = []

        # 1. post_id
        post_id_val = row.get("post_id")
        if pd.isna(post_id_val) or str(post_id_val).strip() == "":
            reasons.append("Missing post_id")
        else:
            pid_str = str(post_id_val).strip()
            if pid_str in seen_in_batch:
                reasons.append(f"Duplicate post_id '{pid_str}' within uploaded batch")
            seen_in_batch.add(pid_str)

        # 2. account_id
        acc_id = row.get("account_id")
        if pd.isna(acc_id) or str(acc_id).strip() == "":
            reasons.append("Missing account_id")

        # 3. published_at
        pub_at = row.get("published_at")
        if pd.isna(pub_at) or str(pub_at).strip() == "":
            reasons.append("Missing published_at timestamp")
        else:
            try:
                parsed_date = pd.to_datetime(pub_at, utc=True)
                if pd.isna(parsed_date):
                    reasons.append(f"Invalid timestamp format '{pub_at}'")
            except Exception:
                reasons.append(f"Unparseable timestamp format '{pub_at}'")

        # 4. media_type (accepts photo, image, carousel, reel and canonicalizes photo -> image)
        media_val = row.get("media_type")
        if pd.isna(media_val) or str(media_val).strip().lower() not in ["photo", "image", "carousel", "reel"]:
            reasons.append(f"Invalid media_type '{media_val}' (must be photo, image, carousel, or reel)")

        # 5. followers_at_or_near_collection
        fol_val = row.get("followers_at_or_near_collection")
        try:
            fol_num = float(fol_val)
            if np.isnan(fol_num) or fol_num <= 0:
                reasons.append("Followers must be a positive number greater than zero")
        except Exception:
            reasons.append(f"Invalid non-numeric follower count '{fol_val}'")

        # 6. likes & comments
        for col in ("likes", "comments"):
            c_val = row.get(col)
            try:
                c_num = float(c_val)
                if np.isnan(c_num) or c_num < 0:
                    reasons.append(f"{col} must be a non-negative number")
            except Exception:
                reasons.append(f"Invalid non-numeric {col} '{c_val}'")

        # 7. optional numeric fields
        for col in ("saves", "shares"):
            if col in row and pd.notna(row.get(col)):
                s_val = row.get(col)
                try:
                    s_num = float(s_val)
                    if s_num < 0:
                        reasons.append(f"{col} cannot be negative")
                except Exception:
                    reasons.append(f"Invalid non-numeric {col} '{s_val}'")

        if reasons:
            invalid_details.append(f"Row {row_num}: {'; '.join(reasons)}")
        else:
            valid_indices.append(idx)
            pid_str = str(post_id_val).strip()
            if pid_str in existing_post_ids:
                duplicate_ids.append(pid_str)
            else:
                new_valid_indices.append(idx)

    total_uploaded = len(df)
    valid_count = len(valid_indices)
    invalid_count = len(invalid_details)
    duplicate_count = len(duplicate_ids)
    new_count = len(new_valid_indices)
    current_master_size = len(master_df)
    projected_master_size = current_master_size + new_count

    is_overall_valid = (invalid_count == 0) and (valid_count > 0)

    # Build preview of new valid records with normalized media_type
    preview_df = df.iloc[new_valid_indices if new_valid_indices else valid_indices].head(5).copy()
    if "media_type" in preview_df.columns:
        preview_df["media_type"] = preview_df["media_type"].astype(str).str.strip().str.lower().replace({"photo": "image"})
    preview_rows = preview_df.fillna("").to_dict(orient="records")
    for r in preview_rows:
        for k, v in r.items():
            if isinstance(v, (pd.Timestamp, pd.Timedelta)):
                r[k] = str(v)
            elif isinstance(v, (np.integer, np.int64)):
                r[k] = int(v)
            elif isinstance(v, (np.floating, np.float64)):
                r[k] = float(v)

    if not is_overall_valid:
        status_message = f"{valid_count} valid rows · {invalid_count} invalid rows failed validation."
    elif duplicate_count > 0:
        status_message = f"{total_uploaded} uploaded · {new_count} new · {duplicate_count} duplicates skipped."
    else:
        status_message = f"{new_count} new posts verified · Ready to add to master dataset."

    return {
        "valid": is_overall_valid,
        "total_uploaded": total_uploaded,
        "valid_count": valid_count,
        "invalid_count": invalid_count,
        "duplicate_count": duplicate_count,
        "new_count": new_count,
        "errors": invalid_details[:10],
        "invalid_details": invalid_details,
        "duplicate_ids": duplicate_ids[:10],
        "current_master_size": current_master_size,
        "projected_master_size": projected_master_size,
        "preview": preview_rows,
        "status_message": status_message,
    }


def train_and_evaluate_corpus(dataset_path: Path) -> Dict[str, Any]:
    """
    Executes the strict 6-model training and evaluation pipeline on the master dataset:
    - Recalculates leakage-free historical features using only prior posts
    - Chronological 70% Train / 15% Val / 15% Test split
    - Retrains 6 interpretable models (Bayesian Ridge, Ridge, Linear, Lasso, KNN, Decision Tree)
    - Selects best model using Validation MAE
    - Retrains best model on Train + Validation
    - Evaluates once on held-out Test set
    """
    raw = pd.read_csv(dataset_path)
    cleaned = clean_posts(raw)
    with_target = add_target(cleaned)
    with_features = build_features(with_target)
    # Recalculate historical features chronologically
    data = add_historical_features(with_features).sort_values("published_at").reset_index(drop=True)

    n = len(data)
    a, b = int(0.7 * n), int(0.85 * n)
    if a < 10 or b - a < 3 or n - b < 3:
        raise ValueError(f"At least 15 chronologically dated posts are required to train (found {n}).")

    tr = data.iloc[:a].copy()
    va = data.iloc[a:b].copy()
    te = data.iloc[b:].copy()

    candidates = {
        "Bayesian Ridge Regression": BayesianRidge(),
        "Ridge Regression": Ridge(alpha=2.0),
        "Linear Regression": LinearRegression(),
        "Lasso Regression": Lasso(alpha=0.01, random_state=RANDOM_STATE, max_iter=10000),
        "KNN Regressor": KNeighborsRegressor(n_neighbors=7),
        "Decision Tree Regressor": DecisionTreeRegressor(max_depth=5, min_samples_leaf=5, random_state=RANDOM_STATE),
    }

    rows = []
    fitted = {}
    for name, estimator in candidates.items():
        candidate_pipe = build_pipeline(estimator).fit(tr, tr.target)
        pred_val = candidate_pipe.predict(va)
        row = {"model": name, **compute_metrics(va.target, pred_val)}
        rows.append(row)
        fitted[name] = candidate_pipe

    # Select best model using Validation MAE
    best_entry = min(rows, key=lambda x: x["mae"])
    best_name = best_entry["model"]

    # Retrain selected best model on combined Train + Validation
    train_val = pd.concat([tr, va]).sort_values("published_at").reset_index(drop=True)
    best_model_pipe = build_pipeline(candidates[best_name]).fit(train_val, train_val.target)
    
    # Validation residual for 90% uncertainty interval
    val_residual = np.quantile(abs(va.target - fitted[best_name].predict(va)), 0.9)
    test_metrics = compute_metrics(te.target, best_model_pipe.predict(te))
    thresholds = np.quantile(tr.engagement_rate, [0.33, 0.67]).tolist()

    # Feature coefficients/importances
    cat_encoder = best_model_pipe.named_steps["preprocess"].named_transformers_["cat"].named_steps["onehot"]
    cat_names = list(cat_encoder.get_feature_names_out(CATEGORICAL_FEATURES))
    all_features = NUMERIC_FEATURES + cat_names

    feature_coefficients = []
    model_obj = best_model_pipe.named_steps["model"]
    if hasattr(model_obj, "coef_"):
        coefs = model_obj.coef_
        feature_coefficients = [
            {
                "feature": name,
                "coefficient": round(float(c), 6),
                "direction": "Positive association" if c > 0 else "Negative association" if c < 0 else "Neutral association",
                "abs_coefficient": round(abs(float(c)), 6)
            }
            for name, c in zip(all_features, coefs)
        ]
        feature_coefficients.sort(key=lambda x: x["abs_coefficient"], reverse=True)
    elif hasattr(model_obj, "feature_importances_"):
        importances = model_obj.feature_importances_
        feature_coefficients = [
            {
                "feature": name,
                "coefficient": round(float(c), 6),
                "direction": "Feature Importance",
                "abs_coefficient": round(abs(float(c)), 6)
            }
            for name, c in zip(all_features, importances)
        ]
        feature_coefficients.sort(key=lambda x: x["abs_coefficient"], reverse=True)

    MODELS.mkdir(exist_ok=True)
    REPORTS.mkdir(exist_ok=True)

    model_artifact = {
        "model": best_model_pipe,
        "selected_model": best_name,
        "interval_residual": float(val_residual),
        "thresholds": thresholds,
        "feature_names": NUMERIC_FEATURES + CATEGORICAL_FEATURES,
        "feature_coefficients": feature_coefficients,
    }

    joblib.dump(model_artifact, MODELS / "final_model.joblib")
    pd.DataFrame(rows).to_csv(REPORTS / "model_comparison.csv", index=False)
    
    metrics_payload = {
        "test": test_metrics,
        "dataset_size": n,
        "features_used": len(NUMERIC_FEATURES) + len(CATEGORICAL_FEATURES),
        "selected_model": best_name,
        "splits": {
            "train": len(tr),
            "validation": len(va),
            "test": len(te)
        },
        "feature_coefficients": feature_coefficients
    }
    (REPORTS / "metrics.json").write_text(json.dumps(metrics_payload, indent=2))

    return {
        "selected_model": best_name,
        "validation_mae": float(best_entry["mae"]),
        "test_metrics": test_metrics,
        "dataset_size": n,
        "splits": {"train": len(tr), "validation": len(va), "test": len(te)},
        "comparison": rows,
        "feature_coefficients": feature_coefficients,
    }


def get_provenance_history() -> List[Dict[str, Any]]:
    if PROVENANCE_PATH.exists():
        try:
            return json.loads(PROVENANCE_PATH.read_text(encoding="utf-8"))
        except Exception:
            pass
    return []


def append_provenance_record(record: Dict[str, Any]):
    history = get_provenance_history()
    history.insert(0, record)  # Most recent first
    PROVENANCE_PATH.parent.mkdir(exist_ok=True)
    PROVENANCE_PATH.write_text(json.dumps(history[:50], indent=2), encoding="utf-8")


def merge_and_retrain(
    new_df: pd.DataFrame,
    filename: str = "uploaded_dataset.csv"
) -> Dict[str, Any]:
    """
    Appends valid non-duplicate rows to the existing master dataset and retrains the model safely.
    If retraining fails, rolls back to previous working model and master dataset.
    """
    # 1. Validate uploaded data against master
    master_df = load_master_dataset()
    val_report = validate_uploaded_dataframe(new_df, master_df)

    if not val_report["valid"]:
        raise ValueError(
            f"Cannot append invalid data: {len(val_report['invalid_details'])} issues found in uploaded records."
        )

    if val_report["new_count"] == 0:
        return {
            "status": "skipped",
            "message": "All uploaded records already exist in the master dataset. No new records to add.",
            "duplicates_skipped": val_report["duplicate_count"],
            "dataset_size": len(master_df),
        }

    # Extract previous metrics for neutral comparison
    prev_metrics_path = REPORTS / "metrics.json"
    prev_mae: Optional[float] = None
    prev_r2: Optional[float] = None
    prev_model: Optional[str] = None
    if prev_metrics_path.exists():
        try:
            pm = json.loads(prev_metrics_path.read_text(encoding="utf-8"))
            prev_mae = pm.get("test", {}).get("mae")
            prev_r2 = pm.get("test", {}).get("r2")
            prev_model = pm.get("selected_model")
        except Exception:
            pass

    # 2. Prepare backups for safe failure recovery
    backup_master = DATA_RAW / f"{MASTER_DATASET_FILE}.bak"
    backup_model = MODELS / "final_model.joblib.bak"
    backup_metrics = REPORTS / "metrics.json.bak"
    backup_comparison = REPORTS / "model_comparison.csv.bak"

    try:
        if MASTER_DATASET_PATH.exists():
            shutil.copy2(MASTER_DATASET_PATH, backup_master)
        if (MODELS / "final_model.joblib").exists():
            shutil.copy2(MODELS / "final_model.joblib", backup_model)
        if prev_metrics_path.exists():
            shutil.copy2(prev_metrics_path, backup_metrics)
        if (REPORTS / "model_comparison.csv").exists():
            shutil.copy2(REPORTS / "model_comparison.csv", backup_comparison)

        # 3. Filter only new valid rows to append and canonicalize media_type
        existing_ids = set(master_df["post_id"].dropna().astype(str)) if not master_df.empty else set()
        new_rows = new_df[~new_df["post_id"].astype(str).isin(existing_ids)].copy()

        # Clean published_at to ISO string
        new_rows["published_at"] = pd.to_datetime(new_rows["published_at"], utc=True).dt.strftime("%Y-%m-%dT%H:%M:%SZ")

        # Canonicalize media_type: photo -> image
        if "media_type" in new_rows.columns:
            new_rows["media_type"] = new_rows["media_type"].astype(str).str.strip().str.lower().replace({"photo": "image"})

        # 4. Merge and sort chronologically
        merged_df = pd.concat([master_df, new_rows], ignore_index=True)
        if "media_type" in merged_df.columns:
            merged_df["media_type"] = merged_df["media_type"].astype(str).str.strip().str.lower().replace({"photo": "image"})
        merged_df["_sort_dt"] = pd.to_datetime(merged_df["published_at"], utc=True)
        merged_df = merged_df.sort_values("_sort_dt").drop(columns=["_sort_dt"]).reset_index(drop=True)

        # Save updated master dataset
        MASTER_DATASET_PATH.parent.mkdir(exist_ok=True)
        merged_df.to_csv(MASTER_DATASET_PATH, index=False)

        # 5. Run full training pipeline
        train_result = train_and_evaluate_corpus(MASTER_DATASET_PATH)

        new_test_mae = train_result["test_metrics"]["mae"]
        new_test_r2 = train_result["test_metrics"]["r2"]

        # Formulate neutral metric comparison
        mae_delta: Optional[float] = None
        r2_delta: Optional[float] = None
        eval_note = "Model retrained and evaluated on updated master corpus."
        if prev_mae is not None:
            mae_delta = round(new_test_mae - prev_mae, 3)
            r2_delta = round(new_test_r2 - (prev_r2 or 0.0), 3)
            if mae_delta < 0:
                eval_note = f"Lower test MAE in the latest evaluation ({mae_delta:+.2f} pp)."
            elif mae_delta > 0:
                eval_note = f"Test MAE increased in the latest evaluation ({mae_delta:+.2f} pp)."
            else:
                eval_note = "Test MAE remained identical to previous evaluation."

        # 6. Record dataset provenance
        provenance_entry = {
            "timestamp": pd.Timestamp.now(tz="UTC").isoformat(),
            "filename": filename,
            "rows_uploaded": int(val_report["total_uploaded"]),
            "rows_accepted": int(val_report["valid_count"]),
            "rows_rejected": int(val_report["invalid_count"]),
            "duplicates_skipped": int(val_report["duplicate_count"]),
            "rows_added": int(val_report["new_count"]),
            "previous_size": len(master_df),
            "resulting_size": len(merged_df),
            "selected_model": train_result["selected_model"],
            "previous_mae": prev_mae,
            "new_mae": new_test_mae,
            "mae_delta": mae_delta,
            "previous_r2": prev_r2,
            "new_r2": new_test_r2,
            "r2_delta": r2_delta,
            "evaluation_note": eval_note,
            "provenance_type": "Synthetic Simulation & Research Corpus",
        }
        append_provenance_record(provenance_entry)

        # Clean up temporary backups after success
        for bp in (backup_master, backup_model, backup_metrics, backup_comparison):
            if bp.exists():
                bp.unlink(missing_ok=True)

        return {
            "status": "success",
            "message": f"{val_report['new_count']} new posts added to master dataset. Models successfully retrained.",
            "rows_added": val_report["new_count"],
            "duplicates_skipped": val_report["duplicate_count"],
            "previous_size": len(master_df),
            "resulting_size": len(merged_df),
            "selected_model": train_result["selected_model"],
            "validation_mae": train_result["validation_mae"],
            "test_metrics": train_result["test_metrics"],
            "previous_mae": prev_mae,
            "new_mae": new_test_mae,
            "mae_delta": mae_delta,
            "previous_r2": prev_r2,
            "new_r2": new_test_r2,
            "r2_delta": r2_delta,
            "evaluation_note": eval_note,
            "provenance": provenance_entry,
        }

    except Exception as e:
        # Safe rollback: restore previous master dataset and model artifacts
        if backup_master.exists():
            shutil.copy2(backup_master, MASTER_DATASET_PATH)
            backup_master.unlink(missing_ok=True)
        if backup_model.exists():
            shutil.copy2(backup_model, MODELS / "final_model.joblib")
            backup_model.unlink(missing_ok=True)
        if backup_metrics.exists():
            shutil.copy2(backup_metrics, prev_metrics_path)
            backup_metrics.unlink(missing_ok=True)
        if backup_comparison.exists():
            shutil.copy2(backup_comparison, REPORTS / "model_comparison.csv")
            backup_comparison.unlink(missing_ok=True)

        raise RuntimeError(
            f"Dataset was validated, but model retraining failed. The previous active model remains in use. (Error: {str(e)})"
        )
