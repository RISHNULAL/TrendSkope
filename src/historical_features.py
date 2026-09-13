"""Leakage-safe account history: each row uses prior posts only."""
from __future__ import annotations
import numpy as np
import pandas as pd

def add_historical_features(frame: pd.DataFrame) -> pd.DataFrame:
    out = frame.sort_values("published_at").copy()
    cols = ["historical_post_count", "historical_mean_engagement", "historical_median_engagement", "historical_std_engagement", "recent_5_median", "recent_10_median", "recent_20_median"]
    for col in cols: out[col] = np.nan
    for _, idx in out.groupby("account_id", sort=False).groups.items():
        history: list[float] = []
        for row_id in idx:
            out.loc[row_id, "historical_post_count"] = len(history)
            if history:
                out.loc[row_id, "historical_mean_engagement"] = np.mean(history)
                out.loc[row_id, "historical_median_engagement"] = np.median(history)
                out.loc[row_id, "historical_std_engagement"] = np.std(history)
                for n in (5, 10, 20): out.loc[row_id, f"recent_{n}_median"] = np.median(history[-n:])
            history.append(float(out.loc[row_id, "engagement_rate"]))
    return out
