import pandas as pd
from src.historical_features import add_historical_features
def test_first_post_has_no_future_history():
    x=pd.DataFrame({"account_id":["a","a"],"published_at":pd.to_datetime(["2025-01-01","2025-01-02"],utc=True),"engagement_rate":[1.,99.]})
    y=add_historical_features(x); assert y.iloc[0].historical_post_count == 0 and y.iloc[1].historical_median_engagement == 1.
