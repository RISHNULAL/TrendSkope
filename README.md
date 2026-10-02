# TrendSkope

## AI-Powered Instagram Content Performance Intelligence

**Understand. Predict. Optimize.** TrendSkope is an academic ML application for estimating an Instagram post’s engagement rate from information available *before* publication. Built with a modern **Next.js + TypeScript** frontend, **FastAPI** Python backend, and deployed on **Vercel**.

## Architecture

- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend API**: FastAPI (Python), Serverless Vercel runtime (`api/index.py`)
- **ML Engine**: scikit-learn, pandas, numpy, joblib (`src/`)
- **Deployment**: Vercel-ready with `vercel.json`

## Research Question

How well can pre-publication caption, scheduling, media format, account size, and leakage-safe account history estimate future engagement rates in a documented dataset?

## Dataset & Provenance
- **Dataset Size:** 1,000 unique records (`data/raw/instagram_posts_1000.csv`)
- **Accounts:** 40 synthetic accounts (`ACCOUNT_001`–`ACCOUNT_040`), 20–32 posts per account
- **Date Range:** 2025-01-21 → 2026-09-16 (chronological ordering strictly enforced)
- **Media Distribution:** Reel (41.1%), Image (35.3%), Carousel (23.6%)
- **Dataset Source:** Documented synthetic research dataset generated to emulate realistic Instagram engagement dynamics across 10 creator domains (Tech, Fitness, Food, Travel, Business, Education, Design, Lifestyle, Gaming, Community). Contains zero scraped personal data.
- **Leakage Prevention:** Historical account features (`historical_post_count`, `historical_mean_engagement`, `historical_median_engagement`, `recent_5_median`, etc.) are computed on strictly prior posts (`idx < current`).
- **Validation:** Automated test suite (`tests/validate_dataset.py`) verifies 100% unique `post_id`s, 0 duplicate rows, positive followers, non-negative targets, and chronological monotonicity.

## Methodology

- **Target:** `log1p(engagement_rate)`, where engagement rate is `100 × (likes + comments + saves + shares) / followers_at_or_near_collection`.
- **Features:** 25 pre-publication features including caption statistics (length, word count, hashtags, mentions, emojis, uppercase ratio, questions), scheduling (hour, day of week, weekend indicator), media format, follower counts, and chronological historical performance statistics.
- **Split:** Chronological split: 700 train (70%), 150 validation (15%), 150 test (15%). No random shuffle across time.
- **Experiments:** Linear Regression, Ridge Regression (L2), and Random Forest. Selected model is lowest-validation-MAE candidate.
- **Uncertainty:** Empirical 90% validation residual interval.

No post-publication metric (likes, comments, reach, impressions, views) is ever used as a predictive input.

## Local Development

### 1. Backend (FastAPI)

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn api.index:app --reload --port 8000
```

### 2. Frontend (Next.js)

```powershell
npm install
npm run dev
```

Frontend runs at `http://localhost:3000` with automated proxy rewrites to `http://127.0.0.1:8000/api`.

### 3. Generating & Validating Dataset

```powershell
python -m scripts.generate_dataset
python -m tests.validate_dataset
```

### 4. Running Offline Model Training

```powershell
python -m src.train data/raw/instagram_posts_1000.csv
```

### 5. Running Automated Tests

```powershell
pytest
```

### 6. Production Build

```powershell
npm run build
```

## Vercel Deployment

Push the repository to GitHub and import into Vercel. Vercel automatically deploys the Next.js frontend and Python serverless API functions located in `/api`.

