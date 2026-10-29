"""Leakage-safe account history: each row uses prior posts only."""
from __future__ import annotations
import numpy as np
import pandas as pd

def add_historical_features(frame: pd.DataFrame) -> pd.DataFrame:
    out = frame.sort_values("published_at").copy()
    n = len(out)
    hist_count = np.zeros(n, dtype=float)
    hist_mean = np.full(n, np.nan)
    hist_median = np.full(n, np.nan)
    hist_std = np.full(n, np.nan)
    rec_5 = np.full(n, np.nan)
    rec_10 = np.full(n, np.nan)
    rec_20 = np.full(n, np.nan)

    idx_map = {idx: pos for pos, idx in enumerate(out.index)}
    eng_values = out["engagement_rate"].values

    for _, idx_group in out.groupby("account_id", sort=False).groups.items():
        history: list[float] = []
        for row_id in idx_group:
            pos = idx_map[row_id]
            hist_count[pos] = len(history)
            if history:
                hist_mean[pos] = np.mean(history)
                hist_median[pos] = np.median(history)
                hist_std[pos] = np.std(history)
                rec_5[pos] = np.median(history[-5:])
                rec_10[pos] = np.median(history[-10:])
                rec_20[pos] = np.median(history[-20:])
            history.append(float(eng_values[pos]))

    out["historical_post_count"] = hist_count
    out["historical_mean_engagement"] = hist_mean
    out["historical_median_engagement"] = hist_median
    out["historical_std_engagement"] = hist_std
    out["recent_5_median"] = rec_5
    out["recent_10_median"] = rec_10
    out["recent_20_median"] = rec_20
    return out
