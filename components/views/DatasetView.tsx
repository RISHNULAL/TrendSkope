"use client";

import React, { useState, useEffect } from "react";
import {
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Database,
  FileText,
  Info,
  Play,
  History,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import {
  addAndRetrainDataset,
  fetchDashboardSummary,
  fetchDatasetProvenance,
  uploadAndValidateCsv,
} from "@/lib/api";
import {
  CsvValidationResponse,
  DashboardSummaryResponse,
  DatasetProvenanceRecord,
  RetrainResponse,
} from "@/types";

export default function DatasetView() {
  const [dashboardData, setDashboardData] = useState<DashboardSummaryResponse | null>(null);
  const [provenanceHistory, setProvenanceHistory] = useState<DatasetProvenanceRecord[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<CsvValidationResponse | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Retraining state
  const [retraining, setRetraining] = useState(false);
  const [retrainStep, setRetrainStep] = useState<string>("");
  const [retrainResult, setRetrainResult] = useState<RetrainResponse | null>(null);
  const [retrainError, setRetrainError] = useState<string | null>(null);

  // Load initial dashboard & provenance data
  const loadData = async () => {
    try {
      const [dash, prov] = await Promise.all([
        fetchDashboardSummary(),
        fetchDatasetProvenance(),
      ]);
      setDashboardData(dash);
      if (prov?.history) {
        setProvenanceHistory(prov.history);
      } else if (dash?.dataset?.provenance_history) {
        setProvenanceHistory(dash.dataset.provenance_history);
      }
    } catch (err) {
      console.error("Failed to load dataset status:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setValidating(true);
    setValidationError(null);
    setValidationResult(null);
    setRetrainResult(null);
    setRetrainError(null);

    try {
      const res = await uploadAndValidateCsv(selected);
      setValidationResult(res);
    } catch (err: any) {
      setValidationError(err.message || "Failed to validate CSV file.");
    } finally {
      setValidating(false);
    }
  };

  const handleAddAndRetrain = async () => {
    if (!file || !validationResult || !validationResult.valid || (validationResult.new_count ?? 0) === 0) {
      return;
    }

    setRetraining(true);
    setRetrainError(null);
    setRetrainResult(null);

    setRetrainStep("1/5: Merging new records & sorting chronologically...");
    const t1 = setTimeout(() => setRetrainStep("2/5: Recalculating leakage-free historical features..."), 400);
    const t2 = setTimeout(() => setRetrainStep("3/5: Chronological split (70% Train, 15% Val, 15% Test)..."), 800);
    const t3 = setTimeout(() => setRetrainStep("4/5: Retraining 6 regression models & selecting best..."), 1200);
    const t4 = setTimeout(() => setRetrainStep("5/5: Evaluating on held-out test set & updating active model..."), 1600);

    try {
      const result = await addAndRetrainDataset(file);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      setRetrainResult(result);
      // Reload dashboard stats and history
      await loadData();
    } catch (err: any) {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      setRetrainError(err.message || "Dataset was validated, but model retraining failed. The previous active model remains in use.");
    } finally {
      setRetraining(false);
    }
  };

  const handleDownloadTemplate = () => {
    window.open("/api/template", "_blank");
  };

  const datasetStats = dashboardData?.dataset;
  const currentPosts = datasetStats?.posts ?? 1000;
  const currentAccounts = datasetStats?.accounts ?? 40;
  const dateRange = datasetStats?.date_coverage || "2025-01 → 2026-09";

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#3D4852]">
            Dataset & Validation
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Maintain the single canonical master dataset. New valid CSV uploads are appended, validated for uniqueness, and used for leakage-free model retraining.
          </p>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="btn-secondary text-xs self-start md:self-auto"
        >
          <Download className="w-4 h-4 text-[#6C63FF]" />
          <span>Download CSV Template</span>
        </button>
      </div>

      {/* Active Master Dataset Overview Card */}
      <div className="glass-card-accent p-6 md:p-8 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-transparent">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-[#0F766E] border border-emerald-500/30 text-[10px] font-bold">
                Canonical Master Dataset
              </span>
              <span className="text-xs text-[#6B7280] font-mono">
                {currentPosts.toLocaleString()} Chronological Posts Verified
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#3D4852]">Master Training Corpus Status</h2>
          </div>
          <span className="text-xs text-[#6B7280] font-mono bg-[#E0E5EC] px-3 py-1.5 rounded-xl border border-transparent self-start sm:self-auto">
            instagram_posts_1000.csv
          </span>
        </div>

        {/* 4 Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#E0E5EC] border border-transparent">
            <span className="text-[#6B7280] text-[11px] block mb-1">Master Dataset Size</span>
            <strong className="text-xl font-mono font-black text-[#3D4852]">{currentPosts.toLocaleString()}</strong>
            <span className="text-[10px] text-[#0F766E] block mt-0.5">100% unique post_ids</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#E0E5EC] border border-transparent">
            <span className="text-[#6B7280] text-[11px] block mb-1">Unique Accounts</span>
            <strong className="text-xl font-mono font-black text-[#3D4852]">{currentAccounts}</strong>
            <span className="text-[10px] text-[#6B7280] block mt-0.5">Prior-post history active</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#E0E5EC] border border-transparent">
            <span className="text-[#6B7280] text-[11px] block mb-1">Date Range</span>
            <strong className="text-xs font-mono font-bold text-[#3D4852] block mt-1">{dateRange}</strong>
            <span className="text-[10px] text-[#6B7280] block mt-0.5">Chronologically sorted</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#E0E5EC] border border-transparent">
            <span className="text-[#6B7280] text-[11px] block mb-1">Active Model</span>
            <strong className="text-xs font-mono font-bold text-[#6C63FF] block mt-1 truncate">
              {dashboardData?.model?.active_model || "Bayesian Ridge"}
            </strong>
            <span className="text-[10px] text-[#6B7280] block mt-0.5">
              Val MAE: {dashboardData?.model?.validation_mae ? `${dashboardData.model.validation_mae.toFixed(3)}%` : "2.703%"}
            </span>
          </div>
        </div>

        {/* Scientific Provenance Statement */}
        <div className="p-4 rounded-2xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] border border-transparent text-xs text-[#6B7280] flex items-start gap-3">
          <Info className="w-4 h-4 text-[#6C63FF] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#3D4852] block font-semibold mb-0.5">Dataset Source & Simulation Provenance</strong>
            <p className="text-[#6B7280] leading-relaxed">
              This research prototype utilizes a <strong>synthetic simulation research corpus</strong> designed to emulate realistic Instagram creator engagement distributions. Uploaded CSV batches are validated against this corpus to prevent schema corruption, duplicate IDs, and future-data leakage.
            </p>
          </div>
        </div>
      </div>

      {/* Upload and Incremental Update Area */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border-border/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-base font-bold text-[#3D4852] flex items-center gap-2">
            <Upload className="w-5 h-5 text-[#6C63FF]" />
            <span>Validate & Add New Posts CSV</span>
          </h2>
          <span className="text-xs text-[#6B7280]">
            Incremental Merge · No Master Data Overwrite
          </span>
        </div>

        {/* Dropzone */}
        <label
          htmlFor="csv-upload"
          className="border-2 border-dashed border-border hover:border-[#6C63FF] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] hover:bg-[#E0E5EC] group"
        >
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-2xl bg-primary-orange/10 border border-transparent text-[#6C63FF] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-[#3D4852]">
            {file ? file.name : "Click or drag CSV here to validate"}
          </p>
          <p className="text-xs text-[#6B7280] mt-1">
            Validates schema, uniqueness against master dataset, timestamp formats, follower counts, and engagement values.
          </p>
        </label>

        {/* Validation Spinner */}
        {validating && (
          <div className="flex items-center justify-center gap-3 text-xs text-[#6B7280] py-3">
            <span className="w-4 h-4 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
            <span>Validating schema & checking for master dataset duplicates...</span>
          </div>
        )}

        {/* Validation Error Alert */}
        {validationError && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-[#BE123C] shrink-0 mt-0.5" />
            <div>
              <strong className="text-rose-100 font-bold block mb-0.5">Validation Failed</strong>
              <span>{validationError}</span>
            </div>
          </div>
        )}

        {/* Validation Result & Actions */}
        {validationResult && (
          <div className="space-y-5 animate-fade-in">
            {validationResult.valid ? (
              <div className="space-y-4">
                {/* Validation Status Card */}
                <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-xs space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#0F766E] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <strong className="text-[#0F766E] font-bold text-sm block">
                        Validation Succeeded: {validationResult.valid_count ?? validationResult.post_count} Valid Records
                      </strong>
                      <p className="text-emerald-200/90 leading-relaxed">
                        {validationResult.status_message || `${validationResult.new_count ?? validationResult.valid_count} new posts verified and ready to merge into master dataset.`}
                      </p>
                    </div>
                  </div>

                  {/* Summary Badges Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-500/20 text-[11px] font-mono">
                    <div className="p-2 rounded-lg bg-[#E0E5EC]/60 text-[#3D4852]">
                      <span className="text-[#6B7280] block text-[10px]">Uploaded Rows</span>
                      <strong>{validationResult.total_uploaded ?? validationResult.post_count}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-[#E0E5EC]/60 text-[#0F766E]">
                      <span className="text-[#6B7280] block text-[10px]">New Records</span>
                      <strong>+{validationResult.new_count ?? validationResult.valid_count}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-[#E0E5EC]/60 text-[#6B7280]">
                      <span className="text-[#6B7280] block text-[10px]">Duplicates Skipped</span>
                      <strong>{validationResult.duplicate_count ?? 0}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-[#E0E5EC]/60 text-[#6C63FF]">
                      <span className="text-[#6B7280] block text-[10px]">Projected Size</span>
                      <strong>{validationResult.projected_master_size ?? currentPosts + (validationResult.new_count ?? 0)} posts</strong>
                    </div>
                  </div>
                </div>

                {/* Retrain Action Button */}
                {(validationResult.new_count ?? 0) > 0 ? (
                  <div className="p-5 rounded-2xl bg-[#E0E5EC] border border-transparent flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-0.5 text-center sm:text-left">
                      <strong className="text-[#3D4852] text-sm block font-bold">
                        Ready to Add Records & Retrain Models
                      </strong>
                      <p className="text-xs text-[#6B7280]">
                        Merges {validationResult.new_count} posts into master dataset ({currentPosts} → {validationResult.projected_master_size}), recomputes historical features chronologically, and retrains all 6 models.
                      </p>
                    </div>

                    <button
                      onClick={handleAddAndRetrain}
                      disabled={retraining}
                      className="btn-primary shrink-0 text-xs px-5 py-2.5 flex items-center gap-2"
                    >
                      {retraining ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Retraining...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Add to Dataset & Retrain</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#E0E5EC] text-xs text-[#6B7280] flex items-center gap-2">
                    <Info className="w-4 h-4 text-[#6C63FF]" />
                    <span>All uploaded records already exist in the master dataset. No new records to append.</span>
                  </div>
                )}
              </div>
            ) : (
              /* Validation Failure Details */
              <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs space-y-3">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                  <AlertCircle className="w-5 h-5 text-[#BE123C]" />
                  <span>
                    Validation Issues Found ({validationResult.invalid_count ?? validationResult.errors.length})
                  </span>
                </div>
                <p className="text-rose-200/90 text-xs">
                  Invalid records were detected. Invalid rows cannot be appended to the master dataset. Please review the errors below, correct the CSV, and upload again.
                </p>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pl-2 font-mono text-[11px] bg-black/20 p-3 rounded-xl border border-rose-500/20">
                  {(validationResult.invalid_details && validationResult.invalid_details.length > 0
                    ? validationResult.invalid_details
                    : validationResult.errors
                  ).map((err, i) => (
                    <div key={i} className="text-rose-200/90">
                      • {err}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preview Table of Uploaded Batch */}
            {validationResult.preview && validationResult.preview.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#6B7280] uppercase tracking-wider">
                    Sample Preview (First 5 Uploaded Rows)
                  </span>
                  <span className="text-[#6B7280] font-mono text-[11px]">
                    {validationResult.new_count ?? validationResult.valid_count} verified for append
                  </span>
                </div>
                <div className="overflow-x-auto rounded-xl border border-border bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#E0E5EC] text-[#6B7280] uppercase text-[10px] border-b border-border">
                      <tr>
                        {Object.keys(validationResult.preview[0]).map((key) => (
                          <th key={key} className="py-2.5 px-3 whitespace-nowrap">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {validationResult.preview.map((row, idx) => (
                        <tr key={idx} className="hover:bg-[#E0E5EC]">
                          {Object.values(row).map((val: any, cidx) => (
                            <td
                              key={cidx}
                              className="py-2.5 px-3 text-[#6B7280] whitespace-nowrap max-w-[200px] truncate font-mono text-[11px]"
                            >
                              {String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Retraining Progress Bar / Steps */}
        {retraining && (
          <div className="p-6 rounded-2xl bg-[#E0E5EC] border border-transparent space-y-3 animate-pulse">
            <div className="flex items-center justify-between text-xs text-[#3D4852] font-semibold">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#6C63FF] animate-spin" />
                <span>Retraining in progress...</span>
              </span>
              <span className="font-mono text-[11px] text-[#6B7280]">{retrainStep}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#E0E5EC] overflow-hidden shadow-[inset_2px_2px_4px_rgb(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]">
              <div className="h-full bg-[#6C63FF] rounded-full animate-indeterminate" style={{ width: "70%" }} />
            </div>
          </div>
        )}

        {/* Retrain Error Alert */}
        {retrainError && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-[#BE123C] shrink-0 mt-0.5" />
            <div>
              <strong className="text-rose-100 font-bold block mb-0.5">Retraining Failed — Safe Rollback Executed</strong>
              <span>{retrainError}</span>
            </div>
          </div>
        )}

        {/* Retraining Success Report Card */}
        {retrainResult && (
          <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-200 space-y-4 animate-fade-in">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0F766E]" />
                <h3 className="text-sm font-bold text-[#0F766E]">
                  Master Dataset & Model Updated Successfully
                </h3>
              </div>
              <span className="text-[11px] font-mono bg-emerald-500/20 text-[#0F766E] px-2.5 py-1 rounded-full font-bold">
                {retrainResult.resulting_size} Total Posts
              </span>
            </div>

            <p className="text-xs text-emerald-200/90 leading-relaxed">
              {retrainResult.message}
            </p>

            {/* Retraining Evaluation Comparison Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-[#E0E5EC] border border-transparent text-[#3D4852]">
                <span className="text-[#6B7280] text-[10px] block mb-0.5">Selected Active Model</span>
                <strong className="text-xs font-mono font-bold text-[#6C63FF] block truncate">
                  {retrainResult.selected_model}
                </strong>
                <span className="text-[10px] text-[#6B7280] block mt-0.5">Lowest Val MAE</span>
              </div>

              <div className="p-3 rounded-xl bg-[#E0E5EC] border border-transparent text-[#3D4852]">
                <span className="text-[#6B7280] text-[10px] block mb-0.5">Held-out Test MAE</span>
                <div className="flex items-baseline gap-1.5">
                  <strong className="text-sm font-mono font-bold">
                    {retrainResult.test_metrics?.mae.toFixed(3)}%
                  </strong>
                  {retrainResult.mae_delta !== undefined && retrainResult.mae_delta !== null && (
                    <span className={`text-[10px] font-mono ${retrainResult.mae_delta <= 0 ? "text-[#0F766E]" : "text-[#BE123C]"}`}>
                      ({retrainResult.mae_delta <= 0 ? "" : "+"}{retrainResult.mae_delta.toFixed(2)} pp)
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-[#6B7280] block mt-0.5">
                  Prev: {retrainResult.previous_mae ? `${retrainResult.previous_mae.toFixed(2)}%` : "N/A"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#E0E5EC] border border-transparent text-[#3D4852]">
                <span className="text-[#6B7280] text-[10px] block mb-0.5">Test R² Score</span>
                <strong className="text-sm font-mono font-bold">
                  {retrainResult.test_metrics?.r2.toFixed(3)}
                </strong>
                <span className="text-[10px] text-[#6B7280] block mt-0.5">
                  Prev: {retrainResult.previous_r2 ? retrainResult.previous_r2.toFixed(3) : "N/A"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#E0E5EC] border border-transparent text-[#3D4852]">
                <span className="text-[#6B7280] text-[10px] block mb-0.5">Dataset Corpus Growth</span>
                <strong className="text-xs font-mono font-bold text-[#0F766E] block">
                  {retrainResult.previous_size} → {retrainResult.resulting_size}
                </strong>
                <span className="text-[10px] text-[#6B7280] block mt-0.5">
                  +{retrainResult.rows_added} added · {retrainResult.duplicates_skipped ?? 0} skipped
                </span>
              </div>
            </div>

            {/* Neutral Evaluation Note */}
            {retrainResult.evaluation_note && (
              <div className="p-3 rounded-xl bg-[#E0E5EC] border border-transparent text-xs text-[#3D4852] flex items-center gap-2">
                <Info className="w-4 h-4 text-[#6C63FF] shrink-0" />
                <span>
                  <strong>Evaluation Assessment:</strong> {retrainResult.evaluation_note}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dataset Provenance / Upload History Section */}
      {provenanceHistory.length > 0 && (
        <div className="glass-card p-6 md:p-8 rounded-3xl border-border/80 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-base font-bold text-[#3D4852] flex items-center gap-2">
              <History className="w-5 h-5 text-[#6C63FF]" />
              <span>Dataset Provenance & Retraining History</span>
            </h2>
            <span className="text-xs text-[#6B7280] font-mono">
              {provenanceHistory.length} Recorded Run{provenanceHistory.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="space-y-3">
            {provenanceHistory.slice(0, 5).map((rec, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#E0E5EC] border border-transparent text-xs text-[#3D4852] space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#6C63FF]">{rec.filename}</span>
                    <span className="text-[10px] text-[#6B7280] font-mono">
                      {new Date(rec.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#0F766E] bg-emerald-500/10 px-2 py-0.5 rounded-md self-start sm:self-auto">
                    {rec.previous_size} → {rec.resulting_size} posts (+{rec.rows_added})
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#6B7280]">
                  <span>Uploaded: <strong className="text-[#3D4852]">{rec.rows_uploaded}</strong></span>
                  <span>Accepted: <strong className="text-[#0F766E]">{rec.rows_accepted}</strong></span>
                  {rec.duplicates_skipped > 0 && (
                    <span>Duplicates: <strong className="text-[#6B7280]">{rec.duplicates_skipped}</strong></span>
                  )}
                  <span>Selected Model: <strong className="text-[#6C63FF]">{rec.selected_model}</strong></span>
                  {rec.new_mae && (
                    <span>Test MAE: <strong className="text-[#3D4852]">{rec.new_mae.toFixed(2)}%</strong></span>
                  )}
                </div>

                {rec.evaluation_note && (
                  <p className="text-[11px] text-[#6B7280] italic pt-1 border-t border-border/40">
                    {rec.evaluation_note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dataset Documentation Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Dataset Card Info */}
        <div className="glass-card p-6 md:p-8 rounded-3xl border-border/80 space-y-4">
          <div className="flex items-center gap-2 text-[#3D4852] font-bold text-base border-b border-border pb-3">
            <Database className="w-5 h-5 text-[#6C63FF]" />
            <span>Dataset Card Guidelines</span>
          </div>

          <p className="text-xs text-[#6B7280] leading-relaxed">
            TrendSkope emphasizes transparent data provenance. Master datasets maintain strict chronological order to enable realistic offline evaluation.
          </p>

          <div className="space-y-2.5 text-xs text-[#6B7280]">
            <div className="p-3 rounded-xl bg-surface border border-border">
              <strong className="text-[#3D4852] block mb-0.5">Chronological Ordering & Leakage Prevention</strong>
              <span>Historical stats (mean, median, standard deviation of prior posts) are computed strictly on posts published prior to each observation.</span>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-border">
              <strong className="text-[#3D4852] block mb-0.5">70 / 15 / 15 Chronological Splitting</strong>
              <span>Evaluations use past posts for training and subsequent chronological windows for validation and held-out test assessment.</span>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-border">
              <strong className="text-[#3D4852] block mb-0.5">Known Limitations</strong>
              <span>Model predictions estimate historical statistical patterns and do not guarantee future viral performance.</span>
            </div>
          </div>
        </div>

        {/* Data Dictionary */}
        <div className="glass-card p-6 md:p-8 rounded-3xl border-border/80 space-y-4">
          <div className="flex items-center gap-2 text-[#3D4852] font-bold text-base border-b border-border pb-3">
            <FileText className="w-5 h-5 text-[#6C63FF]" />
            <span>Schema & Data Dictionary</span>
          </div>

          <div className="overflow-y-auto max-h-[290px] pr-1 space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-surface border border-border">
              <span className="text-[#6C63FF] font-mono font-bold">post_id</span>
              <span className="text-[#6B7280] block text-[11px]">Unique identifier for each post (String/Int, non-null, deduplicated)</span>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-border">
              <span className="text-[#6C63FF] font-mono font-bold">account_id</span>
              <span className="text-[#6B7280] block text-[11px]">Account identifier for computing chronological history</span>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-border">
              <span className="text-[#6C63FF] font-mono font-bold">published_at</span>
              <span className="text-[#6B7280] block text-[11px]">ISO 8601 publication timestamp (e.g. 2025-01-15T19:00:00Z)</span>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-border">
              <span className="text-[#6C63FF] font-mono font-bold">media_type</span>
              <span className="text-[#6B7280] block text-[11px]">Categorical post format: &quot;image&quot;, &quot;carousel&quot;, &quot;reel&quot;</span>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-border">
              <span className="text-[#6C63FF] font-mono font-bold">caption</span>
              <span className="text-[#6B7280] block text-[11px]">Raw caption text for NLP and structural feature engineering</span>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-border">
              <span className="text-[#6C63FF] font-mono font-bold">likes, comments</span>
              <span className="text-[#6B7280] block text-[11px]">Observed engagement targets (used only to calculate training target, never input)</span>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-border">
              <span className="text-[#6C63FF] font-mono font-bold">followers_at_or_near_collection</span>
              <span className="text-[#6B7280] block text-[11px]">Follower count used for normalization and scale modeling</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
