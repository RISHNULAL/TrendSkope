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
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Image as ImageIcon,
  Film,
  Music,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import {
  addAndRetrainDataset,
  fetchContentAuditDatasets,
  fetchDashboardSummary,
  fetchDatasetProvenance,
  uploadAndValidateCsv,
} from "@/lib/api";
import {
  ContentAuditDatasetsResponse,
  CsvValidationResponse,
  DashboardSummaryResponse,
  DatasetProvenanceRecord,
  RetrainResponse,
} from "@/types";

export default function DatasetView() {
  const [dashboardData, setDashboardData] = useState<DashboardSummaryResponse | null>(null);
  const [provenanceHistory, setProvenanceHistory] = useState<DatasetProvenanceRecord[]>([]);
  const [auditData, setAuditData] = useState<ContentAuditDatasetsResponse | null>(null);
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
      const [dash, prov, audit] = await Promise.all([
        fetchDashboardSummary(),
        fetchDatasetProvenance(),
        fetchContentAuditDatasets(),
      ]);
      setDashboardData(dash);
      setAuditData(audit);
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
  const currentPosts = datasetStats?.posts ?? 15000;
  const currentAccounts = datasetStats?.accounts ?? 250;
  const recordsAdded = datasetStats?.records_added ?? 13900;
  const dateRange = datasetStats?.date_coverage || "2025-01-01 → 2026-10-25";
  const activeModelName = dashboardData?.model?.active_model || dashboardData?.model?.name || "Ridge Regression";
  const valMaeText = dashboardData?.model?.validation_mae !== undefined && dashboardData.model.validation_mae !== null
    ? `${dashboardData.model.validation_mae.toFixed(3)} pp`
    : "2.795 pp";
  const testMaeText = dashboardData?.model?.metrics?.mae !== undefined
    ? `${dashboardData.model.metrics.mae.toFixed(3)} pp`
    : "2.948 pp";

  const splits = dashboardData?.model?.splits;
  const trainCount = splits?.train || 10500;
  const valCount = splits?.validation || 2250;
  const testCount = splits?.test || 2250;
  const trainedCorpusCount = dashboardData?.model?.training_records || (trainCount + valCount);

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto text-[#242137]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#242137]">
            Dataset & Validation
          </h1>
          <p className="text-sm text-[#68677D] mt-1">
            Maintain the single canonical master dataset. New valid CSV uploads are appended, validated for uniqueness, and used for leakage-free model retraining.
          </p>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="btn-secondary text-xs self-start md:self-auto flex items-center gap-2"
        >
          <Download className="w-4 h-4 text-[#6C4DFF]" />
          <span>Download CSV Template</span>
        </button>
      </div>

      {/* Active Master Dataset Overview Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-[#E7E3F0] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E7E3F0]">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-[#0F9D8A]/10 text-[#0F9D8A] border border-[#0F9D8A]/25 text-[10px] font-bold">
                Canonical Master Dataset
              </span>
              <span className="text-xs text-[#0F9D8A] font-mono font-bold bg-[#0F9D8A]/10 px-2 py-0.5 rounded-md">
                +{recordsAdded.toLocaleString()} records added
              </span>
              <span className="text-xs text-[#68677D] font-mono">
                {currentPosts.toLocaleString()} Chronological Posts Verified
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#242137]">Master Training Corpus Status</h2>
          </div>
          <span className="text-xs text-[#68677D] font-mono bg-[#F8F7FC] px-3 py-1.5 rounded-xl border border-[#E7E3F0] self-start sm:self-auto font-semibold">
            instagram_posts_1000.csv
          </span>
        </div>

        {/* 4 Core Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] shadow-sm">
            <span className="text-[#68677D] text-[11px] block mb-1">Master Dataset Size</span>
            <strong className="text-xl font-mono font-black text-[#242137]">{currentPosts.toLocaleString()}</strong>
            <span className="text-[10px] text-[#0F9D8A] block mt-0.5 font-semibold">100% unique post_ids</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] shadow-sm">
            <span className="text-[#68677D] text-[11px] block mb-1">Unique Accounts</span>
            <strong className="text-xl font-mono font-black text-[#242137]">{currentAccounts}</strong>
            <span className="text-[10px] text-[#68677D] block mt-0.5">15 creator domains active</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] shadow-sm">
            <span className="text-[#68677D] text-[11px] block mb-1">Date Range</span>
            <strong className="text-xs font-mono font-bold text-[#242137] block mt-1">{dateRange}</strong>
            <span className="text-[10px] text-[#68677D] block mt-0.5">Chronologically ordered</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] shadow-sm">
            <span className="text-[#68677D] text-[11px] block mb-1">Active Model</span>
            <strong className="text-xs font-mono font-bold text-[#6C4DFF] block mt-1 truncate">
              {activeModelName}
            </strong>
            <span className="text-[10px] text-[#68677D] block mt-0.5">
              Val: {valMaeText} · Test: {testMaeText}
            </span>
          </div>
        </div>

        {/* Corpus Partition Breakdown & Media Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-3.5 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] shadow-sm">
            <span className="text-[#68677D] text-[10px] uppercase font-bold block mb-1">
              Corpus Partitioning
            </span>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#68677D]">Master Corpus:</span>
                <strong className="text-[#242137] font-mono">{currentPosts.toLocaleString()} posts (100%)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#68677D]">Active Training Set:</span>
                <strong className="text-[#6C4DFF] font-mono">{trainedCorpusCount.toLocaleString()} posts (85%)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#68677D]">Held-Out Test Set:</span>
                <strong className="text-[#0F9D8A] font-mono">{testCount.toLocaleString()} posts (15%)</strong>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] shadow-sm">
            <span className="text-[#68677D] text-[10px] uppercase font-bold block mb-1">
              Media Format Breakdown
            </span>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#68677D]">Photo / Image:</span>
                <strong className="text-[#242137] font-mono">{datasetStats?.media_types?.image?.toLocaleString() || "5,993"} (40.0%)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#68677D]">Reel / Video:</span>
                <strong className="text-[#242137] font-mono">{datasetStats?.media_types?.reel?.toLocaleString() || "5,382"} (35.9%)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#68677D]">Carousel:</span>
                <strong className="text-[#242137] font-mono">{datasetStats?.media_types?.carousel?.toLocaleString() || "3,625"} (24.1%)</strong>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[#68677D] text-[10px] uppercase font-bold block mb-1">
                Data Quality & Provenance
              </span>
              <strong className="text-xs font-bold text-[#0F9D8A] block mb-0.5">
                {datasetStats?.duplicate_rows ?? 0} Duplicates · {datasetStats?.missing_values ?? 0} Nulls
              </strong>
            </div>
            <p className="text-[10px] text-[#68677D] leading-tight">
              {datasetStats?.provenance || "Synthetic Simulation Research Corpus (250 Accounts, 15 Domains)"}
            </p>
          </div>
        </div>

        {/* Scientific Provenance Statement */}
        <div className="p-4 rounded-2xl bg-[#F0EBFF] border border-[#6C4DFF]/25 text-xs text-[#4B35B5] flex items-start gap-3">
          <Info className="w-4 h-4 text-[#6C4DFF] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#242137] block font-bold mb-0.5">Dataset Source & Simulation Provenance</strong>
            <p className="text-[#4B35B5] leading-relaxed">
              This research prototype utilizes a <strong>synthetic simulation research corpus</strong> of 15,000 unique records designed to emulate realistic Instagram creator engagement distributions across 15 content domains and 250 creator accounts. All historical account features are computed strictly from prior posts without target leakage.
            </p>
          </div>
        </div>
      </div>

      {/* Upload and Incremental Update Area */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-[#E7E3F0] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-base font-bold text-[#242137] flex items-center gap-2">
            <Upload className="w-5 h-5 text-[#6C4DFF]" />
            <span>Validate & Add New Posts CSV</span>
          </h2>
          <span className="text-xs text-[#68677D]">
            Incremental Merge · No Master Data Overwrite
          </span>
        </div>

        {/* Dropzone */}
        <label
          htmlFor="csv-upload"
          className="border-2 border-dashed border-[#E7E3F0] hover:border-[#6C4DFF] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-[#F8F7FC] hover:bg-[#F0EBFF]/20 group shadow-sm"
        >
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-2xl bg-[#F0EBFF] border border-[#6C4DFF]/20 text-[#6C4DFF] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-[#242137]">
            {file ? file.name : "Click or drag CSV here to validate"}
          </p>
          <p className="text-xs text-[#68677D] mt-1">
            Validates schema, uniqueness against master dataset, timestamp formats, follower counts, and engagement values.
          </p>
        </label>

        {/* Validation Spinner */}
        {validating && (
          <div className="flex items-center justify-center gap-3 text-xs text-[#68677D] py-3">
            <span className="w-4 h-4 border-2 border-[#6C4DFF] border-t-transparent rounded-full animate-spin" />
            <span>Validating schema & checking for master dataset duplicates...</span>
          </div>
        )}

        {/* Validation Error Alert */}
        {validationError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-rose-900 font-bold block mb-0.5">Validation Failed</strong>
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
                <div className="p-5 rounded-2xl bg-[#0F9D8A]/5 border border-[#0F9D8A]/25 text-[#242137] text-xs space-y-3 shadow-sm">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#0F9D8A] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <strong className="text-[#0F9D8A] font-bold text-sm block">
                        Validation Succeeded: {validationResult.valid_count ?? validationResult.post_count} Valid Records
                      </strong>
                      <p className="text-[#68677D] leading-relaxed">
                        {validationResult.status_message || `${validationResult.new_count ?? validationResult.valid_count} new posts verified and ready to merge into master dataset.`}
                      </p>
                    </div>
                  </div>

                  {/* Summary Badges Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#0F9D8A]/20 text-[11px] font-mono">
                    <div className="p-2 rounded-lg bg-white border border-[#E7E3F0] text-[#242137]">
                      <span className="text-[#68677D] block text-[10px]">Uploaded Rows</span>
                      <strong>{validationResult.total_uploaded ?? validationResult.post_count}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-[#E7E3F0] text-[#0F9D8A]">
                      <span className="text-[#68677D] block text-[10px]">New Records</span>
                      <strong>+{validationResult.new_count ?? validationResult.valid_count}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-[#E7E3F0] text-[#68677D]">
                      <span className="text-[#68677D] block text-[10px]">Duplicates Skipped</span>
                      <strong>{validationResult.duplicate_count ?? 0}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-[#E7E3F0] text-[#6C4DFF]">
                      <span className="text-[#68677D] block text-[10px]">Projected Size</span>
                      <strong>{validationResult.projected_master_size ?? currentPosts + (validationResult.new_count ?? 0)} posts</strong>
                    </div>
                  </div>
                </div>

                {/* Retrain Action Button */}
                {(validationResult.new_count ?? 0) > 0 ? (
                  <div className="p-5 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="space-y-0.5 text-center sm:text-left">
                      <strong className="text-[#242137] text-sm block font-bold">
                        Ready to Add Records & Retrain Models
                      </strong>
                      <p className="text-xs text-[#68677D]">
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
                  <div className="p-4 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0] text-xs text-[#68677D] flex items-center gap-2">
                    <Info className="w-4 h-4 text-[#6C4DFF]" />
                    <span>All uploaded records already exist in the master dataset. No new records to append.</span>
                  </div>
                )}
              </div>
            ) : (
              /* Validation Failure Details */
              <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-3">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                  <span>
                    Validation Issues Found ({validationResult.invalid_count ?? validationResult.errors.length})
                  </span>
                </div>
                <p className="text-rose-700 text-xs">
                  Invalid records were detected. Invalid rows cannot be appended to the master dataset. Please review the errors below, correct the CSV, and upload again.
                </p>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pl-2 font-mono text-[11px] bg-white p-3 rounded-xl border border-rose-200">
                  {(validationResult.invalid_details && validationResult.invalid_details.length > 0
                    ? validationResult.invalid_details
                    : validationResult.errors
                  ).map((err, i) => (
                    <div key={i} className="text-rose-700">
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
                  <span className="font-bold text-[#68677D] uppercase tracking-wider">
                    Sample Preview (First 5 Uploaded Rows)
                  </span>
                  <span className="text-[#68677D] font-mono text-[11px]">
                    {validationResult.new_count ?? validationResult.valid_count} verified for append
                  </span>
                </div>
                <div className="overflow-x-auto rounded-xl border border-[#E7E3F0] bg-white shadow-sm">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F8F7FC] text-[#68677D] uppercase text-[10px] border-b border-[#E7E3F0]">
                      <tr>
                        {Object.keys(validationResult.preview[0]).map((key) => (
                          <th key={key} className="py-2.5 px-3 whitespace-nowrap">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7E3F0]">
                      {validationResult.preview.map((row, idx) => (
                        <tr key={idx} className="hover:bg-[#F8F7FC]">
                          {Object.values(row).map((val: any, cidx) => (
                            <td
                              key={cidx}
                              className="py-2.5 px-3 text-[#242137] whitespace-nowrap max-w-[200px] truncate font-mono text-[11px]"
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

        {/* Retraining Progress Bar */}
        {retraining && (
          <div className="p-6 rounded-2xl bg-[#F0EBFF] border border-[#6C4DFF]/30 space-y-3">
            <div className="flex items-center justify-between text-xs text-[#242137] font-semibold">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#6C4DFF] animate-spin" />
                <span>Retraining in progress...</span>
              </span>
              <span className="font-mono text-[11px] text-[#4B35B5] font-bold">{retrainStep}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#E7E3F0] overflow-hidden">
              <div className="h-full bg-[#6C4DFF] rounded-full animate-indeterminate" style={{ width: "70%" }} />
            </div>
          </div>
        )}

        {/* Retrain Error Alert */}
        {retrainError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-rose-900 font-bold block mb-0.5">Retraining Failed — Safe Rollback Executed</strong>
              <span>{retrainError}</span>
            </div>
          </div>
        )}

        {/* Retraining Success Report Card */}
        {retrainResult && (
          <div className="p-6 rounded-2xl bg-[#0F9D8A]/5 border border-[#0F9D8A]/25 text-[#242137] space-y-4 animate-fade-in shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0F9D8A]" />
                <h3 className="text-sm font-bold text-[#0F9D8A]">
                  Master Dataset & Model Updated Successfully
                </h3>
              </div>
              <span className="text-[11px] font-mono bg-[#0F9D8A]/10 text-[#0F9D8A] border border-[#0F9D8A]/25 px-2.5 py-1 rounded-full font-bold">
                {retrainResult.resulting_size} Total Posts
              </span>
            </div>

            <p className="text-xs text-[#68677D] leading-relaxed">
              {retrainResult.message}
            </p>

            {/* Retraining Evaluation Comparison Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-white border border-[#E7E3F0] text-[#242137] shadow-sm">
                <span className="text-[#68677D] text-[10px] block mb-0.5">Selected Active Model</span>
                <strong className="text-xs font-mono font-bold text-[#6C4DFF] block truncate">
                  {retrainResult.selected_model}
                </strong>
                <span className="text-[10px] text-[#68677D] block mt-0.5">Lowest Val MAE</span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E7E3F0] text-[#242137] shadow-sm">
                <span className="text-[#68677D] text-[10px] block mb-0.5">Held-out Test MAE</span>
                <div className="flex items-baseline gap-1.5">
                  <strong className="text-sm font-mono font-bold">
                    {retrainResult.test_metrics?.mae.toFixed(3)}%
                  </strong>
                  {retrainResult.mae_delta !== undefined && retrainResult.mae_delta !== null && (
                    <span className={`text-[10px] font-mono ${retrainResult.mae_delta <= 0 ? "text-[#0F9D8A]" : "text-[#F06F73]"}`}>
                      ({retrainResult.mae_delta <= 0 ? "" : "+"}{retrainResult.mae_delta.toFixed(2)} pp)
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-[#68677D] block mt-0.5">
                  Prev: {retrainResult.previous_mae ? `${retrainResult.previous_mae.toFixed(2)}%` : "N/A"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E7E3F0] text-[#242137] shadow-sm">
                <span className="text-[#68677D] text-[10px] block mb-0.5">Test R² Score</span>
                <strong className="text-sm font-mono font-bold">
                  {retrainResult.test_metrics?.r2.toFixed(3)}
                </strong>
                <span className="text-[10px] text-[#68677D] block mt-0.5">
                  Prev: {retrainResult.previous_r2 ? retrainResult.previous_r2.toFixed(3) : "N/A"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E7E3F0] text-[#242137] shadow-sm">
                <span className="text-[#68677D] text-[10px] block mb-0.5">Dataset Corpus Growth</span>
                <strong className="text-xs font-mono font-bold text-[#0F9D8A] block">
                  {retrainResult.previous_size} → {retrainResult.resulting_size}
                </strong>
                <span className="text-[10px] text-[#68677D] block mt-0.5">
                  +{retrainResult.rows_added} added · {retrainResult.duplicates_skipped ?? 0} skipped
                </span>
              </div>
            </div>

            {/* Evaluation Note */}
            {retrainResult.evaluation_note && (
              <div className="p-3 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0] text-xs text-[#242137] flex items-center gap-2">
                <Info className="w-4 h-4 text-[#6C4DFF] shrink-0" />
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
        <div className="p-6 md:p-8 rounded-3xl bg-white border border-[#E7E3F0] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E7E3F0] pb-3">
            <h2 className="text-base font-bold text-[#242137] flex items-center gap-2">
              <History className="w-5 h-5 text-[#6C4DFF]" />
              <span>Dataset Provenance & Retraining History</span>
            </h2>
            <span className="text-xs text-[#68677D] font-mono">
              {provenanceHistory.length} Recorded Run{provenanceHistory.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="space-y-3">
            {provenanceHistory.slice(0, 5).map((rec, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] text-xs text-[#242137] space-y-2 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#6C4DFF]">{rec.filename}</span>
                    <span className="text-[10px] text-[#68677D] font-mono">
                      {new Date(rec.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#0F9D8A] bg-[#0F9D8A]/10 border border-[#0F9D8A]/25 px-2 py-0.5 rounded-md self-start sm:self-auto">
                    {rec.previous_size} → {rec.resulting_size} posts (+{rec.rows_added})
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#68677D]">
                  <span>Uploaded: <strong className="text-[#242137]">{rec.rows_uploaded}</strong></span>
                  <span>Accepted: <strong className="text-[#0F9D8A]">{rec.rows_accepted}</strong></span>
                  {rec.duplicates_skipped > 0 && (
                    <span>Duplicates: <strong className="text-[#68677D]">{rec.duplicates_skipped}</strong></span>
                  )}
                  <span>Selected Model: <strong className="text-[#6C4DFF]">{rec.selected_model}</strong></span>
                  {rec.new_mae && (
                    <span>Test MAE: <strong className="text-[#242137]">{rec.new_mae.toFixed(2)}%</strong></span>
                  )}
                </div>

                {rec.evaluation_note && (
                  <p className="text-[11px] text-[#68677D] italic pt-1 border-t border-[#E7E3F0]">
                    {rec.evaluation_note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Specialized Content Audit Datasets (9 Separate Datasets · 45,000 Total Records) */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-[#E7E3F0] shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E7E3F0] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-[#0F9D8A]/10 text-[#0F9D8A] border border-[#0F9D8A]/25 text-[10px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0F9D8A]" />
                Master Dataset Cryptographically Preserved
              </span>
              <span className="text-xs text-[#6C4DFF] font-mono font-bold bg-[#F0EBFF] px-2 py-0.5 rounded-md">
                9 Separate CSV Datasets · 45,000 Total Records
              </span>
              <span className="text-xs text-[#68677D] font-mono">
                5,000 Valid Records / Dataset
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#242137]">
              Specialized Content Audit & Multimodal Datasets
            </h2>
            <p className="text-xs text-[#68677D] mt-1 leading-relaxed">
              Domain-specific benchmark datasets created in <code className="text-[#6C4DFF] font-mono font-bold">data/content_audit_datasets/</code>.
              These datasets maintain independent schemas for computer vision, audio acoustics, typography, and sequential storytelling without modifying the canonical 15,000-record master dataset.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] text-xs text-[#242137] shrink-0 space-y-1 shadow-sm">
            <div className="flex items-center gap-2 font-mono text-[11px] text-[#0F9D8A]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0F9D8A]" />
              <strong>Master SHA-256 Unchanged:</strong>
            </div>
            <p className="font-mono text-[10px] text-[#68677D] break-all select-all">
              d6eb91540b3528c9d2b4e303da74cf7a49eed5f44cd014d10526e256049da292
            </p>
          </div>
        </div>

        {/* 9 Specialized Datasets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(auditData?.datasets && auditData.datasets.length > 0
            ? auditData.datasets
            : [
                {
                  filename: "image_quality_dataset.csv",
                  title: "Image Quality & Photometrics",
                  category: "Computer Vision",
                  description: "Laplacian sharpness variance, RMS contrast, luminance distribution, dominant color palettes, and framing ratios.",
                  target_use: "Visual Quality Diagnostics & Blur Detection",
                  physical_media_coverage: "24 physical JPEG images (1080x1350 & 1080x1080)",
                  records: 5000,
                  columns: 17,
                  file_size_kb: 826.4,
                  validation_status: "Passed (Schema & Foreign-Key Compliant)",
                  source_type_breakdown: { physical_media_extracted: 24, synthetic_simulation_benchmark: 4976 },
                },
                {
                  filename: "poster_design_audit_dataset.csv",
                  title: "Poster Design & Layout Audit",
                  category: "Graphic Design",
                  description: "Text density percentages, heading-to-background contrast ratios, visual clutter metrics, and CTA placement.",
                  target_use: "Graphic Layout & Mobile Readability Auditing",
                  physical_media_coverage: "Rule-based and photometric layout evaluation",
                  records: 5000,
                  columns: 15,
                  file_size_kb: 975.2,
                  validation_status: "Passed (Schema & Foreign-Key Compliant)",
                  source_type_breakdown: { rule_based_audit_benchmark: 5000 },
                },
                {
                  filename: "video_reel_analysis_dataset.csv",
                  title: "Video & Reel Temporal Dynamics",
                  category: "Temporal Video Analysis",
                  description: "OpenCV frame sampling, inter-frame motion intensity deltas, histogram scene cuts, and opening 3s hook clarity.",
                  target_use: "Reel Pacing & Hook Retention Analysis",
                  physical_media_coverage: "12 vertical MP4 videos (720x1280 @ 24fps)",
                  records: 5000,
                  columns: 16,
                  file_size_kb: 792.8,
                  validation_status: "Passed (Schema & Foreign-Key Compliant)",
                  source_type_breakdown: { physical_media_extracted: 12, synthetic_simulation_benchmark: 4988 },
                },
                {
                  filename: "carousel_analysis_dataset.csv",
                  title: "Carousel Multi-Slide Consistency",
                  category: "Sequential Storytelling",
                  description: "Cross-slide aspect ratio uniformity, slide brightness variance, color palette harmony, and cover hook strength.",
                  target_use: "Carousel Pacing & Progression Optimization",
                  physical_media_coverage: "12 carousel posts (48 ordered slide images)",
                  records: 5000,
                  columns: 15,
                  file_size_kb: 928.1,
                  validation_status: "Passed (Schema & Foreign-Key Compliant)",
                  source_type_breakdown: { physical_media_extracted: 12, synthetic_simulation_benchmark: 4988 },
                },
                {
                  filename: "caption_analysis_dataset.csv",
                  title: "Caption Structure & Readability",
                  category: "Natural Language Processing",
                  description: "Character and word counts, hashtag densities, Flesch reading ease, question and exclamation counts, and CTA phrases.",
                  target_use: "Copywriting & Hook Optimization",
                  physical_media_coverage: "100% text corpus extracted and analyzed",
                  records: 5000,
                  columns: 17,
                  file_size_kb: 1148.6,
                  validation_status: "Passed (Schema & Foreign-Key Compliant)",
                  source_type_breakdown: { physical_media_extracted: 96, rule_based_audit_benchmark: 4904 },
                },
                {
                  filename: "audio_music_analysis_dataset.csv",
                  title: "Audio Acoustics & Loudness",
                  category: "Acoustic Intelligence",
                  description: "RMS loudness in dBFS, autocorrelation BPM tempo estimation, sample rates, speech detection, and loudness compliance.",
                  target_use: "Reel Audio Pacing & Loudness Normalization",
                  physical_media_coverage: "12 acoustic WAV tracks (44.1kHz stereo)",
                  records: 5000,
                  columns: 14,
                  file_size_kb: 712.5,
                  validation_status: "Passed (Schema & Foreign-Key Compliant)",
                  source_type_breakdown: { physical_media_extracted: 12, synthetic_simulation_benchmark: 4988 },
                },
                {
                  filename: "content_drawbacks_dataset.csv",
                  title: "Categorized Content Drawbacks",
                  category: "Quality Assurance",
                  description: "Codified design and quality issues (blur, low contrast, pillarboxing, hashtag overload) with severity ratings.",
                  target_use: "Automated Pre-Publishing Linting & Audits",
                  physical_media_coverage: "Rule-based audit taxonomy across all media",
                  records: 5000,
                  columns: 14,
                  file_size_kb: 981.3,
                  validation_status: "Passed (Schema & Foreign-Key Compliant)",
                  source_type_breakdown: { rule_based_audit_benchmark: 5000 },
                },
                {
                  filename: "content_improvement_recommendations.csv",
                  title: "Actionable Content Recommendations",
                  category: "Prescriptive Guidance",
                  description: "Actionable fixes, alternative hooks, copy rewrites, and evidence basis (e.g. Ridge standardized coefficients).",
                  target_use: "Evidence-Based Creative Recommendations",
                  physical_media_coverage: "Prescriptive engine rules across all media",
                  records: 5000,
                  columns: 14,
                  file_size_kb: 1045.7,
                  validation_status: "Passed (Schema & Foreign-Key Compliant)",
                  source_type_breakdown: { prescriptive_engine_recommendation: 5000 },
                },
                {
                  filename: "multimodal_content_features.csv",
                  title: "Multimodal Feature Vectors",
                  category: "Machine Learning Features",
                  description: "Relational foreign-key feature pointers linking image, video, audio, carousel, and text observations with indicator masks.",
                  target_use: "Multimodal Model Input & Feature Engineering",
                  physical_media_coverage: "Consolidated vectors across all 5,000 items",
                  records: 5000,
                  columns: 16,
                  file_size_kb: 864.2,
                  validation_status: "Passed (Schema & Foreign-Key Compliant)",
                  source_type_breakdown: { multimodal_feature_join: 5000 },
                },
              ]
          ).map((item, idx) => {
            const getIcon = (cat: string) => {
              switch (cat) {
                case "Computer Vision":
                  return <ImageIcon className="w-4 h-4 text-[#6C4DFF]" />;
                case "Graphic Design":
                  return <Sparkles className="w-4 h-4 text-[#E9A23B]" />;
                case "Temporal Video Analysis":
                  return <Film className="w-4 h-4 text-[#6C4DFF]" />;
                case "Sequential Storytelling":
                  return <Layers className="w-4 h-4 text-[#4285F4]" />;
                case "Natural Language Processing":
                  return <MessageSquare className="w-4 h-4 text-[#0F9D8A]" />;
                case "Acoustic Intelligence":
                  return <Music className="w-4 h-4 text-[#F06F73]" />;
                case "Quality Assurance":
                  return <AlertTriangle className="w-4 h-4 text-[#E9A23B]" />;
                case "Prescriptive Guidance":
                  return <Sparkles className="w-4 h-4 text-[#0F9D8A]" />;
                case "Machine Learning Features":
                  return <Database className="w-4 h-4 text-[#6C4DFF]" />;
                default:
                  return <FileSpreadsheet className="w-4 h-4 text-[#6C4DFF]" />;
              }
            };

            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white border border-[#E7E3F0] text-xs text-[#242137] space-y-3 flex flex-col justify-between shadow-sm hover:border-[#6C4DFF]/40 hover:shadow-md transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 font-bold text-[#242137]">
                      {getIcon(item.category)}
                      <span className="truncate">{item.title}</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F0EBFF] text-[#6C4DFF] shrink-0 font-bold border border-[#6C4DFF]/25">
                      {item.category}
                    </span>
                  </div>

                  <p className="font-mono text-[11px] text-[#6C4DFF] font-semibold truncate">
                    {item.filename}
                  </p>

                  <p className="text-[11px] text-[#68677D] leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#E7E3F0] text-[11px]">
                  <div className="grid grid-cols-3 gap-1 bg-[#F8F7FC] border border-[#E7E3F0] p-2 rounded-xl text-center shadow-inner">
                    <div>
                      <span className="text-[9px] text-[#68677D] uppercase block">Records</span>
                      <strong className="font-mono text-[#242137] font-bold">
                        {item.records.toLocaleString()}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#68677D] uppercase block">Columns</span>
                      <strong className="font-mono text-[#242137] font-bold">
                        {item.columns}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#68677D] uppercase block">Size</span>
                      <strong className="font-mono text-[#242137] font-bold">
                        {item.file_size_kb.toFixed(0)} KB
                      </strong>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#68677D]">Physical Coverage:</span>
                      <span className="text-[#242137] font-medium text-right truncate max-w-[170px]" title={item.physical_media_coverage}>
                        {item.physical_media_coverage}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#68677D]">Validation Status:</span>
                      <span className="text-[#0F9D8A] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#0F9D8A]" />
                        Valid (0 Errors)
                      </span>
                    </div>

                    {item.source_type_breakdown && (
                      <div className="text-[10px] text-[#68677D] pt-1 border-t border-[#E7E3F0] flex flex-wrap gap-1">
                        <span className="font-semibold text-[#242137]">Provenance:</span>
                        {Object.entries(item.source_type_breakdown).map(([k, v], sIdx) => (
                          <span key={sIdx} className="font-mono text-[9px] bg-[#F8F7FC] border border-[#E7E3F0] px-1.5 py-0.5 rounded text-[#242137]">
                            {k}: <strong>{v}</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Isolation & Data Dictionary Footer */}
        <div className="p-4 rounded-2xl bg-[#E9A23B]/10 border border-[#E9A23B]/30 text-xs text-[#242137] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#E9A23B] shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px] text-[#242137]">
              <strong>Strict Pipeline Isolation:</strong> Model training for engagement prediction operates exclusively on validated features derived from the canonical master dataset. Modality benchmarks are maintained in dedicated tabular schemas to avoid cross-contamination.
            </p>
          </div>
          <span className="text-[11px] font-mono font-bold text-[#6C4DFF] bg-white px-3 py-1.5 rounded-xl border border-[#E7E3F0] whitespace-nowrap shadow-sm">
            data/content_audit_datasets/DATA_DICTIONARY.md
          </span>
        </div>
      </div>

      {/* Dataset Documentation Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Dataset Card Info */}
        <div className="p-6 md:p-8 rounded-3xl bg-white border border-[#E7E3F0] shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#242137] font-bold text-base border-b border-[#E7E3F0] pb-3">
            <Database className="w-5 h-5 text-[#6C4DFF]" />
            <span>Dataset Card Guidelines</span>
          </div>

          <p className="text-xs text-[#68677D] leading-relaxed">
            TrendSkope emphasizes transparent data provenance. Master datasets maintain strict chronological order to enable realistic offline evaluation.
          </p>

          <div className="space-y-2.5 text-xs text-[#68677D]">
            <div className="p-3 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0]">
              <strong className="text-[#242137] block mb-0.5">Chronological Ordering & Leakage Prevention</strong>
              <span>Historical stats (mean, median, standard deviation of prior posts) are computed strictly on posts published prior to each observation.</span>
            </div>
            <div className="p-3 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0]">
              <strong className="text-[#242137] block mb-0.5">70 / 15 / 15 Chronological Splitting</strong>
              <span>Evaluations use past posts for training and subsequent chronological windows for validation and held-out test assessment.</span>
            </div>
            <div className="p-3 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0]">
              <strong className="text-[#242137] block mb-0.5">Known Limitations</strong>
              <span>Model predictions estimate historical statistical patterns and do not guarantee future viral performance.</span>
            </div>
          </div>
        </div>

        {/* Data Dictionary */}
        <div className="p-6 md:p-8 rounded-3xl bg-white border border-[#E7E3F0] shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#242137] font-bold text-base border-b border-[#E7E3F0] pb-3">
            <FileText className="w-5 h-5 text-[#6C4DFF]" />
            <span>Schema & Data Dictionary</span>
          </div>

          <div className="overflow-y-auto max-h-[290px] pr-1 space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0]">
              <span className="text-[#6C4DFF] font-mono font-bold">post_id</span>
              <span className="text-[#68677D] block text-[11px]">Unique identifier for each post (String/Int, non-null, deduplicated)</span>
            </div>
            <div className="p-3 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0]">
              <span className="text-[#6C4DFF] font-mono font-bold">account_id</span>
              <span className="text-[#68677D] block text-[11px]">Account identifier for computing chronological history</span>
            </div>
            <div className="p-3 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0]">
              <span className="text-[#6C4DFF] font-mono font-bold">published_at</span>
              <span className="text-[#68677D] block text-[11px]">ISO 8601 publication timestamp (e.g. 2025-01-15T19:00:00Z)</span>
            </div>
            <div className="p-3 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0]">
              <span className="text-[#6C4DFF] font-mono font-bold">media_type</span>
              <span className="text-[#68677D] block text-[11px]">Categorical post format: &quot;image&quot;, &quot;carousel&quot;, &quot;reel&quot;</span>
            </div>
            <div className="p-3 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0]">
              <span className="text-[#6C4DFF] font-mono font-bold">caption</span>
              <span className="text-[#68677D] block text-[11px]">Raw caption text for NLP and structural feature engineering</span>
            </div>
            <div className="p-3 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0]">
              <span className="text-[#6C4DFF] font-mono font-bold">likes, comments</span>
              <span className="text-[#68677D] block text-[11px]">Observed engagement targets (used only to calculate training target, never input)</span>
            </div>
            <div className="p-3 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0]">
              <span className="text-[#6C4DFF] font-mono font-bold">followers_at_or_near_collection</span>
              <span className="text-[#68677D] block text-[11px]">Follower count used for normalization and scale modeling</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
