import pandas as pd
import numpy as np
from src.predict import load_artifact, predict_one
from src.config import MODELS, DATA_RAW

def test_prediction_on_test_sample():
    artifact = load_artifact(MODELS / "final_model.joblib")
    df = pd.read_csv(DATA_RAW / "instagram_posts_1000.csv")
    
    # Take test split samples
    test_sample = df.tail(10)
    
    errors = []
    for _, row in test_sample.iterrows():
        total_eng = row["likes"] + row["comments"] + row.get("saves", 0) + row.get("shares", 0)
        actual_rate = round(100.0 * total_eng / row["followers_at_or_near_collection"], 2)
        pred_res = predict_one(artifact, row.to_dict())
        
        assert "prediction" in pred_res
        assert "lower" in pred_res
        assert "upper" in pred_res
        assert pred_res["lower"] <= pred_res["upper"]
        assert pred_res["prediction"] >= 0
        
        err = abs(actual_rate - pred_res["prediction"])
        errors.append(err)
        
    mean_err = np.mean(errors)
    assert mean_err < 10.0, f"Sample mean absolute error too high: {mean_err}"
