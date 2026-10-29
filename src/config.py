from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_RAW = ROOT / "data" / "raw"
DATA_PROCESSED = ROOT / "data" / "processed"
DATA_MEDIA = ROOT / "data" / "media"
DATA_METADATA = ROOT / "data" / "metadata"
MODELS = ROOT / "models"
REPORTS = ROOT / "reports"

MEDIA_IMAGES = DATA_MEDIA / "images"
MEDIA_VIDEOS = DATA_MEDIA / "videos"
MEDIA_CAROUSEL = DATA_MEDIA / "carousel"
MEDIA_AUDIO = DATA_MEDIA / "audio"
MEDIA_ASSETS_CSV = DATA_METADATA / "media_assets.csv"
CAROUSEL_SLIDES_CSV = DATA_METADATA / "carousel_slides.csv"
AUDIO_FEATURES_CSV = DATA_METADATA / "audio_features.csv"
MEDIA_ANALYSIS_CSV = DATA_METADATA / "media_analysis.csv"
MULTIMODAL_FEATURES_PARQUET = DATA_PROCESSED / "multimodal_features.parquet"
MULTIMODAL_FEATURES_CSV = DATA_PROCESSED / "multimodal_features.csv"
MEDIA_QUALITY_REPORT = REPORTS / "media_dataset_quality.json"
REQUIRED_COLUMNS = {"post_id", "account_id", "published_at", "media_type", "caption", "likes", "comments", "followers_at_or_near_collection"}
OPTIONAL_COLUMNS = {"saves", "shares", "reel_duration", "image_url", "media_path", "asset_id"}
RANDOM_STATE = 42
