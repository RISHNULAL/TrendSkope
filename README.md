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

## Methodology

- **Target:** `log1p(engagement_rate)`, where engagement rate is `100 × (likes + comments + saves + shares) / followers` (or `likes + comments` when saves/shares absent).
- **Features:** Pre-publication caption statistics, hashtags, scheduling, media type, follower count, and account statistics calculated strictly from prior posts.
- **Split:** Rows ordered by publication time and split 70% train / 15% validation / 15% test.
- **Experiments:** Linear Regression, Ridge, and Random Forest. Selected model is lowest-validation-MAE candidate.
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

### 3. Running Offline Model Training

```powershell
python -m src.train data/raw/your_posts.csv
```

### 4. Running Automated Tests

```powershell
pytest -q
```

### 5. Production Build

```powershell
npm run build
```

## Vercel Deployment

Push the repository to GitHub and import into Vercel. Vercel automatically deploys the Next.js frontend and Python serverless API functions located in `/api`.
