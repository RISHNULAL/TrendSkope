from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Optional
import numpy as np
import pandas as pd
from fastapi import APIRouter, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from src.config import MODELS, REPORTS, ROOT
from src.data_cleaning import clean_posts, validate_posts
from src.predict import load_artifact, predict_one

app = FastAPI(
    title="TrendSkope API",
    description="AI-Powered Instagram Content Performance Intelligence API",
    version="1.0.0",
)

# Optional CORS middleware for development flexibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter()

# Cached artifact container
_MODEL_CACHE: Optional[dict[str, Any]] = None


def get_model_artifact() -> Optional[dict[str, Any]]:
    global _MODEL_CACHE
    model_path = MODELS / "final_model.joblib"
    if not model_path.exists():
        _MODEL_CACHE = None
        return None
    if _MODEL_CACHE is None:
        try:
            _MODEL_CACHE = load_artifact(model_path)
        except Exception:
            _MODEL_CACHE = None
    return _MODEL_CACHE


class PredictRequest(BaseModel):
    caption: str = Field(default="", description="Caption text")
    media_type: str = Field(default="image", description="Media type: image, carousel, or reel")
    followers_at_or_near_collection: Optional[int] = Field(
        default=1000, ge=1, description="Follower count at or near collection"
    )
    published_at: Optional[str] = Field(
        default=None, description="ISO timestamp of scheduled publication"
    )
    # Optional field aliases
    followers: Optional[int] = None
    date: Optional[str] = None
    time: Optional[str] = None


@router.get("/health")
def health_check():
    return {"status": "ok", "service": "TrendSkope API"}


@router.get("/model-status")
def get_model_status():
    model_path = MODELS / "final_model.joblib"
    metrics_path = REPORTS / "metrics.json"

    is_trained = model_path.exists()
    metrics_data = None

    if metrics_path.exists():
        try:
            metrics_data = json.loads(metrics_path.read_text(encoding="utf-8"))
        except Exception:
            metrics_data = None

    if not is_trained or not metrics_data:
        return {
            "trained": is_trained,
            "selected_model": None,
            "metrics": None,
            "dataset_size": None,
            "features_used": None,
            "splits": None,
        }

    return {
        "trained": True,
        "selected_model": metrics_data.get("selected_model"),
        "metrics": metrics_data.get("test"),
        "dataset_size": metrics_data.get("dataset_size"),
        "features_used": metrics_data.get("features_used"),
        "splits": metrics_data.get("splits"),
    }


@router.post("/predict")
def predict_engagement(payload: PredictRequest):
    artifact = get_model_artifact()
    if not artifact:
        raise HTTPException(
            status_code=400,
            detail="The trained model is not available. Please train the model with a validated dataset first.",
        )

    # Resolve followers
    followers_val = payload.followers_at_or_near_collection
    if payload.followers is not None and payload.followers > 0:
        followers_val = payload.followers
    if not followers_val or followers_val <= 0:
        followers_val = 1000

    # Resolve published_at
    pub_at = payload.published_at
    if not pub_at and payload.date:
        t = payload.time if payload.time else "19:00"
        pub_at = f"{payload.date}T{t}:00Z"
    if not pub_at:
        pub_at = pd.Timestamp.now(tz="UTC").isoformat()

    media_type_clean = (payload.media_type or "image").strip().lower()
    if media_type_clean not in ["image", "carousel", "reel"]:
        media_type_clean = "image"

    post = {
        "caption": payload.caption or "",
        "media_type": media_type_clean,
        "followers_at_or_near_collection": int(followers_val),
        "published_at": pub_at,
    }

    try:
        result = predict_one(artifact, post)
        return {"success": True, "result": result, "input": post}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction calculation failed: {str(e)}")


@router.get("/insights")
def get_insights():
    metrics_path = REPORTS / "metrics.json"
    comp_path = REPORTS / "model_comparison.csv"

    if not metrics_path.exists():
        return {
            "available": False,
            "message": "Model has not been trained yet. No experiment results found.",
            "metrics": None,
            "comparison": [],
        }

    try:
        metrics = json.loads(metrics_path.read_text(encoding="utf-8"))
    except Exception:
        metrics = None

    comparison = []
    if comp_path.exists():
        try:
            df = pd.read_csv(comp_path)
            comparison = df.to_dict(orient="records")
        except Exception:
            comparison = []

    return {
        "available": True,
        "metrics": metrics,
        "comparison": comparison,
    }


@router.post("/validate-csv")
async def validate_csv(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    try:
        contents = await file.read()
        import io
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV file: {str(e)}")

    errors = validate_posts(df)
    if errors:
        return {
            "valid": False,
            "errors": errors,
            "post_count": len(df),
            "preview": [],
        }

    cleaned = clean_posts(df)
    preview_rows = cleaned.head(5).fillna("").to_dict(orient="records")
    for row in preview_rows:
        for k, v in row.items():
            if isinstance(v, (pd.Timestamp, pd.Timedelta)):
                row[k] = str(v)
            elif isinstance(v, (np.integer, np.int64)):
                row[k] = int(v)
            elif isinstance(v, (np.floating, np.float64)):
                row[k] = float(v)

    return {
        "valid": True,
        "errors": [],
        "post_count": len(df),
        "preview": preview_rows,
    }


@router.get("/template")
def download_template():
    tpl_path = ROOT / "templates" / "instagram_posts_template.csv"
    if not tpl_path.exists():
        raise HTTPException(status_code=404, detail="Template file not found.")
    return FileResponse(
        path=str(tpl_path),
        filename="instagram_posts_template.csv",
        media_type="text/csv",
    )


# Mount router at root and with /api prefix for maximum Vercel & proxy compatibility
app.include_router(router)
app.include_router(router, prefix="/api")
