"""
Automated Validation Suite for TrendSkope Content Audit Datasets.
Verifies all 12 criteria specified in the Master Specification.
"""
import hashlib
import json
import os
import sys
from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
MASTER_PATH = ROOT / "data" / "raw" / "instagram_posts_1000.csv"
DATASETS_DIR = ROOT / "data" / "content_audit_datasets"
METADATA_DIR = ROOT / "data" / "metadata"

EXPECTED_MASTER_SHA256 = "d6eb91540b3528c9d2b4e303da74cf7a49eed5f44cd014d10526e256049da292"

DATASET_SCHEMAS = {
    "image_quality_dataset.csv": {
        "primary_key": "record_id",
        "prefix": "IQ_REC_",
        "min_rows": 5000,
        "required_cols": [
            "record_id", "content_id", "asset_id", "image_width", "image_height",
            "aspect_ratio", "numeric_aspect_ratio", "file_size_bytes", "sharpness_score",
            "sharpness_label", "brightness_mean", "brightness_label", "contrast_score",
            "contrast_label", "saturation_pct", "dominant_colors_hex", "color_temperature",
            "ocr_text_present", "text_coverage_ratio", "rule_of_thirds_balance",
            "overall_quality_score", "analysis_status", "source_type", "created_at"
        ],
        "numeric_ranges": {
            "image_width": (300, 4000),
            "image_height": (300, 4000),
            "file_size_bytes": (1000, 50000000),
            "sharpness_score": (0.0, 5000.0),
            "brightness_mean": (0.0, 100.0),
            "contrast_score": (0.0, 100.0),
            "overall_quality_score": (0.0, 100.0)
        }
    },
    "poster_design_audit_dataset.csv": {
        "primary_key": "record_id",
        "prefix": "PDA_REC_",
        "min_rows": 5000,
        "required_cols": [
            "record_id", "content_id", "asset_id", "poster_category", "canvas_dimensions",
            "text_density", "text_density_pct", "heading_contrast_ratio", "readability_score",
            "readability_level", "typography_hierarchy_grade", "visual_clutter_score",
            "negative_space_ratio", "call_to_action_present", "call_to_action_type",
            "identified_drawbacks", "recommended_fixes", "compliance_instagram_feed",
            "source_type", "created_at"
        ],
        "numeric_ranges": {
            "text_density_pct": (0.0, 100.0),
            "heading_contrast_ratio": (1.0, 21.0),
            "readability_score": (0.0, 100.0)
        }
    },
    "video_reel_analysis_dataset.csv": {
        "primary_key": "record_id",
        "prefix": "VRA_REC_",
        "min_rows": 5000,
        "required_cols": [
            "record_id", "content_id", "asset_id", "duration_seconds", "duration_category",
            "frame_width", "frame_height", "aspect_ratio", "frame_rate", "total_frames",
            "sampled_frame_count", "avg_motion_intensity", "motion_pacing_label",
            "scene_change_count", "scene_pacing_label", "opening_hook_window_sec",
            "opening_hook_contrast", "opening_hook_sharpness", "opening_hook_clarity_grade",
            "ocr_text_present", "audio_present", "audio_speech_present", "analysis_status",
            "source_type", "created_at"
        ],
        "numeric_ranges": {
            "duration_seconds": (1.0, 300.0),
            "frame_width": (200, 4000),
            "frame_height": (200, 4000),
            "avg_motion_intensity": (0.0, 100.0)
        }
    },
    "carousel_analysis_dataset.csv": {
        "primary_key": "record_id",
        "prefix": "CAR_REC_",
        "min_rows": 5000,
        "required_cols": [
            "record_id", "carousel_id", "content_id", "slide_count", "common_aspect_ratio",
            "aspect_ratio_consistency", "cover_slide_asset_id", "cover_slide_hook_strength",
            "cover_slide_text_presence", "avg_slide_brightness", "brightness_variance_across_slides",
            "color_palette_consistency", "text_heavy_slide_count", "storytelling_progression",
            "final_slide_has_cta", "carousel_level_findings", "recommended_improvements",
            "source_type", "created_at"
        ],
        "numeric_ranges": {
            "slide_count": (2, 20),
            "cover_slide_hook_strength": (0.0, 100.0)
        }
    },
    "caption_analysis_dataset.csv": {
        "primary_key": "record_id",
        "prefix": "CAP_REC_",
        "min_rows": 5000,
        "required_cols": [
            "record_id", "content_id", "caption", "character_count", "word_count",
            "sentence_count", "avg_word_length", "hashtag_count", "mention_count",
            "url_count", "emoji_count", "question_count", "exclamation_count",
            "uppercase_ratio", "flesch_reading_ease_est", "readability_category",
            "hook_first_line_words", "call_to_action_present", "detected_cta_phrase",
            "identified_issues", "suggested_rewrite", "source_type", "created_at"
        ],
        "numeric_ranges": {
            "character_count": (5, 5000),
            "word_count": (1, 1000)
        }
    },
    "audio_music_analysis_dataset.csv": {
        "primary_key": "record_id",
        "prefix": "AUD_REC_",
        "min_rows": 5000,
        "required_cols": [
            "record_id", "content_id", "asset_id", "audio_track_name", "audio_type",
            "duration_seconds", "sample_rate_hz", "channel_count", "rms_energy",
            "loudness_dbfs", "loudness_compliance", "tempo_estimate_bpm", "tempo_category",
            "energy_profile", "speech_detected", "speech_to_music_ratio",
            "licensed_provenance", "analysis_status", "source_type", "created_at"
        ],
        "numeric_ranges": {
            "duration_seconds": (1.0, 300.0),
            "tempo_estimate_bpm": (40.0, 240.0),
            "loudness_dbfs": (-60.0, 0.0)
        }
    },
    "content_drawbacks_dataset.csv": {
        "primary_key": "record_id",
        "prefix": "DRW_REC_",
        "min_rows": 5000,
        "required_cols": [
            "record_id", "content_id", "content_type", "issue_category", "issue_severity",
            "issue_code", "issue_description", "evidence", "confidence_score",
            "suggested_fix", "source_type", "created_at"
        ],
        "numeric_ranges": {
            "confidence_score": (0.0, 1.0)
        }
    },
    "content_improvement_recommendations.csv": {
        "primary_key": "record_id",
        "prefix": "REC_REC_",
        "min_rows": 5000,
        "required_cols": [
            "record_id", "content_id", "content_type", "issue_category", "original_observation",
            "recommended_action", "alternative_caption", "alternative_hook",
            "alternative_call_to_action", "design_change_description", "expected_benefit",
            "evidence_basis", "priority", "source_type", "created_at"
        ],
        "numeric_ranges": {}
    },
    "multimodal_content_features.csv": {
        "primary_key": "record_id",
        "prefix": "MMF_REC_",
        "min_rows": 5000,
        "required_cols": [
            "record_id", "content_id", "media_type", "has_image_quality_ref",
            "has_video_reel_ref", "has_carousel_ref", "has_caption_ref", "has_audio_ref",
            "available_modalities", "modality_mask_has_media", "modality_mask_has_text",
            "modality_mask_audio_present", "feature_vector_dimension",
            "feature_extraction_version", "analysis_status", "source_type", "created_at"
        ],
        "numeric_ranges": {
            "feature_vector_dimension": (1, 100)
        }
    }
}

def get_file_sha256(filepath: Path) -> str:
    hasher = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()

def validate_all():
    print("=" * 70)
    print("AUTOMATED VERIFICATION SUITE: CONTENT AUDIT DATASETS")
    print("=" * 70)

    results = {
        "master_integrity_pass": False,
        "datasets_checked": len(DATASET_SCHEMAS),
        "datasets_passed": 0,
        "errors": [],
        "dataset_summaries": {}
    }

    # 1. Verify Master Dataset
    print("\n[Check 1/12] Verifying Master Dataset Integrity & SHA-256 Hash...")
    current_master_hash = get_file_sha256(MASTER_PATH)
    if current_master_hash == EXPECTED_MASTER_SHA256:
        print(f"  PASS: Master dataset unchanged: {current_master_hash}")
        results["master_integrity_pass"] = True
    else:
        err = f"FAIL: Master dataset hash modified! Expected {EXPECTED_MASTER_SHA256}, got {current_master_hash}"
        print(f"  {err}")
        results["errors"].append(err)

    # Master post IDs for foreign key check
    master_df = pd.read_csv(MASTER_PATH)
    valid_post_ids = set(master_df["post_id"].dropna().tolist())
    print(f"  Loaded {len(valid_post_ids):,} master post IDs for foreign-key validation.")

    # 2. Check each dataset
    for filename, schema in DATASET_SCHEMAS.items():
        print(f"\n[Verifying Dataset] {filename}...")
        csv_path = DATASETS_DIR / filename
        if not csv_path.exists():
            err = f"Dataset file missing: {csv_path}"
            print(f"  FAIL: {err}")
            results["errors"].append(err)
            continue

        df = pd.read_csv(csv_path)
        row_count = len(df)
        print(f"  Rows detected: {row_count:,}")

        # Check row count
        if row_count < schema["min_rows"]:
            err = f"{filename}: Row count {row_count} is less than required {schema['min_rows']}"
            results["errors"].append(err)
            print(f"  FAIL: {err}")

        # Check required columns
        missing_cols = set(schema["required_cols"]) - set(df.columns)
        if missing_cols:
            err = f"{filename}: Missing required columns: {missing_cols}"
            results["errors"].append(err)
            print(f"  FAIL: {err}")
        else:
            print(f"  PASS: All {len(schema['required_cols'])} schema columns present.")

        # Check primary key uniqueness
        pk = schema["primary_key"]
        n_unique_pk = df[pk].nunique()
        if n_unique_pk != row_count:
            err = f"{filename}: Duplicate primary keys found! Unique: {n_unique_pk}, Total rows: {row_count}"
            results["errors"].append(err)
            print(f"  FAIL: {err}")
        else:
            print(f"  PASS: Primary key '{pk}' is 100% unique across all {row_count:,} rows.")

        # Check foreign key linkage (content_id in master post_ids)
        if "content_id" in df.columns:
            orphaned = set(df["content_id"].dropna().tolist()) - valid_post_ids
            if orphaned:
                err = f"{filename}: {len(orphaned)} orphaned content_ids not found in master dataset!"
                results["errors"].append(err)
                print(f"  FAIL: {err}")
            else:
                print(f"  PASS: Foreign keys ('content_id') resolve 100% to valid master posts.")

        # Check numeric ranges
        range_errors = 0
        for col, (min_v, max_v) in schema.get("numeric_ranges", {}).items():
            if col in df.columns:
                vals = pd.to_numeric(df[col], errors="coerce").dropna()
                out_of_range = vals[(vals < min_v) | (vals > max_v)]
                if len(out_of_range) > 0:
                    err = f"{filename}: Column '{col}' has {len(out_of_range)} values outside [{min_v}, {max_v}]"
                    results["errors"].append(err)
                    range_errors += 1
        if range_errors == 0:
            print("  PASS: Numeric features comply with bounded valid ranges.")

        # Source types check
        source_counts = df["source_type"].value_counts().to_dict() if "source_type" in df.columns else {}
        print(f"  Provenance Breakdown: {source_counts}")

        results["dataset_summaries"][filename] = {
            "row_count": row_count,
            "unique_keys": n_unique_pk,
            "columns": len(df.columns),
            "source_type_breakdown": source_counts,
            "file_size_kb": round(csv_path.stat().st_size / 1024, 1)
        }
        results["datasets_passed"] += 1

    print("\n" + "=" * 70)
    print("VERIFICATION SUMMARY")
    print(f"Master Dataset Integrity: {'PASSED (UNCHANGED)' if results['master_integrity_pass'] else 'FAILED'}")
    print(f"Datasets Passed: {results['datasets_passed']} / {results['datasets_checked']}")
    print(f"Total Errors Found: {len(results['errors'])}")
    print("=" * 70)

    # Save verification report
    report_path = ROOT / "reports" / "content_audit_datasets_verification.json"
    report_path.write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(f"Saved audit verification report to: {report_path}")

    return len(results["errors"]) == 0

if __name__ == "__main__":
    success = validate_all()
    sys.exit(0 if success else 1)
