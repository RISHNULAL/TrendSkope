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
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Info,
  Sliders,
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
        <p className="text-xs text-[#6B7280]">Loading model insights...</p>
      </div>
    );
  }

  const isAvailable = Boolean(data?.available && data?.metrics);
  const metrics = data?.metrics?.test;
  const splits = data?.metrics?.splits;
  const comparison = data?.comparison || [];
  const coefficients = data?.metrics?.feature_coefficients || [];

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#3D4852]">
          Model & Experiment Insights
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Rigorous out-of-sample evaluation on chronologically held-out test partitions and linear coefficient analysis.
        </p>
      </div>

      {!isAvailable ? (
        <div className="glass-card p-10 rounded-3xl border-border/80 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#B45309] flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl font-bold text-[#3D4852]">
              Model has not been trained yet
            </h2>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              No experiment metrics found in `reports/metrics.json`. To train the model and generate real experiment benchmarks:
            </p>
          </div>

          <div className="max-w-lg mx-auto p-4 rounded-2xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] border border-transparent text-left font-mono text-xs text-[#6B7280] flex items-center gap-3">
            <Terminal className="w-4 h-4 text-[#6C63FF] shrink-0" />
            <code>python -m src.train data/raw/instagram_posts_1000.csv</code>
          </div>

          <p className="text-[11px] text-[#6B7280]">
            TrendSkope never fabricates evaluation scores or benchmark numbers.
          </p>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {/* Selected Model Summary Card */}
          <div className="glass-card p-6 md:p-8 rounded-3xl border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#6C63FF] uppercase tracking-wider">
                Active Production Model
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#3D4852] flex items-center gap-3">
                {data?.metrics?.selected_model || "Ridge Regression"}
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-ready/10 border border-ready/30 text-ready">
                  Best Validation MAE
                </span>
              </h2>
              <p className="text-xs text-[#6B7280]">
                Trained on pre-publication features using chronological 70% Train / 15% Validation / 15% Test split.
              </p>
            </div>

            {splits && (
              <div className="flex items-center gap-3 text-xs">
                <div className="px-3.5 py-2.5 rounded-2xl bg-[#E0E5EC] shadow-[inset_4px_4px_8px_rgb(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] text-center">
                  <span className="text-[10px] text-[#6B7280] block">Train Partition</span>
                  <strong className="text-[#3D4852] font-mono">{splits.train.toLocaleString()} posts</strong>
                </div>
                <div className="px-3.5 py-2.5 rounded-2xl bg-[#E0E5EC] shadow-[inset_4px_4px_8px_rgb(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] text-center">
                  <span className="text-[10px] text-[#6B7280] block">Validation Partition</span>
                  <strong className="text-[#3D4852] font-mono">{splits.validation.toLocaleString()} posts</strong>
                </div>
                <div className="px-3.5 py-2.5 rounded-2xl bg-[#E0E5EC] shadow-[inset_4px_4px_8px_rgb(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] text-center">
                  <span className="text-[10px] text-[#6B7280] block">Held-out Test</span>
                  <strong className="text-[#3D4852] font-mono">{splits.test.toLocaleString()} posts</strong>
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

          {/* Model Comparison Table */}
          {comparison.length > 0 && (
            <div className="glass-card p-6 md:p-8 rounded-3xl border-border/80 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-[#3D4852] flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#6C63FF]" />
                    Candidate Model Evaluation on Validation Split
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Linear Regression, Ridge Regression, and Lasso Regression evaluated on identical chronological validation partition.
                  </p>
                </div>
                <span className="text-xs text-[#6B7280] font-mono bg-[#E0E5EC] px-3 py-1 rounded-xl shadow-[inset_4px_4px_8px_rgb(163,177,198,0.5),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]">
                  reports/model_comparison.csv
                </span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-2xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] p-2">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider border-b border-transparent">
                    <tr>
                      <th className="py-3 px-4">Candidate Model</th>
                      <th className="py-3 px-4 text-right">Validation MAE</th>
                      <th className="py-3 px-4 text-right">Validation RMSE</th>
                      <th className="py-3 px-4 text-right">Validation R²</th>
                      <th className="py-3 px-4 text-right">Median Absolute Error</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {comparison.map((row, idx) => {
                      const isSelected = row.model === data?.metrics?.selected_model;
                      return (
                        <tr
                          key={idx}
                          className={`transition-colors ${
                            isSelected ? "bg-primary-orange/5 font-semibold" : ""
                          }`}
                        >
                          <td className="py-3.5 px-4 text-[#3D4852] flex items-center gap-2">
                            {isSelected && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-ready shrink-0" />
                            )}
                            <span>{row.model}</span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[#3D4852]">
                            {row.mae.toFixed(3)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[#6B7280]">
                            {row.rmse.toFixed(3)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[#6B7280]">
                            {row.r2.toFixed(3)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[#6B7280]">
                            {row.median_absolute_error.toFixed(3)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {isSelected ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-ready/10 text-ready border border-ready/30">
                                Selected
                              </span>
                            ) : (
                              <span className="text-[#6B7280] text-[10px]">Candidate</span>
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

          {/* Feature Influence Table (Linear Model Coefficients) */}
          {coefficients.length > 0 && (
            <div className="glass-card p-6 md:p-8 rounded-3xl border-border/80 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-[#3D4852] flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-[#6C63FF]" />
                    Feature Influence & Standardized Coefficients
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Coefficients derived from the trained {data?.metrics?.selected_model || "Ridge Regression"} model.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-[#6C63FF] bg-[#E0E5EC] px-3 py-1 rounded-xl shadow-[inset_4px_4px_8px_rgb(163,177,198,0.5),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]">
                  {coefficients.length} Features
                </span>
              </div>

              <p className="text-xs text-[#6B7280] leading-relaxed">
                Standardized features allow comparative interpretation of coefficient magnitudes. Features with larger absolute coefficients exhibit stronger statistical association with follower-normalized engagement rate in the training corpus.
              </p>

              {/* Coefficients Table */}
              <div className="overflow-x-auto rounded-2xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] p-2">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider border-b border-transparent">
                    <tr>
                      <th className="py-3 px-4">Feature Name</th>
                      <th className="py-3 px-4 text-right">Coefficient</th>
                      <th className="py-3 px-4 text-center">Direction of Association</th>
                      <th className="py-3 px-4 text-right">Relative Magnitude</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {coefficients.map((item, idx) => {
                      const isPositive = item.coefficient > 0;
                      const isNegative = item.coefficient < 0;
                      return (
                        <tr key={idx} className="hover:bg-primary-orange/5 transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-[#3D4852]">
                            {item.feature}
                          </td>
                          <td
                            className={`py-3 px-4 text-right font-mono font-bold ${
                              isPositive
                                ? "text-[#0F766E]"
                                : isNegative
                                ? "text-[#BE123C]"
                                : "text-[#6B7280]"
                            }`}
                          >
                            {isPositive ? `+${item.coefficient.toFixed(4)}` : item.coefficient.toFixed(4)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                isPositive
                                  ? "bg-emerald-500/10 text-[#0F766E]"
                                  : isNegative
                                  ? "bg-rose-500/10 text-[#BE123C]"
                                  : "bg-gray-500/10 text-[#6B7280]"
                              }`}
                            >
                              {isPositive && <TrendingUp className="w-3 h-3" />}
                              {isNegative && <TrendingDown className="w-3 h-3" />}
                              {item.direction}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-[#6B7280]">
                            {item.abs_coefficient.toFixed(4)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Interpretation Guidance & Scientific Integrity Notice */}
          <div className="p-5 rounded-3xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] border border-transparent text-xs text-[#6B7280] flex items-start gap-3">
            <Info className="w-5 h-5 text-[#6C63FF] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-[#3D4852] block font-bold text-sm">
                Interpretation & Scientific Integrity Guidance
              </strong>
              <p className="leading-relaxed">
                Coefficients describe <strong>statistical associations</strong> observed within the training dataset. They do not demonstrate causal mechanisms. For example, a positive coefficient for <code className="font-mono text-[#6C63FF]">question_count</code> indicates that posts with question marks exhibited higher engagement rates on average in this corpus, not that adding question marks will inherently increase real-world performance.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
