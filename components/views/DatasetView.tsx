"use client";

import React, { useState } from "react";
import {
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Database,
  FileText,
  HelpCircle,
  Info,
} from "lucide-react";
import { uploadAndValidateCsv } from "@/lib/api";
import { CsvValidationResponse } from "@/types";

export default function DatasetView() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CsvValidationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await uploadAndValidateCsv(selected);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to validate CSV file.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    window.open("/api/template", "_blank");
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Dataset & Validation
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            CSV is the supported Version 1 input. TrendSkope does not require Instagram credentials, API keys, or scraping.
          </p>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="btn-secondary text-xs self-start md:self-auto"
        >
          <Download className="w-4 h-4 text-primary-orange" />
          <span>Download CSV Template</span>
        </button>
      </div>

      {/* Active Dataset Overview Card */}
      <div className="glass-card-accent p-6 md:p-8 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                Active Training Corpus
              </span>
              <span className="text-xs text-slate-300 font-mono">1,000 Unique Posts Verified</span>
            </div>
            <h2 className="text-lg font-bold text-white">Dataset Structure & Provenance</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 self-start sm:self-auto">
            instagram_posts_1000.csv
          </span>
        </div>

        {/* 4 Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
            <span className="text-slate-400 text-[11px] block mb-1">Dataset Size</span>
            <strong className="text-xl font-mono font-black text-white">1,000</strong>
            <span className="text-[10px] text-emerald-400 block mt-0.5">100% unique post_ids</span>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
            <span className="text-slate-400 text-[11px] block mb-1">Unique Accounts</span>
            <strong className="text-xl font-mono font-black text-white">40</strong>
            <span className="text-[10px] text-slate-300 block mt-0.5">20–32 posts/account</span>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
            <span className="text-slate-400 text-[11px] block mb-1">Date Range</span>
            <strong className="text-sm font-mono font-bold text-white block mt-1">2025-01 → 2026-09</strong>
            <span className="text-[10px] text-slate-300 block mt-0.5">600+ days span</span>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
            <span className="text-slate-400 text-[11px] block mb-1">Media Breakdown</span>
            <strong className="text-xs font-mono font-bold text-primary-orange block mt-1">
              Reel: 41% · Image: 35% · Carousel: 24%
            </strong>
            <span className="text-[10px] text-slate-300 block mt-0.5">Realistic distribution</span>
          </div>
        </div>

        {/* Scientific Provenance Statement */}
        <div className="p-4 rounded-2xl bg-[#040810]/80 border border-white/10 text-xs text-slate-300 flex items-start gap-3">
          <Info className="w-4 h-4 text-primary-orange shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block font-semibold mb-0.5">Dataset Source & Scientific Integrity Note</strong>
            <p className="text-slate-400 leading-relaxed">
              This research prototype uses a <strong>synthetic research dataset</strong> designed to emulate realistic Instagram post-performance distributions across 10 creator domains. Synthetic records are strictly labeled as simulation data and are not presented as proprietary observations collected from Instagram.
            </p>
          </div>
        </div>
      </div>


      {/* Upload and Validation Area */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border-border/80 space-y-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary-orange" />
          Validate Dataset CSV
        </h2>

        {/* Dropzone */}
        <label
          htmlFor="csv-upload"
          className="border-2 border-dashed border-border hover:border-primary-orange/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-[#040810]/40 hover:bg-white/[0.02] group"
        >
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-2xl bg-primary-orange/10 border border-primary-orange/20 text-primary-orange flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-white">
            {file ? file.name : "Click or drag CSV here to validate"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Validates schema, timestamp formats, follower counts, and target columns.
          </p>
        </label>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex items-center justify-center gap-3 text-xs text-slate-400 py-3">
            <span className="w-4 h-4 border-2 border-primary-orange border-t-transparent rounded-full animate-spin" />
            <span>Validating dataset structure and columns...</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Validation Result */}
        {result && (
          <div className="space-y-4 animate-fade-in">
            {result.valid ? (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-ready shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-300 font-bold block text-sm">
                    Validation Succeeded: {result.post_count.toLocaleString()} posts verified
                  </strong>
                  <p className="text-emerald-200/80 mt-1">
                    All required columns (`post_id`, `account_id`, `published_at`, `media_type`, `caption`, `likes`, `comments`, `followers_at_or_near_collection`) are compliant.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs space-y-2">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>Validation Issues Found ({result.errors.length})</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-rose-200/90 pl-1">
                  {result.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preview Table */}
            {result.preview && result.preview.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Dataset Sample Preview (First 5 Rows)
                </span>
                <div className="overflow-x-auto rounded-xl border border-border bg-[#040810]/80">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-black/40 text-slate-400 uppercase text-[10px] border-b border-border">
                      <tr>
                        {Object.keys(result.preview[0]).map((key) => (
                          <th key={key} className="py-2.5 px-3 whitespace-nowrap">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {result.preview.map((row, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02]">
                          {Object.values(row).map((val: any, cidx) => (
                            <td
                              key={cidx}
                              className="py-2.5 px-3 text-slate-300 whitespace-nowrap max-w-[200px] truncate"
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
      </div>

      {/* Dataset Documentation Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Dataset Card Info */}
        <div className="glass-card p-6 md:p-8 rounded-3xl border-border/80 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-base border-b border-border pb-3">
            <Database className="w-5 h-5 text-primary-orange" />
            <span>Dataset Card Guidelines</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            TrendSkope emphasizes transparent data provenance. Before training on any collected dataset, complete the documentation card in <code className="text-primary-orange bg-black/40 px-1.5 py-0.5 rounded font-mono">docs/dataset_card.md</code>.
          </p>

          <div className="space-y-2.5 text-xs text-slate-400">
            <div className="p-3 rounded-xl bg-surface border border-border">
              <strong className="text-white block mb-0.5">Source & Provenance</strong>
              <span>Record original platform, download timestamp, and collection methodology.</span>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-border">
              <strong className="text-white block mb-0.5">Licensing & Permissions</strong>
              <span>Ensure data usage complies with applicable research terms and distribution licenses.</span>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-border">
              <strong className="text-white block mb-0.5">Known Limitations</strong>
              <span>Account for engagement collection delay, creator diversity skew, and platform algorithmic updates.</span>
            </div>
          </div>
        </div>

        {/* Data Dictionary */}
        <div className="glass-card p-6 md:p-8 rounded-3xl border-border/80 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-base border-b border-border pb-3">
            <FileText className="w-5 h-5 text-primary-orange" />
            <span>Schema & Data Dictionary</span>
          </div>

          <div className="overflow-y-auto max-h-[290px] pr-1 space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-surface border border-border">
              <span className="text-primary-orange font-mono font-bold">post_id</span>
              <span className="text-slate-400 block text-[11px]">Unique identifier for each post (String/Int, non-null)</span>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-border">
              <span className="text-primary-orange font-mono font-bold">account_id</span>
              <span className="text-slate-400 block text-[11px]">Account identifier for computing chronological history</span>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-border">
              <span className="text-primary-orange font-mono font-bold">published_at</span>
              <span className="text-slate-400 block text-[11px]">ISO 8601 publication timestamp (e.g. 2025-01-15T19:00:00Z)</span>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-border">
              <span className="text-primary-orange font-mono font-bold">media_type</span>
              <span className="text-slate-400 block text-[11px]">Categorical post format: &quot;image&quot;, &quot;carousel&quot;, &quot;reel&quot;</span>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-border">
              <span className="text-primary-orange font-mono font-bold">caption</span>
              <span className="text-slate-400 block text-[11px]">Raw caption text for NLP and structural feature engineering</span>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-border">
              <span className="text-primary-orange font-mono font-bold">likes, comments</span>
              <span className="text-slate-400 block text-[11px]">Observed engagement targets (used only to calculate training target, never input)</span>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-border">
              <span className="text-primary-orange font-mono font-bold">followers_at_or_near_collection</span>
              <span className="text-slate-400 block text-[11px]">Follower count used for normalization and scale modeling</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
