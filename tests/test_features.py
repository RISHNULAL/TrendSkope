import pandas as pd
from src.feature_engineering import build_features
def test_prepublication_features():
    x=build_features(pd.DataFrame([{"published_at":"2025-01-01T12:00:00Z","caption":"HELLO! #test 😊","followers_at_or_near_collection":100,"media_type":"image"}]))
    assert x.loc[0,"hashtag_count"] == 1 and x.loc[0,"posting_hour"] == 12
