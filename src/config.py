from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_RAW = ROOT / "data" / "raw"
DATA_PROCESSED = ROOT / "data" / "processed"
MODELS = ROOT / "models"
REPORTS = ROOT / "reports"
REQUIRED_COLUMNS = {"post_id", "account_id", "published_at", "media_type", "caption", "likes", "comments", "followers_at_or_near_collection"}
OPTIONAL_COLUMNS = {"saves", "shares", "reel_duration", "image_url", "media_path"}
RANDOM_STATE = 42
