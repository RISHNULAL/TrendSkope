"use client";

import React from "react";
import {
  BookOpen,
  Target,
  Cpu,
  Layers,
  ShieldAlert,
  Compass,
  CheckCircle2,
} from "lucide-react";

export default function AboutView() {
  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="glass-card p-8 md:p-10 rounded-3xl border-border/80 space-y-4">
        <span className="text-[11px] font-bold text-primary-orange uppercase tracking-widest">
          Academic Research Project
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          Trend<span className="gradient-accent">Skope</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
          <strong>Instagram Content Performance Prediction and Analysis Using Machine Learning.</strong>{" "}
          TrendSkope is an academic ML demonstration designed to model patterns in documented datasets.
          It does not reverse-engineer Instagram&apos;s proprietary ranking system; predictions are uncertain,
          observational, and never guarantees.
        </p>
      </div>

      {/* Research Question & Objectives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 md:p-8 rounded-3xl border-border/80 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Target className="w-5 h-5 text-primary-orange" />
            <span>Research Question</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            How well can pre-publication caption, scheduling, media format, account-size, and leakage-safe account-history features estimate a post&apos;s future engagement rate in a documented dataset?
          </p>
        </div>

        <div className="glass-card p-6 md:p-8 rounded-3xl border-border/80 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <BookOpen className="w-5 h-5 text-primary-orange" />
            <span>Core Objectives & Dataset Source</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-ready shrink-0 mt-0.5" />
              <span><strong>Synthetic Research Dataset:</strong> 1,000 unique records generated across 40 accounts spanning Jan 2025–Sep 2026. Synthetic observations emulate realistic variance and are not represented as collected private user data.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-ready shrink-0 mt-0.5" />
              <span>Construct strictly pre-publication feature representations without post-publication leakage.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-ready shrink-0 mt-0.5" />
              <span>Enforce leakage-free chronological splitting (700 train / 150 val / 150 test).</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Methodology & Architecture */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border-border/80 space-y-6">
        <div className="flex items-center gap-2 text-white font-bold text-base border-b border-border pb-3">
          <Cpu className="w-5 h-5 text-primary-orange" />
          <span>Methodology & ML Architecture</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-surface border border-border space-y-2">
            <strong className="text-white block font-bold">1. Target Formulation</strong>
            <p className="text-slate-400 leading-relaxed">
              Target is <code className="text-primary-orange font-mono">log1p(engagement_rate)</code>, normalized per 100 followers. Stabilizes variance across varying audience sizes.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-border space-y-2">
            <strong className="text-white block font-bold">2. Feature Pipeline</strong>
            <p className="text-slate-400 leading-relaxed">
              Extracts caption length, word count, hashtag/mention/URL counts, emoji density, uppercase ratio, posting hour, day of week, weekend flags, and historical median engagement.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-border space-y-2">
            <strong className="text-white block font-bold">3. Model Candidates</strong>
            <p className="text-slate-400 leading-relaxed">
              Linear Regression, Ridge Regression (L2 regularization), and Random Forest Regressor. The candidate with lowest validation MAE is saved.
            </p>
          </div>
        </div>
      </div>

      {/* Limitations & Future Work */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 md:p-8 rounded-3xl border-border/80 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span>Research Limitations</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Observational results reflect training corpus distributions. Engagement metrics depend on elapsed collection timing, creator niche dynamics, and platform feed adjustments. Statistical associations do not imply causality.
          </p>
        </div>

        <div className="glass-card p-6 md:p-8 rounded-3xl border-border/80 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Compass className="w-5 h-5 text-primary-orange" />
            <span>Future Roadmap</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Documented CatBoost experiments, TF-IDF lexical models, SHAP interpretability plots, conformal uncertainty intervals, multimodal image embedding analysis, and official verified platform integrations.
          </p>
        </div>
      </div>
    </div>
  );
}
