"""Pre-publication feature construction only."""
from __future__ import annotations
import re
import numpy as np
import pandas as pd

def build_features(frame: pd.DataFrame) -> pd.DataFrame:
    out = frame.copy()
    stamp = pd.to_datetime(out["published_at"], utc=True)
    caption = out["caption"].fillna("").astype(str)
    words = caption.str.findall(r"\b\w+\b")
    out["posting_hour"] = stamp.dt.hour
    out["posting_day_of_week"] = stamp.dt.dayofweek
    out["posting_day"] = stamp.dt.day
    out["posting_month"] = stamp.dt.month
    out["is_weekend"] = (stamp.dt.dayofweek >= 5).astype(int)
    out["followers"] = pd.to_numeric(out["followers_at_or_near_collection"], errors="coerce")
    out["log_followers"] = np.log1p(out["followers"])
    out["caption_length"] = caption.str.len()
    out["word_count"] = words.str.len()
    out["hashtag_count"] = caption.str.count(r"(?<!\w)#\w+")
    out["mention_count"] = caption.str.count(r"(?<!\w)@\w+")
    out["url_count"] = caption.str.count(r"https?://\S+|www\.\S+")
    out["emoji_count"] = caption.str.count(r"[^\x00-\x7F]")
    out["exclamation_count"] = caption.str.count("!")
    out["question_count"] = caption.str.count(r"\?")
    out["uppercase_ratio"] = caption.map(lambda x: sum(c.isupper() for c in x) / max(sum(c.isalpha() for c in x), 1))
    out["average_word_length"] = words.map(lambda w: np.mean([len(x) for x in w]) if w else 0.0)
    return out

def add_target(frame: pd.DataFrame) -> pd.DataFrame:
    out = frame.copy()
    engagement = out["likes"] + out["comments"]
    if {"saves", "shares"}.issubset(out.columns):
        engagement += out["saves"].fillna(0) + out["shares"].fillna(0)
    out["engagement_rate"] = 100 * engagement / out["followers_at_or_near_collection"]
    out["target"] = np.log1p(out["engagement_rate"])
    return out
