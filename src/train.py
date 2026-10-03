"""Chronological training script evaluating interpretable linear models.
Run: python -m src.train data/raw/posts.csv
"""
from __future__ import annotations
import json, sys
from pathlib import Path
import joblib, numpy as np, pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression, Ridge, Lasso, BayesianRidge
from sklearn.neighbors import KNeighborsRegressor
from sklearn.tree import DecisionTreeRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from .config import MODELS, REPORTS, RANDOM_STATE
from .data_cleaning import clean_posts, validate_posts
from .feature_engineering import add_target, build_features
from .historical_features import add_historical_features

NUMERIC = [
    "posting_hour", "posting_day_of_week", "posting_day", "posting_month", "is_weekend",
    "followers", "log_followers", "caption_length", "word_count", "hashtag_count",
    "mention_count", "url_count", "emoji_count", "exclamation_count", "question_count",
    "uppercase_ratio", "average_word_length", "historical_post_count",
    "historical_mean_engagement", "historical_median_engagement", "historical_std_engagement",
    "recent_5_median", "recent_10_median", "recent_20_median"
]
CATEGORICAL = ["media_type"]

def pipeline(model):
    pre = ColumnTransformer([
        ("num", Pipeline([("impute", SimpleImputer(strategy="median")), ("scale", StandardScaler())]), NUMERIC),
        ("cat", Pipeline([("impute", SimpleImputer(strategy="most_frequent")), ("onehot", OneHotEncoder(handle_unknown="ignore"))]), CATEGORICAL)
    ])
    return Pipeline([("preprocess", pre), ("model", model)])

def metrics(y, pred):
    return {
        "mae": float(mean_absolute_error(np.expm1(y), np.expm1(pred))),
        "rmse": float(mean_squared_error(np.expm1(y), np.expm1(pred)) ** 0.5),
        "r2": float(r2_score(y, pred)),
        "median_absolute_error": float(np.median(abs(np.expm1(y) - np.expm1(pred))))
    }

def main(csv_path: str):
    raw = pd.read_csv(csv_path)
    errors = validate_posts(raw)
    if errors:
        raise ValueError("; ".join(errors))

    data = add_historical_features(add_target(build_features(clean_posts(raw)))).sort_values("published_at")
    n = len(data)
    a, b = int(0.7 * n), int(0.85 * n)
    if a < 10 or b - a < 3 or n - b < 3:
        raise ValueError("At least 15 chronologically dated posts are required.")

    tr, va, te = data.iloc[:a], data.iloc[a:b], data.iloc[b:]

    candidates = {
        "Bayesian Ridge Regression": BayesianRidge(),
        "Ridge Regression": Ridge(alpha=2.0),
        "Linear Regression": LinearRegression(),
        "Lasso Regression": Lasso(alpha=0.01, random_state=RANDOM_STATE, max_iter=10000),
        "KNN Regressor": KNeighborsRegressor(n_neighbors=7),
        "Decision Tree Regressor": DecisionTreeRegressor(max_depth=5, min_samples_leaf=5, random_state=RANDOM_STATE)
    }

    rows = []
    fitted = {}
    for name, estimator in candidates.items():
        candidate = pipeline(estimator).fit(tr, tr.target)
        pred = candidate.predict(va)
        row = {"model": name, **metrics(va.target, pred)}
        rows.append(row)
        fitted[name] = candidate

    best_name = min(rows, key=lambda x: x["mae"])["model"]
    train_val = pd.concat([tr, va])
    best = pipeline(candidates[best_name]).fit(train_val, train_val.target)
    val_residual = np.quantile(abs(va.target - fitted[best_name].predict(va)), 0.9)
    test_metrics = metrics(te.target, best.predict(te))
    thresholds = np.quantile(tr.engagement_rate, [0.33, 0.67]).tolist()

    # Extract feature coefficients or importance if available
    cat_encoder = best.named_steps["preprocess"].named_transformers_["cat"].named_steps["onehot"]
    cat_names = list(cat_encoder.get_feature_names_out(CATEGORICAL))
    all_features = NUMERIC + cat_names

    feature_coefficients = []
    model_obj = best.named_steps["model"]
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

    joblib.dump({
        "model": best,
        "selected_model": best_name,
        "interval_residual": float(val_residual),
        "thresholds": thresholds,
        "feature_names": NUMERIC + CATEGORICAL,
        "feature_coefficients": feature_coefficients,
    }, MODELS / "final_model.joblib")

    pd.DataFrame(rows).to_csv(REPORTS / "model_comparison.csv", index=False)
    (REPORTS / "metrics.json").write_text(
        json.dumps({
            "test": test_metrics,
            "dataset_size": n,
            "features_used": len(NUMERIC) + len(CATEGORICAL),
            "selected_model": best_name,
            "splits": {
                "train": len(tr),
                "validation": len(va),
                "test": len(te)
            },
            "feature_coefficients": feature_coefficients
        }, indent=2)
    )
    print(f"Saved {best_name}; validation MAE: {min(rows, key=lambda x: x['mae'])['mae']:.3f}; test MAE: {test_metrics['mae']:.3f}")

if __name__ == "__main__":
    from .config import DATA_RAW
    target_path = sys.argv[1] if len(sys.argv) > 1 else str(DATA_RAW / "instagram_posts_1000.csv")
    main(target_path)


