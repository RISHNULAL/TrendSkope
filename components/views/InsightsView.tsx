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
  Sparkles,
  Film,
  Music,
  ShieldCheck,
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
        <div className="w-8 h-8 border-2 border-[#6C4DFF] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#68677D]">Loading model insights...</p>
      </div>
    );
  }

  const isAvailable = Boolean(data?.available && data?.metrics);
  const metrics = data?.metrics?.test;
  const splits = data?.metrics?.splits;
  const comparison = data?.comparison || [];
  const coefficients = data?.metrics?.feature_coefficients || [];
  const multimodalData = data?.multimodal;
  const multimodalComparison = data?.multimodal_comparison || [];

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#242137] tracking-tight">
          Model & Experiment Insights
        </h1>
        <p className="text-sm text-[#68677D] mt-1">
          Rigorous out-of-sample evaluation on chronologically held-out test partitions and linear coefficient analysis.
        </p>
      </div>

      {!isAvailable ? (
        <div className="glass-card p-10 rounded-2xl border border-[#E7E3F0] bg-white shadow-card text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#E9A23B]/10 border border-[#E9A23B]/20 text-[#E9A23B] flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl font-bold text-[#242137]">
              Model has not been trained yet
            </h2>
            <p className="text-xs text-[#68677D] leading-relaxed">
              No experiment metrics found in `reports/metrics.json`. To train the model and generate real experiment benchmarks:
            </p>
          </div>

          <div className="max-w-lg mx-auto p-4 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0] text-left font-mono text-xs text-[#68677D] flex items-center gap-3">
            <Terminal className="w-4 h-4 text-[#6C4DFF] shrink-0" />
            <code className="text-[#242137]">python -m src.train data/raw/instagram_posts_1000.csv</code>
          </div>

          <p className="text-[11px] text-[#68677D]">
            TrendSkope never fabricates evaluation scores or benchmark numbers.
          </p>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {/* Selected Model Summary Card */}
          <div className="glass-card p-6 md:p-8 rounded-2xl border border-[#E7E3F0] bg-white shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#6C4DFF] uppercase tracking-wider">
                Active Production Model
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#242137] flex items-center gap-3">
                {data?.metrics?.selected_model || "Ridge Regression"}
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#0F9D8A]/10 border border-[#0F9D8A]/30 text-[#0F9D8A]">
                  Best Validation MAE
                </span>
              </h2>
              <p className="text-xs text-[#68677D]">
                Trained on pre-publication features using chronological 70% Train / 15% Validation / 15% Test split.
              </p>
            </div>

            {splits && (
              <div className="flex items-center gap-3 text-xs">
                <div className="px-3.5 py-2.5 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0] text-center">
                  <span className="text-[10px] text-[#68677D] block">Train Partition</span>
                  <strong className="text-[#242137] font-mono">{splits.train.toLocaleString()} posts</strong>
                </div>
                <div className="px-3.5 py-2.5 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0] text-center">
                  <span className="text-[10px] text-[#68677D] block">Validation Partition</span>
                  <strong className="text-[#242137] font-mono">{splits.validation.toLocaleString()} posts</strong>
                </div>
                <div className="px-3.5 py-2.5 rounded-xl bg-[#F0EBFF] border border-[#6C4DFF]/20 text-center">
                  <span className="text-[10px] text-[#6C4DFF] font-semibold block">Held-out Test</span>
                  <strong className="text-[#242137] font-mono">{splits.test.toLocaleString()} posts</strong>
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
            <div className="glass-card p-6 md:p-8 rounded-2xl border border-[#E7E3F0] bg-white shadow-card space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-[#242137] flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#6C4DFF]" />
                    Candidate Model Evaluation on Validation Split
                  </h3>
                  <p className="text-xs text-[#68677D] mt-0.5">
                    Linear Regression, Ridge Regression, and Lasso Regression evaluated on identical chronological validation partition.
                  </p>
                </div>
                <span className="text-xs text-[#68677D] font-mono bg-[#F8F7FC] border border-[#E7E3F0] px-3 py-1 rounded-xl">
                  reports/model_comparison.csv
                </span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-[#E7E3F0]">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] font-bold text-[#68677D] uppercase tracking-wider bg-[#F8F7FC] border-b border-[#E7E3F0]">
                    <tr>
                      <th className="py-3 px-4">Candidate Model</th>
                      <th className="py-3 px-4 text-right">Validation MAE</th>
                      <th className="py-3 px-4 text-right">Validation RMSE</th>
                      <th className="py-3 px-4 text-right">Validation R²</th>
                      <th className="py-3 px-4 text-right">Median Absolute Error</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E3F0]">
                    {comparison.map((row, idx) => {
                      const isSelected = row.model === data?.metrics?.selected_model;
                      return (
                        <tr
                          key={idx}
                          className={`transition-colors hover:bg-[#F8F7FC]/70 ${
                            isSelected ? "bg-[#F0EBFF]/50 font-semibold" : ""
                          }`}
                        >
                          <td className="py-3.5 px-4 text-[#242137] flex items-center gap-2">
                            {isSelected && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#0F9D8A] shrink-0" />
                            )}
                            <span>{row.model}</span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[#242137] font-semibold">
                            {row.mae.toFixed(3)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[#68677D]">
                            {row.rmse.toFixed(3)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[#68677D]">
                            {row.r2.toFixed(3)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[#68677D]">
                            {row.median_absolute_error.toFixed(3)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {isSelected ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0F9D8A]/10 text-[#0F9D8A] border border-[#0F9D8A]/30">
                                Selected
                              </span>
                            ) : (
                              <span className="text-[#68677D] text-[10px]">Candidate</span>
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

          {/* Multimodal vs Baseline Model Benchmark */}
          {multimodalComparison.length > 0 && (
            <div className="glass-card p-6 md:p-8 rounded-2xl border border-[#E7E3F0] bg-white shadow-card space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-[#242137] flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#6C4DFF]" />
                    Multimodal Content Analysis vs Baseline Evaluation
                  </h3>
                  <p className="text-xs text-[#68677D] mt-0.5">
                    Rigorous comparison on identical chronological test partition between tabular metadata-only baseline and multimodal feature pipeline.
                  </p>
                </div>
                <span className="text-xs text-[#68677D] font-mono bg-[#F8F7FC] border border-[#E7E3F0] px-3 py-1 rounded-xl">
                  reports/multimodal_comparison.csv
                </span>
              </div>

              {/* Comparison Table */}
              <div className="overflow-x-auto rounded-xl border border-[#E7E3F0]">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] font-bold text-[#68677D] uppercase tracking-wider bg-[#F8F7FC] border-b border-[#E7E3F0]">
                    <tr>
                      <th className="py-3 px-4">Evaluation Architecture</th>
                      <th className="py-3 px-4">Model Class</th>
                      <th className="py-3 px-4 text-center">Feature Count</th>
                      <th className="py-3 px-4 text-right">Test MAE (pp)</th>
                      <th className="py-3 px-4 text-right">Test RMSE</th>
                      <th className="py-3 px-4 text-right">Test R² Score</th>
                      <th className="py-3 px-4 text-center">Modality Pipeline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E3F0]">
                    {multimodalComparison.map((row, idx) => {
                      const isMulti = row.model_type.includes("Multimodal");
                      return (
                        <tr
                          key={idx}
                          className={`transition-colors hover:bg-[#F8F7FC]/70 ${
                            isMulti ? "bg-[#F0EBFF]/50 font-semibold" : ""
                          }`}
                        >
                          <td className="py-3.5 px-4 text-[#242137] font-medium flex items-center gap-2">
                            {isMulti ? (
                              <Sparkles className="w-4 h-4 text-[#6C4DFF] shrink-0" />
                            ) : (
                              <Layers className="w-4 h-4 text-[#68677D] shrink-0" />
                            )}
                            <span>{row.model_type}</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-[#242137]">
                            {row.selected_model}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-[#242137]">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#F8F7FC] border border-[#E7E3F0] text-[11px] font-medium">
                              {row.features_count} features
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-[#0F9D8A]">
                            {row.test_mae.toFixed(4)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[#68677D]">
                            {row.test_rmse.toFixed(4)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[#68677D]">
                            {row.test_r2.toFixed(4)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {isMulti ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F0EBFF] text-[#6C4DFF] border border-[#6C4DFF]/20">
                                Multimodal Active
                              </span>
                            ) : (
                              <span className="text-[#68677D] text-[10px] font-mono">
                                Baseline
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Modality Distribution Breakdown */}
              {multimodalData?.modality_counts && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0] text-center">
                    <span className="text-[10px] text-[#68677D] block uppercase font-mono font-medium">Text & Scheduling</span>
                    <strong className="text-[#242137] font-mono text-sm">{multimodalData.modality_counts.text_features} Features</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#0F9D8A]/5 border border-[#0F9D8A]/20 text-center">
                    <span className="text-[10px] text-[#0F9D8A] block uppercase font-mono font-bold">Visual & Acoustics</span>
                    <strong className="text-[#0F9D8A] font-mono text-sm">{multimodalData.modality_counts.media_features} Features</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#F0EBFF] border border-[#6C4DFF]/20 text-center">
                    <span className="text-[10px] text-[#6C4DFF] block uppercase font-mono font-bold">Modality Masks</span>
                    <strong className="text-[#6C4DFF] font-mono text-sm">{multimodalData.modality_counts.modality_masks} Masks</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0] text-center">
                    <span className="text-[10px] text-[#68677D] block uppercase font-mono font-medium">Categorical Encodings</span>
                    <strong className="text-[#242137] font-mono text-sm">{multimodalData.modality_counts.categorical_features} Features</strong>
                  </div>
                </div>
              )}

              {/* Multimodal Feature Coefficients (Top Visual & Acoustic Weights) */}
              {multimodalData?.top_coefficients && multimodalData.top_coefficients.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#68677D] flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-[#6C4DFF]" />
                      Multimodal Feature Weights (Top Visual, Acoustic & Text Signals)
                    </h4>
                    <span className="text-[10.5px] font-mono text-[#68677D]">models/multimodal_model.joblib</span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-[#E7E3F0]">
                    <table className="w-full text-xs text-left">
                      <thead className="text-[11px] font-bold text-[#68677D] uppercase tracking-wider bg-[#F8F7FC] border-b border-[#E7E3F0]">
                        <tr>
                          <th className="py-2.5 px-4">Feature Name</th>
                          <th className="py-2.5 px-4">Modality Source</th>
                          <th className="py-2.5 px-4 text-right">Standardized Coef</th>
                          <th className="py-2.5 px-4 text-right">Relative Magnitude</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E7E3F0]">
                        {multimodalData.top_coefficients.map((item, idx) => {
                          const isMedia = item.modality.includes("Media");
                          const isPositive = item.coefficient > 0;
                          return (
                            <tr key={idx} className="hover:bg-[#F8F7FC]/70 transition-colors">
                              <td className="py-2.5 px-4 font-mono font-medium text-[#242137]">
                                {item.feature}
                              </td>
                              <td className="py-2.5 px-4">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                  isMedia ? "bg-[#0F9D8A]/10 text-[#0F9D8A] border border-[#0F9D8A]/20" : "bg-gray-100 text-[#68677D]"
                                }`}>
                                  {isMedia ? <Film className="w-2.5 h-2.5" /> : <Layers className="w-2.5 h-2.5" />}
                                  {item.modality}
                                </span>
                              </td>
                              <td className={`py-2.5 px-4 text-right font-mono font-bold ${
                                isPositive ? "text-[#0F9D8A]" : "text-[#F06F73]"
                              }`}>
                                {isPositive ? `+${item.coefficient.toFixed(4)}` : item.coefficient.toFixed(4)}
                              </td>
                              <td className="py-2.5 px-4 text-right font-mono text-[#68677D]">
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

              {/* Zero-Leakage & Missing-Modality Scientific Disclosure */}
              <div className="p-4 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0] text-xs text-[#68677D] flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#0F9D8A] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="text-[#242137] block font-bold text-xs uppercase tracking-wider">
                    Scientific Data Leakage Prevention & Missing-Modality Architecture
                  </strong>
                  <p className="leading-relaxed">
                    {multimodalData?.scientific_integrity_note ||
                      "Model evaluated on strictly chronological test splits with prior-only historical statistics. Explicit indicator masks (has_media, has_text, audio_present) allow the model to serve both media-analyzed posts and tabular records without artificial imputation artifacts."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Feature Influence Table (Linear Model Coefficients) */}
          {coefficients.length > 0 && (
            <div className="glass-card p-6 md:p-8 rounded-2xl border border-[#E7E3F0] bg-white shadow-card space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-[#242137] flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-[#6C63FF]" />
                    Feature Influence & Standardized Coefficients
                  </h3>
                  <p className="text-xs text-[#68677D] mt-0.5">
                    Coefficients derived from the trained {data?.metrics?.selected_model || "Ridge Regression"} model.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-[#6C63FF] bg-[#F0EBFF] border border-[#6C4DFF]/20 px-3 py-1 rounded-xl">
                  {coefficients.length} Features
                </span>
              </div>

              <p className="text-xs text-[#68677D] leading-relaxed">
                Standardized features allow comparative interpretation of coefficient magnitudes. Features with larger absolute coefficients exhibit stronger statistical association with follower-normalized engagement rate in the training corpus.
              </p>

              {/* Coefficients Table */}
              <div className="overflow-x-auto rounded-xl border border-[#E7E3F0]">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] font-bold text-[#68677D] uppercase tracking-wider bg-[#F8F7FC] border-b border-[#E7E3F0]">
                    <tr>
                      <th className="py-3 px-4">Feature Name</th>
                      <th className="py-3 px-4 text-right">Coefficient</th>
                      <th className="py-3 px-4 text-center">Direction of Association</th>
                      <th className="py-3 px-4 text-right">Relative Magnitude</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E3F0]">
                    {coefficients.map((item, idx) => {
                      const isPositive = item.coefficient > 0;
                      const isNegative = item.coefficient < 0;
                      return (
                        <tr key={idx} className="hover:bg-[#F8F7FC]/70 transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-[#242137]">
                            {item.feature}
                          </td>
                          <td
                            className={`py-3 px-4 text-right font-mono font-bold ${
                              isPositive
                                ? "text-[#0F9D8A]"
                                : isNegative
                                ? "text-[#F06F73]"
                                : "text-[#68677D]"
                            }`}
                          >
                            {isPositive ? `+${item.coefficient.toFixed(4)}` : item.coefficient.toFixed(4)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                isPositive
                                  ? "bg-[#0F9D8A]/10 text-[#0F9D8A] border border-[#0F9D8A]/30"
                                  : isNegative
                                  ? "bg-[#F06F73]/10 text-[#F06F73] border border-[#F06F73]/30"
                                  : "bg-gray-100 text-[#68677D]"
                              }`}
                            >
                              {isPositive && <TrendingUp className="w-3 h-3" />}
                              {isNegative && <TrendingDown className="w-3 h-3" />}
                              {item.direction}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-[#68677D]">
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
          <div className="p-5 rounded-2xl bg-white border border-[#E7E3F0] shadow-card text-xs text-[#68677D] flex items-start gap-3">
            <Info className="w-5 h-5 text-[#6C63FF] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-[#242137] block font-bold text-sm">
                Interpretation & Scientific Integrity Guidance
              </strong>
              <p className="leading-relaxed">
                Coefficients describe <strong>statistical associations</strong> observed within the training dataset. They do not demonstrate causal mechanisms. For example, a positive coefficient for <code className="font-mono text-[#6C63FF] bg-[#F0EBFF] px-1 py-0.5 rounded">question_count</code> indicates that posts with question marks exhibited higher engagement rates on average in this corpus, not that adding question marks will inherently increase real-world performance.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
