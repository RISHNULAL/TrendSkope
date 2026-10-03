from __future__ import annotations

import json
from pathlib import Path
from typing import Any, List, Optional
import numpy as np
import pandas as pd
from fastapi import APIRouter, FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from src.config import MODELS, REPORTS, ROOT
from src.data_cleaning import clean_posts, validate_posts
from src.dataset_manager import (
    MASTER_DATASET_PATH,
    get_provenance_history,
    merge_and_retrain,
    validate_uploaded_dataframe,
)
from src.predict import load_artifact, predict_one
from src.media_analysis import (
    analyze_image_bytes,
    analyze_carousel_images,
    analyze_video_bytes,
    analyze_audio_metadata,
    analyze_caption_text,
)
from src.recommendation import generate_content_report

app = FastAPI(
    title="TrendSkope API",
    description="AI-Powered Instagram Content Performance Intelligence API",
    version="2.0.0",
)

# CORS middleware
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
    # Optional aliases & context
    followers: Optional[int] = None
    date: Optional[str] = None
    time: Optional[str] = None
    category: Optional[str] = None
    goal: Optional[str] = None
    audio_name: Optional[str] = None
    audio_type: Optional[str] = None


class AnalyzeContentJsonRequest(BaseModel):
    caption: str = ""
    media_type: str = "image"
    followers: int = 1000
    date: Optional[str] = None
    time: Optional[str] = None
    category: Optional[str] = "General"
    goal: Optional[str] = "Engagement"
    audio_name: Optional[str] = None
    audio_type: Optional[str] = "original"


class ScenarioItem(BaseModel):
    caption: str = ""
    media_type: str = "image"
    followers: int = 1000
    date: Optional[str] = None
    time: Optional[str] = None
    category: Optional[str] = "General"
    goal: Optional[str] = "Engagement"
    audio_name: Optional[str] = None
    audio_type: Optional[str] = "original"
    audio_id: Optional[str] = None


class CompareScenariosRequest(BaseModel):
    scenario_a: ScenarioItem
    scenario_b: ScenarioItem
    comparison_mode: Optional[str] = "single"



@router.get("/health")
def health_check():
    return {"status": "ok", "service": "TrendSkope API", "version": "2.0.0"}


@router.get("/model-status")
def get_model_status():
    artifact = get_model_artifact()
    metrics_path = REPORTS / "metrics.json"

    metrics_data = None
    if metrics_path.exists():
        try:
            metrics_data = json.loads(metrics_path.read_text(encoding="utf-8"))
        except Exception:
            metrics_data = None

    if artifact is None or not metrics_data:
        return {
            "trained": False,
            "status": "not_ready",
            "reason": "Model artifact not found or unreadable" if artifact is None else "Evaluation metrics file missing",
            "selected_model": None,
            "metrics": None,
            "dataset_size": None,
            "features_used": None,
            "splits": None,
            "feature_coefficients": [],
        }

    return {
        "trained": True,
        "status": "ready",
        "selected_model": metrics_data.get("selected_model") or artifact.get("selected_model", "Ridge Regression"),
        "metrics": metrics_data.get("test"),
        "dataset_size": metrics_data.get("dataset_size"),
        "features_used": metrics_data.get("features_used"),
        "splits": metrics_data.get("splits"),
        "feature_coefficients": metrics_data.get("feature_coefficients", []),
    }


@router.get("/dashboard")
def get_dashboard_summary():
    artifact = get_model_artifact()
    metrics_path = REPORTS / "metrics.json"
    comp_path = REPORTS / "model_comparison.csv"
    data_path = ROOT / "data" / "raw" / "instagram_posts_1000.csv"

    metrics_data = None
    if metrics_path.exists():
        try:
            metrics_data = json.loads(metrics_path.read_text(encoding="utf-8"))
        except Exception:
            metrics_data = None

    model_comparison = []
    if comp_path.exists():
        try:
            cdf = pd.read_csv(comp_path)
            model_comparison = cdf.to_dict(orient="records")
        except Exception:
            model_comparison = []

    # Dataset intelligence and real quality calculation
    dataset_stats = {
        "posts": 0,
        "accounts": 0,
        "date_start": "",
        "date_end": "",
        "date_coverage": "",
        "media_types": {},
        "missing_values": 0,
        "duplicate_rows": 0,
        "rows": 0,
        "columns": 0,
        "invalid_records": 0,
        "required_fields_status": "Not Available",
        "quality_status": "Incomplete",
        "health": "Incomplete",
        "provenance": "Synthetic Research Corpus",
        "posts_over_time": [],
        "engagement_quartiles": {},
        "account_stats": {"avg_posts": 0, "min_posts": 0, "max_posts": 0},
        "provenance_history": get_provenance_history(),
    }

    if MASTER_DATASET_PATH.exists():
        try:
            df = pd.read_csv(MASTER_DATASET_PATH)
            rows_count = len(df)
            cols_count = len(df.columns)
            accounts_count = int(df["account_id"].nunique()) if "account_id" in df.columns else 0
            d_min = str(df["published_at"].min())[:10] if "published_at" in df.columns else ""
            d_max = str(df["published_at"].max())[:10] if "published_at" in df.columns else ""
            media_series = df["media_type"].astype(str).str.strip().str.lower().replace({"photo": "image"}) if "media_type" in df.columns else pd.Series([], dtype=str)
            media_breakdown = media_series.value_counts().to_dict()
            null_count = int(df.isnull().sum().sum())
            dup_count = int(df.duplicated(subset=["post_id"]).sum()) if "post_id" in df.columns else int(df.duplicated().sum())

            # Data quality evaluation
            required_cols = ["post_id", "account_id", "published_at", "media_type", "caption", "likes", "comments", "followers_at_or_near_collection"]
            missing_req = [c for c in required_cols if c not in df.columns]
            invalid_records = 0
            if "followers_at_or_near_collection" in df.columns:
                invalid_records += int((df["followers_at_or_near_collection"] <= 0).sum())

            if len(missing_req) == 0 and null_count == 0 and dup_count == 0 and invalid_records == 0:
                health_status = "Healthy"
            elif len(missing_req) == 0 and (null_count > 0 or dup_count > 0 or invalid_records > 0):
                health_status = "Needs Attention"
            else:
                health_status = "Incomplete"

            # Monthly timeline distribution
            posts_over_time = []
            try:
                dt_series = pd.to_datetime(df["published_at"], utc=True)
                monthly_counts = dt_series.dt.strftime("%Y-%m").value_counts().sort_index().to_dict()
                posts_over_time = [{"period": k, "count": int(v)} for k, v in monthly_counts.items()]
            except Exception:
                posts_over_time = []

            # Engagement quartiles
            engagement_quartiles = {}
            try:
                tot = df["likes"] + df["comments"] + df.get("saves", 0) + df.get("shares", 0)
                fol = df["followers_at_or_near_collection"].replace(0, 1)
                rates = 100.0 * tot / fol
                q1, q2, q3 = rates.quantile([0.25, 0.5, 0.75])
                engagement_quartiles = {
                    "q25": round(float(q1), 2),
                    "median": round(float(q2), 2),
                    "q75": round(float(q3), 2),
                    "mean": round(float(rates.mean()), 2),
                    "min": round(float(rates.min()), 2),
                    "max": round(float(rates.max()), 2),
                }
            except Exception:
                engagement_quartiles = {}

            # Account distribution stats
            account_stats = {"avg_posts": 25, "min_posts": 20, "max_posts": 32}
            if "account_id" in df.columns:
                ac_counts = df["account_id"].value_counts()
                account_stats = {
                    "avg_posts": round(float(ac_counts.mean()), 1),
                    "min_posts": int(ac_counts.min()),
                    "max_posts": int(ac_counts.max()),
                }

            dataset_stats = {
                "posts": rows_count,
                "accounts": accounts_count,
                "date_start": d_min,
                "date_end": d_max,
                "date_coverage": f"{d_min} to {d_max}" if d_min and d_max else "N/A",
                "media_types": media_breakdown,
                "missing_values": null_count,
                "duplicate_rows": dup_count,
                "rows": rows_count,
                "columns": cols_count,
                "invalid_records": invalid_records,
                "required_fields_status": "All 8 Core Fields Compliant" if len(missing_req) == 0 else f"Missing: {', '.join(missing_req)}",
                "quality_status": health_status,
                "health": health_status,
                "provenance": "Synthetic Research Corpus (10 Creator Domains, 40 Accounts)",
                "posts_over_time": posts_over_time,
                "engagement_quartiles": engagement_quartiles,
                "account_stats": account_stats,
                "provenance_history": get_provenance_history(),
            }
        except Exception as e:
            dataset_stats["health"] = "Needs Attention"
            dataset_stats["quality_status"] = f"Error: {str(e)}"

    # Last training timestamp
    last_training = ""
    model_path = MODELS / "final_model.joblib"
    if model_path.exists():
        try:
            mtime = model_path.stat().st_mtime
            last_training = pd.Timestamp.fromtimestamp(mtime, tz="UTC").isoformat()
        except Exception:
            pass

    is_ready = artifact is not None and metrics_data is not None
    selected_name = metrics_data.get("selected_model", "Bayesian Ridge Regression") if metrics_data else (artifact.get("selected_model", "Bayesian Ridge Regression") if artifact else "Bayesian Ridge Regression")

    # Find validation MAE for selected model from comparison
    validation_mae = None
    for r in model_comparison:
        if r.get("model") == selected_name:
            validation_mae = round(float(r.get("mae", 0)), 3)
            break

    model_summary = {
        "status": "ready" if is_ready else "not_ready",
        "status_label": "READY" if is_ready else "NOT READY",
        "system_status": "Operational" if is_ready else "Degraded",
        "name": selected_name,
        "active_model": selected_name,
        "target": "Engagement Rate",
        "target_formula": "log1p(engagement_rate)",
        "dataset_size": metrics_data.get("dataset_size", dataset_stats["posts"]) if metrics_data else dataset_stats["posts"],
        "features": metrics_data.get("features_used", 25) if metrics_data else 25,
        "last_training": last_training,
        "training_status": "Trained & Validated" if is_ready else "Awaiting Training",
        "validation_methodology": "Chronological Split (70% Train, 15% Validation, 15% Test)",
        "selection_metric": "Validation MAE",
        "splits": metrics_data.get("splits", {"train": 700, "validation": 150, "test": 150}) if metrics_data else None,
        "metrics": metrics_data.get("test") if metrics_data else None,
        "validation_mae": validation_mae,
        "coefficients": metrics_data.get("feature_coefficients", []) if metrics_data else [],
        "comparison": model_comparison,
    }

    return {
        "success": True,
        "system_status": "Operational" if is_ready else "Degraded",
        "model": model_summary,
        "dataset": dataset_stats,
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

    raw_media_type = (payload.media_type or "image").strip().lower()
    if raw_media_type in ["photo", "image"]:
        media_type_clean = "image"
    elif raw_media_type in ["carousel", "reel"]:
        media_type_clean = raw_media_type
    else:
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


@router.post("/analyze-content")
async def analyze_content_endpoint(
    file: Optional[UploadFile] = File(None),
    files: Optional[List[UploadFile]] = File(None),
    caption: str = Form(""),
    media_type: str = Form("image"),
    followers: int = Form(1000),
    date: Optional[str] = Form(None),
    time: Optional[str] = Form(None),
    category: Optional[str] = Form("General"),
    goal: Optional[str] = Form("Engagement"),
    audio_name: Optional[str] = Form(None),
    audio_type: Optional[str] = Form("original"),
):
    """
    Multimodal pre-publication analysis endpoint accepting multipart media upload (single or carousel multi-slide) and metadata.
    """
    # 1. Process Media File
    media_analysis: Optional[dict[str, Any]] = None
    raw_media_type = (media_type or "image").strip().lower()
    
    if raw_media_type in ["photo", "image"]:
        media_type_clean = "image"
    elif raw_media_type in ["reel", "video"]:
        media_type_clean = "reel"
    elif raw_media_type == "carousel":
        media_type_clean = "carousel"
    else:
        media_type_clean = "image"

    # Multi-file carousel handling
    if media_type_clean == "carousel":
        slides_data: List[tuple[bytes, str]] = []
        if files:
            for f in files:
                if f and f.filename:
                    f_bytes = await f.read()
                    slides_data.append((f_bytes, f.filename))
        elif file and file.filename:
            f_bytes = await file.read()
            slides_data.append((f_bytes, file.filename))
        
        if slides_data:
            media_analysis = analyze_carousel_images(slides_data)
    else:
        # Single file handling for Photo or Reel
        target_file = file
        if not target_file and files and len(files) > 0:
            target_file = files[0]

        if target_file and target_file.filename:
            filename = target_file.filename
            file_bytes = await target_file.read()
            lower_name = filename.lower()

            if media_type_clean == "reel" or any(lower_name.endswith(ext) for ext in [".mp4", ".mov", ".webm"]):
                media_analysis = analyze_video_bytes(file_bytes, filename=filename)
                media_type_clean = "reel"
            else:
                media_analysis = analyze_image_bytes(file_bytes, filename=filename)
                media_type_clean = "image"

    # 2. Process Caption
    caption_analysis = analyze_caption_text(caption)

    # 3. Process Audio
    has_audio_stream = bool(media_analysis and media_analysis.get("audio", {}).get("audio_detected"))
    audio_analysis = analyze_audio_metadata(
        audio_present=has_audio_stream,
        audio_name=audio_name,
        audio_type=audio_type,
    )

    # 4. Resolve Publication Timestamp & Context
    t = time if time else "19:00"
    d = date if date else pd.Timestamp.now(tz="UTC").strftime("%Y-%m-%d")
    pub_at = f"{d}T{t}:00Z"
    
    try:
        posting_hour = int(t.split(":")[0])
    except Exception:
        posting_hour = 19
        
    try:
        dt = pd.to_datetime(pub_at, utc=True)
        is_weekend = int(dt.dayofweek >= 5)
    except Exception:
        is_weekend = 0

    context = {
        "caption": caption,
        "media_type": media_type_clean,
        "followers": int(followers) if followers > 0 else 1000,
        "published_at": pub_at,
        "posting_hour": posting_hour,
        "is_weekend": is_weekend,
        "category": category or "General",
        "goal": goal or "Engagement",
    }

    # 5. Execute ML Prediction
    artifact = get_model_artifact()
    post_payload = {
        "caption": caption or "",
        "media_type": media_type_clean,
        "followers_at_or_near_collection": context["followers"],
        "published_at": pub_at,
    }

    prediction_data: dict[str, Any] = {}
    if artifact:
        try:
            pred_res = predict_one(artifact, post_payload)
            prediction_data = {
                "available": True,
                "expected_engagement_rate": pred_res.get("prediction", 0.0),
                "lower_bound": pred_res.get("lower", 0.0),
                "upper_bound": pred_res.get("upper", 0.0),
                "performance_band": pred_res.get("band", "Medium"),
                "features_extracted": pred_res.get("features", {}),
            }
        except Exception as e:
            prediction_data = {
                "available": False,
                "error": f"Prediction calculation error: {str(e)}",
                "expected_engagement_rate": 0.0,
                "lower_bound": 0.0,
                "upper_bound": 0.0,
                "performance_band": "Not Available",
            }
    else:
        prediction_data = {
            "available": False,
            "message": "Offline trained model artifact not found. Please train model.",
            "expected_engagement_rate": 0.0,
            "lower_bound": 0.0,
            "upper_bound": 0.0,
            "performance_band": "Not Trained",
        }

    # 6. Generate Comprehensive Report
    report = generate_content_report(
        prediction_result={
            "prediction": prediction_data.get("expected_engagement_rate", 0.0),
            "band": prediction_data.get("performance_band", "Medium"),
        },
        caption_analysis=caption_analysis,
        media_analysis=media_analysis,
        audio_analysis=audio_analysis,
        context=context,
        model_artifact=artifact,
    )

    return {
        "success": True,
        "prediction": prediction_data,
        "readiness": report["readiness"],
        "caption_analysis": caption_analysis,
        "media_analysis": media_analysis or {
            "available": False,
            "message": "No media uploaded (text/metadata analysis only)."
        },
        "audio_analysis": audio_analysis,
        "signals": report["signals"],
        "recommendations": report["recommendations"],
        "what_if_scenarios": report["what_if_scenarios"],
        "limitations": report["limitations"],
        "input": context,
    }


@router.post("/analyze-content-json")
def analyze_content_json_endpoint(payload: AnalyzeContentJsonRequest):
    """
    JSON version of the content analyzer for programmatic analysis without file uploads.
    """
    caption_analysis = analyze_caption_text(payload.caption)
    audio_analysis = analyze_audio_metadata(
        audio_present=payload.media_type == "reel",
        audio_name=payload.audio_name,
        audio_type=payload.audio_type,
    )

    t = payload.time if payload.time else "19:00"
    d = payload.date if payload.date else pd.Timestamp.now(tz="UTC").strftime("%Y-%m-%d")
    pub_at = f"{d}T{t}:00Z"

    try:
        posting_hour = int(t.split(":")[0])
    except Exception:
        posting_hour = 19
        
    try:
        dt = pd.to_datetime(pub_at, utc=True)
        is_weekend = int(dt.dayofweek >= 5)
    except Exception:
        is_weekend = 0

    raw_media_type = (payload.media_type or "image").strip().lower()
    media_type_clean = "image" if raw_media_type in ["photo", "image"] else raw_media_type if raw_media_type in ["carousel", "reel"] else "image"

    context = {
        "caption": payload.caption,
        "media_type": media_type_clean,
        "followers": payload.followers,
        "published_at": pub_at,
        "posting_hour": posting_hour,
        "is_weekend": is_weekend,
        "category": payload.category,
        "goal": payload.goal,
    }

    artifact = get_model_artifact()
    post_payload = {
        "caption": payload.caption,
        "media_type": media_type_clean,
        "followers_at_or_near_collection": payload.followers,
        "published_at": pub_at,
    }

    prediction_data: dict[str, Any] = {}
    if artifact:
        try:
            pred_res = predict_one(artifact, post_payload)
            prediction_data = {
                "available": True,
                "expected_engagement_rate": pred_res.get("prediction", 0.0),
                "lower_bound": pred_res.get("lower", 0.0),
                "upper_bound": pred_res.get("upper", 0.0),
                "performance_band": pred_res.get("band", "Medium"),
                "features_extracted": pred_res.get("features", {}),
            }
        except Exception as e:
            prediction_data = {
                "available": False,
                "error": str(e),
                "expected_engagement_rate": 0.0,
                "lower_bound": 0.0,
                "upper_bound": 0.0,
                "performance_band": "Not Available",
            }
    else:
        prediction_data = {
            "available": False,
            "expected_engagement_rate": 0.0,
            "lower_bound": 0.0,
            "upper_bound": 0.0,
            "performance_band": "Not Trained",
        }

    report = generate_content_report(
        prediction_result={
            "prediction": prediction_data.get("expected_engagement_rate", 0.0),
            "band": prediction_data.get("performance_band", "Medium"),
        },
        caption_analysis=caption_analysis,
        media_analysis=None,
        audio_analysis=audio_analysis,
        context=context,
        model_artifact=artifact,
    )

    return {
        "success": True,
        "prediction": prediction_data,
        "readiness": report["readiness"],
        "caption_analysis": caption_analysis,
        "media_analysis": {
            "available": False,
            "message": "No media uploaded (text/metadata mode)."
        },
        "audio_analysis": audio_analysis,
        "signals": report["signals"],
        "recommendations": report["recommendations"],
        "what_if_scenarios": report["what_if_scenarios"],
        "limitations": report["limitations"],
        "input": context,
    }


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

    report = validate_uploaded_dataframe(df)
    return {
        "valid": report["valid"],
        "total_uploaded": report["total_uploaded"],
        "valid_count": report["valid_count"],
        "invalid_count": report["invalid_count"],
        "duplicate_count": report["duplicate_count"],
        "new_count": report["new_count"],
        "errors": report["errors"],
        "invalid_details": report["invalid_details"],
        "duplicate_ids": report["duplicate_ids"],
        "current_master_size": report["current_master_size"],
        "projected_master_size": report["projected_master_size"],
        "preview": report["preview"],
        "status_message": report["status_message"],
        "post_count": report["total_uploaded"],
    }


@router.post("/add-and-retrain")
async def add_and_retrain_endpoint(file: UploadFile = File(...)):
    global _MODEL_CACHE
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    try:
        contents = await file.read()
        import io
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV file: {str(e)}")

    try:
        result = merge_and_retrain(df, filename=file.filename)
        _MODEL_CACHE = None  # Invalidate cached artifact so new model loads immediately
        return {
            "success": True,
            **result,
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except RuntimeError as re:
        raise HTTPException(status_code=500, detail=str(re))
    except Exception as ex:
        raise HTTPException(status_code=500, detail=f"Unexpected error during retraining: {str(ex)}")


@router.get("/dataset-provenance")
def get_provenance_endpoint():
    return {
        "success": True,
        "history": get_provenance_history(),
    }


@router.post("/compare-scenarios")
def compare_scenarios_endpoint(payload: CompareScenariosRequest):
    """
    Scenario studio comparison endpoint comparing two complete planned posts.
    Calculates model predictions, delta, uncertainty intervals, caption/audio signals,
    detected differences, sensitivity analysis, and actionable next test recommendations.
    """
    artifact = get_model_artifact()
    if not artifact:
        raise HTTPException(
            status_code=400,
            detail="The trained model is not available. Please train the model with a validated dataset first.",
        )

    item_a = payload.scenario_a
    item_b = payload.scenario_b

    # Resolve Scenario A publication & media
    t_a = item_a.time if item_a.time else "14:00"
    d_a = item_a.date if item_a.date else pd.Timestamp.now(tz="UTC").strftime("%Y-%m-%d")
    pub_a = f"{d_a}T{t_a}:00Z"
    raw_media_a = (item_a.media_type or "image").strip().lower()
    media_a = "image" if raw_media_a in ["photo", "image"] else raw_media_a if raw_media_a in ["carousel", "reel"] else "image"
    fol_a = item_a.followers if item_a.followers and item_a.followers > 0 else 1000

    # Resolve Scenario B publication & media
    t_b = item_b.time if item_b.time else "19:00"
    d_b = item_b.date if item_b.date else pd.Timestamp.now(tz="UTC").strftime("%Y-%m-%d")
    pub_b = f"{d_b}T{t_b}:00Z"
    raw_media_b = (item_b.media_type or "image").strip().lower()
    media_b = "image" if raw_media_b in ["photo", "image"] else raw_media_b if raw_media_b in ["carousel", "reel"] else "image"
    fol_b = item_b.followers if item_b.followers and item_b.followers > 0 else 1000

    post_a = {
        "caption": item_a.caption or "",
        "media_type": media_a,
        "followers_at_or_near_collection": int(fol_a),
        "published_at": pub_a,
    }

    post_b = {
        "caption": item_b.caption or "",
        "media_type": media_b,
        "followers_at_or_near_collection": int(fol_b),
        "published_at": pub_b,
    }

    try:
        res_a = predict_one(artifact, post_a)
        res_b = predict_one(artifact, post_b)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison calculation failed: {str(e)}")

    pred_val_a = float(res_a["prediction"])
    pred_val_b = float(res_b["prediction"])
    delta_pp = round(pred_val_b - pred_val_a, 2)
    delta_dir = "higher" if delta_pp > 0 else "lower" if delta_pp < 0 else "neutral"

    # Uncertainty overlap test
    overlap = bool(max(res_a["lower"], res_b["lower"]) <= min(res_a["upper"], res_b["upper"]))
    if overlap:
        overlap_exp = "The estimated difference should be interpreted cautiously because the scenario uncertainty intervals overlap."
    else:
        overlap_exp = "The estimated scenario intervals are distinct with minimal uncertainty overlap under current model variance."

    # Linguistic and Audio Signals
    cap_a = analyze_caption_text(item_a.caption or "")
    cap_b = analyze_caption_text(item_b.caption or "")
    aud_a = analyze_audio_metadata(
        audio_present=media_a == "reel",
        audio_name=item_a.audio_name,
        audio_type=item_a.audio_type,
        audio_id=item_a.audio_id,
    )
    aud_b = analyze_audio_metadata(
        audio_present=media_b == "reel",
        audio_name=item_b.audio_name,
        audio_type=item_b.audio_type,
        audio_id=item_b.audio_id,
    )

    # Detect Changed & Unchanged Parameters
    changed = []
    unchanged = []
    changed_inputs_for_model = []

    # 1. Media Type
    if media_a != media_b:
        changed.append({
            "field": "media_type",
            "label": "Media Type",
            "value_a": media_a.capitalize(),
            "value_b": media_b.capitalize(),
            "impact_note": "Evaluated by trained model via categorical media encoding.",
        })
        changed_inputs_for_model.append("Media type")
    else:
        unchanged.append({
            "field": "media_type",
            "label": "Media Type",
            "value": media_a.capitalize(),
        })

    # 2. Caption
    if (item_a.caption or "").strip() != (item_b.caption or "").strip():
        changed.append({
            "field": "caption",
            "label": "Caption Content",
            "value_a": f"{len(item_a.caption or '')} chars ({cap_a['metrics']['words']} words, {cap_a['metrics']['hashtags']} tags)",
            "value_b": f"{len(item_b.caption or '')} chars ({cap_b['metrics']['words']} words, {cap_b['metrics']['hashtags']} tags)",
            "impact_note": "Linguistic, length, and hashtag counts feed into model features.",
        })
        changed_inputs_for_model.append("Caption features (length, word count, hashtag count, emojis, uppercase ratio)")
    else:
        unchanged.append({
            "field": "caption",
            "label": "Caption Content",
            "value": f"{len(item_a.caption or '')} chars",
        })

    # 3. Followers
    if fol_a != fol_b:
        changed.append({
            "field": "followers",
            "label": "Followers",
            "value_a": f"{fol_a:,}",
            "value_b": f"{fol_b:,}",
            "impact_note": "Log-follower scaling modifies engagement rate baseline.",
        })
        changed_inputs_for_model.append("Followers count")
    else:
        unchanged.append({
            "field": "followers",
            "label": "Followers",
            "value": f"{fol_a:,}",
        })

    # 4. Date
    if d_a != d_b:
        changed.append({
            "field": "date",
            "label": "Publication Date",
            "value_a": d_a,
            "value_b": d_b,
            "impact_note": "Day-of-week and weekend indicators affect timing weights.",
        })
        changed_inputs_for_model.append("Publication date / Day of week")
    else:
        unchanged.append({
            "field": "date",
            "label": "Publication Date",
            "value": d_a,
        })

    # 5. Time
    if t_a != t_b:
        changed.append({
            "field": "time",
            "label": "Posting Time (UTC)",
            "value_a": t_a,
            "value_b": t_b,
            "impact_note": "Posting hour feature sensitivity evaluated by model.",
        })
        changed_inputs_for_model.append("Posting time / hour")
    else:
        unchanged.append({
            "field": "time",
            "label": "Posting Time (UTC)",
            "value": t_a,
        })

    # 6. Audio (Only evaluated if at least one scenario is a Reel)
    if media_a == "reel" or media_b == "reel":
        name_a = (item_a.audio_name or ("Original Audio" if (item_a.audio_type or "original") == "original" else "Selected Reel Audio")) if media_a == "reel" else "Not applicable (Image/Carousel)"
        name_b = (item_b.audio_name or ("Original Audio" if (item_b.audio_type or "original") == "original" else "Selected Reel Audio")) if media_b == "reel" else "Not applicable (Image/Carousel)"
        if name_a != name_b:
            changed.append({
                "field": "audio",
                "label": "Planned Audio",
                "value_a": name_a,
                "value_b": name_b,
                "impact_note": "Audio metadata logged for Reel creative planning (not a trained predictive input).",
            })
        else:
            unchanged.append({
                "field": "audio",
                "label": "Planned Audio",
                "value": name_a,
            })


    # Model Sensitivity Summary
    if delta_pp > 0:
        sens_exp = f"The model estimate changed by +{delta_pp:.2f} percentage points after the selected scenario changes."
    elif delta_pp < 0:
        sens_exp = f"The model estimate changed by {delta_pp:.2f} percentage points after the selected scenario changes."
    else:
        sens_exp = "The model estimate remained identical between both scenario configurations."

    # Actionable "What You Could Test Next" recommendations
    recs = []
    if "Posting time / hour" not in changed_inputs_for_model:
        recs.append("Test model sensitivity to peak engagement hours (e.g., test 19:00 UTC vs 11:00 UTC).")
    if "Caption features (length, word count, hashtag count, emojis, uppercase ratio)" not in changed_inputs_for_model:
        recs.append("Test caption structure by comparing a concise question-driven caption with a detailed storytelling format.")
    if "Media type" not in changed_inputs_for_model:
        recs.append("Test format sensitivity by comparing an Image post against a Reel under the same caption and timing.")
    if len(recs) < 3:
        recs.append("Test hashtag allocation by comparing a focused tag set (3–5 tags) with broad category tags.")
        recs.append("Test follower tier sensitivity to evaluate how audience scaling impacts predicted baseline rates.")

    return {
        "success": True,
        "comparison": {
            "prediction_a": res_a,
            "prediction_b": res_b,
            "delta_pp": delta_pp,
            "delta_direction": delta_dir,
            "intervals_overlap": overlap,
            "overlap_explanation": overlap_exp,
            "caption_a": cap_a,
            "caption_b": cap_b,
            "audio_a": aud_a,
            "audio_b": aud_b,
            "changed_parameters": changed,
            "unchanged_parameters": unchanged,
            "model_sensitivity": {
                "delta_pp": delta_pp,
                "changed_inputs": changed_inputs_for_model if changed_inputs_for_model else ["No model-consumed inputs modified"],
                "explanation": sens_exp,
            },
            "recommendations": recs[:3],
            "multimodal_readiness": {
                "status": "Structured & Caption Features Active",
                "message": "Current model predictions use historical structured and text features. Visual and audio signals are analyzed for creative planning and will be integrated into future multimodal model training.",
                "is_multimodal_active": False,
            },
        },
        "input_a": item_a.model_dump(),
        "input_b": item_b.model_dump(),
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
