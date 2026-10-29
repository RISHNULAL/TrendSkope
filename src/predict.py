"""Model artifact loading and prediction helpers for baseline and multimodal models."""
from __future__ import annotations

from typing import Any, Dict, Optional
import joblib
import numpy as np
import pandas as pd
from .feature_engineering import build_features


def load_artifact(path):
    return joblib.load(path)


def predict_one(
    artifact: dict,
    post: dict,
    media_features: Optional[Dict[str, Any]] = None
) -> dict:
    """
    Compute engagement rate prediction using trained model artifact.
    Seamlessly handles text-only posts, metadata, and extracted multimodal media features.
    """
    df_raw = pd.DataFrame([post])
    features = build_features(df_raw)
    
    # Merge media features if provided in argument or embedded in post dict
    m_feat = media_features or post.get("media_features") or {}
    for k, v in m_feat.items():
        if k not in features.columns:
            features[k] = v
            
    # Set explicit modality indicators
    if "has_media" not in features.columns:
        features["has_media"] = 1 if (m_feat and m_feat.get("has_media", 1)) else 0
    if "has_text" not in features.columns:
        features["has_text"] = 1 if (str(post.get("caption", "")).strip() != "") else 0
    if "audio_present" not in features.columns:
        features["audio_present"] = 1 if (m_feat and m_feat.get("audio_present", 0)) else 0

    # Ensure all expected pipeline columns exist (imputer will handle missing values)
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
        "features": feat_dict,
        "is_multimodal": bool(artifact.get("numeric_media") is not None),
        "modalities_used": {
            "text": True,
            "metadata_scheduling": True,
            "media_visual": bool(features["has_media"].iloc[0] == 1),
            "audio": bool(features["audio_present"].iloc[0] == 1)
        }
    }
