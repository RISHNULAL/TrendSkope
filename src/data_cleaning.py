"""Input validation and non-destructive cleaning."""
from __future__ import annotations
import pandas as pd
from .config import REQUIRED_COLUMNS

VALID_MEDIA_TYPES = {"photo", "image", "carousel", "reel"}

def validate_posts(frame: pd.DataFrame) -> list[str]:
    errors: list[str] = []
    missing = REQUIRED_COLUMNS - set(frame.columns)
    if missing:
        errors.append("Missing required column(s): " + ", ".join(sorted(missing)))
        return errors
    if frame.empty:
        errors.append("The file contains no posts.")
    if frame["post_id"].isna().any() or frame["post_id"].duplicated().any():
        errors.append("post_id must be present and unique.")
    if pd.to_datetime(frame["published_at"], errors="coerce").isna().any():
        errors.append("published_at contains invalid timestamps.")
    
    # media_type validation
    if "media_type" in frame.columns:
        invalid_media = set(frame["media_type"].astype(str).str.strip().str.lower().unique()) - VALID_MEDIA_TYPES
        if invalid_media:
            errors.append(f"Invalid media_type values found: {', '.join(sorted(invalid_media))} (accepted: photo, image, carousel, reel)")

    followers = pd.to_numeric(frame["followers_at_or_near_collection"], errors="coerce")
    if followers.isna().any() or (followers <= 0).any():
        errors.append("Follower count is required and must be greater than zero.")
    for col in ("likes", "comments"):
        value = pd.to_numeric(frame[col], errors="coerce")
        if value.isna().any() or (value < 0).any():
            errors.append(f"{col} must be a non-negative number.")
    return errors

def clean_posts(frame: pd.DataFrame) -> pd.DataFrame:
    """Return a cleaned copy; normalizes media_type ('photo' -> 'image')."""
    result = frame.copy()
    result["published_at"] = pd.to_datetime(result["published_at"], errors="coerce", utc=True)
    result["caption"] = result["caption"].fillna("").astype(str)
    
    # Canonicalize media_type: photo -> image
    raw_media = result["media_type"].fillna("image").astype(str).str.strip().str.lower()
    result["media_type"] = raw_media.replace({"photo": "image"})
    
    numeric = ["likes", "comments", "followers_at_or_near_collection", "saves", "shares"]
    for col in numeric:
        if col in result:
            result[col] = pd.to_numeric(result[col], errors="coerce")
    return result
