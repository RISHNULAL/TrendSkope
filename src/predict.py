"""Model artifact loading and prediction helpers."""
from __future__ import annotations
import joblib
import numpy as np
import pandas as pd
from .feature_engineering import build_features

def load_artifact(path):
    return joblib.load(path)

def predict_one(artifact: dict, post: dict) -> dict:
    df_raw = pd.DataFrame([post])
    features = build_features(df_raw)
    
    # Ensure any expected pipeline columns (e.g. historical features) exist
    expected_cols = artifact.get("feature_names", [])
    for col in expected_cols:
        if col not in features.columns:
            features[col] = np.nan
            
    raw = artifact["model"].predict(features)[0]
    predicted = float(np.expm1(raw))
    residual = artifact.get("interval_residual", 0.0)
    lower, upper = np.expm1([raw - residual, raw + residual])
    thresholds = artifact.get("thresholds", [1.0, 3.0])
    band = "Low" if predicted <= thresholds[0] else "Medium" if predicted <= thresholds[1] else "High"
    
    # Convert extracted features to clean dict for explainability / response
    feat_dict = {}
    for c in features.columns:
        val = features[c].iloc[0]
        if pd.notna(val):
            feat_dict[c] = float(val) if isinstance(val, (int, float, np.number)) else str(val)
            
    return {
        "prediction": round(predicted, 2),
        "lower": round(max(0.0, float(lower)), 2),
        "upper": round(float(upper), 2),
        "band": band,
        "features": feat_dict
    }
