"""Chronological training script. Run: python -m src.train data/raw/posts.csv"""
from __future__ import annotations
import json, sys
import joblib, numpy as np, pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from .config import MODELS, REPORTS, RANDOM_STATE
from .data_cleaning import clean_posts, validate_posts
from .feature_engineering import add_target, build_features
from .historical_features import add_historical_features

NUMERIC = ["posting_hour","posting_day_of_week","posting_day","posting_month","is_weekend","followers","log_followers","caption_length","word_count","hashtag_count","mention_count","url_count","emoji_count","exclamation_count","question_count","uppercase_ratio","average_word_length","historical_post_count","historical_mean_engagement","historical_median_engagement","historical_std_engagement","recent_5_median","recent_10_median","recent_20_median"]
CATEGORICAL = ["media_type"]
def pipeline(model):
    pre = ColumnTransformer([("num", Pipeline([("impute", SimpleImputer(strategy="median")), ("scale", StandardScaler())]), NUMERIC), ("cat", Pipeline([("impute", SimpleImputer(strategy="most_frequent")), ("onehot", OneHotEncoder(handle_unknown="ignore"))]), CATEGORICAL)])
    return Pipeline([("preprocess", pre), ("model", model)])
def metrics(y, pred):
    return {"mae": float(mean_absolute_error(np.expm1(y), np.expm1(pred))), "rmse": float(mean_squared_error(np.expm1(y), np.expm1(pred)) ** .5), "r2": float(r2_score(y, pred)), "median_absolute_error": float(np.median(abs(np.expm1(y)-np.expm1(pred))))}
def main(csv_path: str):
    raw = pd.read_csv(csv_path); errors = validate_posts(raw)
    if errors: raise ValueError("; ".join(errors))
    data = add_historical_features(add_target(build_features(clean_posts(raw)))).sort_values("published_at")
    n=len(data); a,b=int(.7*n),int(.85*n)
    if a < 10 or b-a < 3 or n-b < 3: raise ValueError("At least 15 chronologically dated posts are required.")
    tr, va, te = data.iloc[:a], data.iloc[a:b], data.iloc[b:]
    candidates = {"Linear Regression": LinearRegression(), "Ridge": Ridge(alpha=2.0), "Random Forest": RandomForestRegressor(n_estimators=300, min_samples_leaf=2, random_state=RANDOM_STATE, n_jobs=-1)}
    rows=[]; fitted={}
    for name, estimator in candidates.items():
        candidate = pipeline(estimator).fit(tr, tr.target); pred=candidate.predict(va); row={"model":name, **metrics(va.target,pred)}; rows.append(row); fitted[name]=candidate
    best_name=min(rows,key=lambda x:x["mae"])["model"]
    best=pipeline(candidates[best_name]).fit(pd.concat([tr,va]),pd.concat([tr,va]).target)
    val_residual=np.quantile(abs(va.target-fitted[best_name].predict(va)),.9)
    test_metrics=metrics(te.target,best.predict(te)); thresholds=np.quantile(tr.engagement_rate,[.33,.67]).tolist()
    MODELS.mkdir(exist_ok=True); REPORTS.mkdir(exist_ok=True)
    joblib.dump({"model":best,"interval_residual":float(val_residual),"thresholds":thresholds,"feature_names":NUMERIC+CATEGORICAL}, MODELS/"final_model.joblib")
    pd.DataFrame(rows).to_csv(REPORTS/"model_comparison.csv",index=False)
    (REPORTS/"metrics.json").write_text(json.dumps({"test":test_metrics,"dataset_size":n,"features_used":len(NUMERIC)+len(CATEGORICAL),"selected_model":best_name,"splits":{"train":len(tr),"validation":len(va),"test":len(te)}},indent=2))
    print(f"Saved {best_name}; test MAE: {test_metrics['mae']:.3f}")
if __name__ == "__main__": main(sys.argv[1])
