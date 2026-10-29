"""
Multimodal Model Training and Evaluation Pipeline.
Compares Text/Metadata Baseline vs Multimodal Model using chronological splits,
zero leakage, explicit missing-modality indicators, and rigorous validation metrics.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Tuple
import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import BayesianRidge, LinearRegression, Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.tree import DecisionTreeRegressor

from src.config import (
    MODELS,
    MULTIMODAL_FEATURES_CSV,
    RANDOM_STATE,
    REPORTS,
)
from src.data_cleaning import clean_posts
from src.feature_engineering import add_target, build_features
from src.historical_features import add_historical_features

# Base features (text, schedule, followers, chronological history)
NUMERIC_BASE = [
    "posting_hour", "posting_day_of_week", "posting_day", "posting_month", "is_weekend",
    "followers", "log_followers", "caption_length", "word_count", "hashtag_count",
    "mention_count", "url_count", "emoji_count", "exclamation_count", "question_count",
    "uppercase_ratio", "average_word_length", "historical_post_count",
    "historical_mean_engagement", "historical_median_engagement", "historical_std_engagement",
    "recent_5_median", "recent_10_median", "recent_20_median"
]

# Extracted observable media features
NUMERIC_MEDIA = [
    "brightness_pct", "rms_contrast", "saturation_pct", "sharpness_var",
    "overall_quality", "motion_intensity", "scene_change_count",
    "audio_bpm", "audio_loudness_db", "carousel_slide_count"
]

# Explicit modality presence masks
MODALITY_MASKS = ["has_media", "has_text", "audio_present"]

CATEGORICAL = ["media_type"]


def build_baseline_pipeline(model):
    pre = ColumnTransformer([
        ("num", Pipeline([("impute", SimpleImputer(strategy="median")), ("scale", StandardScaler())]), NUMERIC_BASE),
        ("cat", Pipeline([("impute", SimpleImputer(strategy="most_frequent")), ("onehot", OneHotEncoder(handle_unknown="ignore"))]), CATEGORICAL)
    ])
    return Pipeline([("preprocess", pre), ("model", model)])


def build_multimodal_pipeline(model):
    all_numeric = NUMERIC_BASE + NUMERIC_MEDIA + MODALITY_MASKS
    pre = ColumnTransformer([
        ("num", Pipeline([("impute", SimpleImputer(strategy="median")), ("scale", StandardScaler())]), all_numeric),
        ("cat", Pipeline([("impute", SimpleImputer(strategy="most_frequent")), ("onehot", OneHotEncoder(handle_unknown="ignore"))]), CATEGORICAL)
    ])
    return Pipeline([("preprocess", pre), ("model", model)])


def compute_metrics(y_true, y_pred):
    true_rate = np.expm1(y_true)
    pred_rate = np.expm1(y_pred)
    return {
        "mae": round(float(mean_absolute_error(true_rate, pred_rate)), 4),
        "rmse": round(float(mean_squared_error(true_rate, pred_rate) ** 0.5), 4),
        "r2": round(float(r2_score(y_true, y_pred)), 4),
        "median_absolute_error": round(float(np.median(abs(true_rate - pred_rate))), 4)
    }


def train_multimodal_models(csv_path: Optional[Path] = None) -> Dict[str, Any]:
    dataset_path = csv_path or MULTIMODAL_FEATURES_CSV
    if not dataset_path.exists():
        raise FileNotFoundError(f"Multimodal dataset not found at {dataset_path}")

    raw_df = pd.read_csv(dataset_path)
    print(f"Loading {len(raw_df):,} records for multimodal modeling...")

    # Data cleaning and feature engineering
    cleaned = clean_posts(raw_df)
    with_features = build_features(cleaned)
    with_target = add_target(with_features)
    full_data = add_historical_features(with_target).sort_values("published_at").reset_index(drop=True)

    n = len(full_data)
    idx_val = int(0.70 * n)
    idx_test = int(0.85 * n)

    tr = full_data.iloc[:idx_val]
    va = full_data.iloc[idx_val:idx_test]
    te = full_data.iloc[idx_test:]

    print(f"Chronological Splits: Train={len(tr):,}, Val={len(va):,}, Test={len(te):,}")

    # 1. Baseline Model (Text & History Only)
    baseline_estimator = Ridge(alpha=2.0)
    baseline_pipe = build_baseline_pipeline(baseline_estimator).fit(tr, tr.target)
    baseline_val_pred = baseline_pipe.predict(va)
    baseline_test_pred = baseline_pipe.predict(te)
    baseline_test_metrics = compute_metrics(te.target, baseline_test_pred)

    # 2. Multimodal Model (Text + Media Features + Modality Masks)
    multimodal_candidates = {
        "Multimodal Ridge Regression": Ridge(alpha=2.0),
        "Multimodal Bayesian Ridge": BayesianRidge(),
        "Multimodal Decision Tree": DecisionTreeRegressor(max_depth=6, min_samples_leaf=10, random_state=RANDOM_STATE)
    }

    val_results = []
    fitted_multimodal = {}
    for name, estimator in multimodal_candidates.items():
        pipe = build_multimodal_pipeline(estimator).fit(tr, tr.target)
        pred_va = pipe.predict(va)
        m = compute_metrics(va.target, pred_va)
        val_results.append({"model": name, **m})
        fitted_multimodal[name] = pipe

    # Select best multimodal candidate by validation MAE
    best_multimodal_name = min(val_results, key=lambda x: x["mae"])["model"]
    best_candidate_obj = multimodal_candidates[best_multimodal_name]

    # Refit best candidate on train + val
    train_val = pd.concat([tr, va])
    final_multimodal_pipe = build_multimodal_pipeline(best_candidate_obj).fit(train_val, train_val.target)
    
    # Evaluate final multimodal model on held-out test set
    multimodal_test_pred = final_multimodal_pipe.predict(te)
    multimodal_test_metrics = compute_metrics(te.target, multimodal_test_pred)

    # Uncertainty residual
    val_pred_best = fitted_multimodal[best_multimodal_name].predict(va)
    interval_residual = float(np.quantile(abs(va.target - val_pred_best), 0.90))
    thresholds = [float(x) for x in np.quantile(tr.engagement_rate, [0.33, 0.67])]

    # Extract feature importance / coefficients
    coef_list = []
    model_obj = final_multimodal_pipe.named_steps["model"]
    cat_encoder = final_multimodal_pipe.named_steps["preprocess"].named_transformers_["cat"].named_steps["onehot"]
    cat_names = list(cat_encoder.get_feature_names_out(CATEGORICAL))
    all_feature_names = NUMERIC_BASE + NUMERIC_MEDIA + MODALITY_MASKS + cat_names

    if hasattr(model_obj, "coef_"):
        coefs = model_obj.coef_
        for feat_name, c_val in zip(all_feature_names, coefs):
            coef_list.append({
                "feature": feat_name,
                "coefficient": round(float(c_val), 6),
                "abs_coefficient": round(abs(float(c_val)), 6),
                "modality": "Media / Visual / Audio" if feat_name in NUMERIC_MEDIA or feat_name in MODALITY_MASKS else "Text / Historical"
            })
        coef_list.sort(key=lambda x: x["abs_coefficient"], reverse=True)

    # Evaluate on media-equipped subset in test set (if any)
    te_media = te[te["has_media"] == 1]
    media_subset_metrics = None
    if len(te_media) >= 3:
        sub_base_pred = baseline_pipe.predict(te_media)
        sub_multi_pred = final_multimodal_pipe.predict(te_media)
        media_subset_metrics = {
            "sample_size": len(te_media),
            "baseline_mae": compute_metrics(te_media.target, sub_base_pred)["mae"],
            "multimodal_mae": compute_metrics(te_media.target, sub_multi_pred)["mae"],
        }

    # Model comparison summary
    comparison_table = [
        {
            "model_type": "Baseline (Text & Schedule Only)",
            "selected_model": "Ridge Regression",
            "features_count": len(NUMERIC_BASE) + len(cat_names),
            "test_mae": baseline_test_metrics["mae"],
            "test_rmse": baseline_test_metrics["rmse"],
            "test_r2": baseline_test_metrics["r2"],
        },
        {
            "model_type": "Multimodal (Text + Media Features + Masks)",
            "selected_model": best_multimodal_name,
            "features_count": len(all_feature_names),
            "test_mae": multimodal_test_metrics["mae"],
            "test_rmse": multimodal_test_metrics["rmse"],
            "test_r2": multimodal_test_metrics["r2"],
        }
    ]

    comp_df = pd.DataFrame(comparison_table)
    comp_df.to_csv(REPORTS / "multimodal_comparison.csv", index=False)

    # Save artifacts
    multimodal_artifact = {
        "model": final_multimodal_pipe,
        "selected_model": best_multimodal_name,
        "feature_names": all_feature_names,
        "numeric_base": NUMERIC_BASE,
        "numeric_media": NUMERIC_MEDIA,
        "modality_masks": MODALITY_MASKS,
        "categorical": CATEGORICAL,
        "thresholds": thresholds,
        "interval_residual": interval_residual,
        "dataset_size": n,
        "metrics": multimodal_test_metrics,
        "baseline_metrics": baseline_test_metrics,
        "splits": {"train": len(tr), "validation": len(va), "test": len(te)},
        "top_coefficients": coef_list[:15],
    }
    joblib.dump(multimodal_artifact, MODELS / "multimodal_model.joblib")

    # Save comprehensive metrics JSON
    metrics_summary = {
        "model_name": best_multimodal_name,
        "trained_records": n,
        "splits": {"train": len(tr), "validation": len(va), "test": len(te)},
        "features_used": len(all_feature_names),
        "modality_counts": {
            "text_features": len(NUMERIC_BASE),
            "media_features": len(NUMERIC_MEDIA),
            "modality_masks": len(MODALITY_MASKS),
            "categorical_features": len(cat_names)
        },
        "baseline_test_metrics": baseline_test_metrics,
        "multimodal_test_metrics": multimodal_test_metrics,
        "media_subset_evaluation": media_subset_metrics,
        "delta_mae": round(multimodal_test_metrics["mae"] - baseline_test_metrics["mae"], 4),
        "scientific_integrity_note": (
            "Model evaluated on chronological test split with strictly prior historical features. "
            "Explicit missing-modality masks preserve valid predictions across posts with and without physical media assets."
        ),
        "top_coefficients": coef_list[:15]
    }

    with open(REPORTS / "multimodal_metrics.json", "w", encoding="utf-8") as f:
        json.dump(metrics_summary, f, indent=2)

    print("Multimodal Model Training & Evaluation complete!")
    print(f"Baseline Test MAE: {baseline_test_metrics['mae']} | Multimodal Test MAE: {multimodal_test_metrics['mae']}")
    return metrics_summary


if __name__ == "__main__":
    train_multimodal_models()
