"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Terminal,
  Activity,
  Layers,
} from "lucide-react";
import { fetchInsights } from "@/lib/api";
import { InsightsResponse } from "@/types";
import MetricCard from "../MetricCard";

export default function InsightsView() {
  const [data, setData] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights()
      .then((res) => setData(res))
      .catch(() => setData({ available: false, metrics: null, comparison: [] }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
        <div className="w-8 h-8 border-2 border-primary-orange border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400">Loading model insights...</p>
      </div>
    );
  }

  const isAvailable = Boolean(data?.available && data?.metrics);
  const metrics = data?.metrics?.test;
  const splits = data?.metrics?.splits;
  const comparison = data?.comparison || [];

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">
          Model & Experiment Insights
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Rigorous out-of-sample evaluation on chronologically held-out test partitions.
        </p>
      </div>

      {!isAvailable ? (
        <div className="glass-card p-10 rounded-3xl border-border/80 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl font-bold text-white">
              Model has not been trained yet
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              No experiment metrics found in `reports/metrics.json`. To train the model and generate real experiment benchmarks:
            </p>
          </div>

          <div className="max-w-lg mx-auto p-4 rounded-2xl bg-[#040810]/80 border border-white/10 text-left font-mono text-xs text-slate-300 flex items-center gap-3">
            <Terminal className="w-4 h-4 text-primary-orange shrink-0" />
            <code>python -m src.train data/raw/your_posts.csv</code>
          </div>

          <p className="text-[11px] text-slate-400">
            TrendSkope never fabricates evaluation scores or benchmark numbers.
          </p>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {/* Selected Model Summary Card */}
          <div className="glass-card p-6 md:p-8 rounded-3xl border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-primary-orange uppercase tracking-wider">
                Active Production Model
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
                {data?.metrics?.selected_model || "Regression Model"}
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-ready/10 border border-ready/30 text-ready">
                  Best Validation MAE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Trained on pre-publication features using chronological 70% Train / 15% Validation / 15% Test split.
              </p>
            </div>

            {splits && (
              <div className="flex items-center gap-3 text-xs">
                <div className="px-3 py-2 rounded-xl bg-surface border border-border text-center">
                  <span className="text-[10px] text-slate-400 block">Train Set</span>
                  <strong className="text-white font-mono">{splits.train.toLocaleString()} posts</strong>
                </div>
                <div className="px-3 py-2 rounded-xl bg-surface border border-border text-center">
                  <span className="text-[10px] text-slate-400 block">Validation Set</span>
                  <strong className="text-white font-mono">{splits.validation.toLocaleString()} posts</strong>
                </div>
                <div className="px-3 py-2 rounded-xl bg-surface border border-border text-center">
                  <span className="text-[10px] text-slate-400 block">Held-out Test</span>
                  <strong className="text-white font-mono">{splits.test.toLocaleString()} posts</strong>
                </div>
              </div>
            )}
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Held-Out Test MAE"
              value={metrics?.mae !== undefined ? metrics.mae.toFixed(3) : "--"}
              subtitle="Mean Absolute Error (pp)"
              highlight
            />
            <MetricCard
              label="Held-Out Test RMSE"
              value={metrics?.rmse !== undefined ? metrics.rmse.toFixed(3) : "--"}
              subtitle="Root Mean Squared Error"
            />
            <MetricCard
              label="Test R² Score"
              value={metrics?.r2 !== undefined ? metrics.r2.toFixed(3) : "--"}
              subtitle="Variance explained (held-out)"
            />
            <MetricCard
              label="Median Absolute Error"
              value={
                metrics?.median_absolute_error !== undefined
                  ? metrics.median_absolute_error.toFixed(3)
                  : "--"
              }
              subtitle="Robust error estimate"
            />
          </div>

          {/* Model Comparison Table & Visuals */}
          {comparison.length > 0 && (
            <div className="glass-card p-6 md:p-8 rounded-3xl border-border/80 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary-orange" />
                    Validation Model Comparison
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Candidate models evaluated on identical chronological validation partition.
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-mono">reports/model_comparison.csv</span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-border bg-black/20">
                    <tr>
                      <th className="py-3.5 px-4">Candidate Model</th>
                      <th className="py-3.5 px-4 text-right">Validation MAE</th>
                      <th className="py-3.5 px-4 text-right">Validation RMSE</th>
                      <th className="py-3.5 px-4 text-right">Validation R²</th>
                      <th className="py-3.5 px-4 text-right">Median Absolute Error</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {comparison.map((row, idx) => {
                      const isSelected = row.model === data?.metrics?.selected_model;
                      return (
                        <tr
                          key={idx}
                          className={`hover:bg-white/[0.02] transition-colors ${
                            isSelected ? "bg-primary-orange/5 font-semibold" : ""
                          }`}
                        >
                          <td className="py-3.5 px-4 text-white flex items-center gap-2">
                            {isSelected && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-ready shrink-0" />
                            )}
                            <span>{row.model}</span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-white">
                            {row.mae.toFixed(3)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                            {row.rmse.toFixed(3)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                            {row.r2.toFixed(3)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                            {row.median_absolute_error.toFixed(3)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {isSelected ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-ready/10 text-ready border border-ready/30">
                                Selected
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">Candidate</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Research Transparency Notice */}
          <div className="p-4 rounded-2xl bg-surface border border-border text-xs text-slate-400 flex items-start gap-3">
            <Activity className="w-4 h-4 text-primary-orange shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-300">Scientific Integrity Notice</p>
              <p className="mt-0.5 leading-relaxed">
                SHAP feature attributions, CatBoost gradient boosting, and conformal prediction intervals
                are documented in future work and are intentionally withheld from display until their real artifacts are generated.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
