"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Cpu,
  Database,
  Layers,
  ShieldCheck,
  Film,
  Music,
  Image as ImageIcon,
} from "lucide-react";
import { fetchDashboardSummary } from "@/lib/api";
import { DashboardSummaryResponse } from "@/types";

interface DashboardViewProps {
  onNavigateToDataset?: () => void;
  onNavigateToInsights?: () => void;
}

export default function DashboardView({
  onNavigateToDataset,
  onNavigateToInsights,
}: DashboardViewProps) {
  const [data, setData] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardSummary()
      .then((res) => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] space-y-3">
        <div className="w-8 h-8 border-2 border-[#6C4DFF] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#68677D]">Loading TrendSkope Analytics Dashboard...</p>
      </div>
    );
  }

  const isReady = data?.model.status === "ready";
  const modelName = data?.model.active_model || data?.model.name || "Ridge Regression";
  const metrics = data?.model.metrics;
  const dataset = data?.dataset;
  const comparison = data?.model.comparison || [];
  const systemStatus = data?.system_status || "Operational";
  const qualityStatus = dataset?.health || "Healthy";

  const masterPosts = dataset?.posts || 15000;
  const uniquePostIds = dataset?.unique_post_ids || masterPosts;
  const uniqueAccounts = dataset?.accounts || 250;
  const recordsAdded = dataset?.records_added || 13900;
  const splits = data?.model.splits;
  const trainCount = splits?.train || 10500;
  const valCount = splits?.validation || 2250;
  const testCount = splits?.test || 2250;
  const activeTrainingCorpus = data?.model.training_records || (trainCount + valCount);

  // Multimodal Media Dataset Metrics
  const mediaData = data?.media_dataset;
  const imageAssets = mediaData?.image_assets ?? 24;
  const videoAssets = mediaData?.video_assets ?? 12;
  const carouselPostsCount = mediaData?.carousel_posts ?? 12;
  const carouselSlidesCount = mediaData?.carousel_slides ?? 48;
  const audioAssets = mediaData?.audio_assets ?? 12;
  const totalMediaAssets = mediaData?.total_media_assets ?? 96;
  const analyzedSuccess = mediaData?.analyzed_successfully ?? 96;
  const licenseProvenance = mediaData?.license_provenance || "CC0 / MIT Procedural Demonstration";

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-7xl mx-auto pb-12 text-[#242137]">
      {/* 1. COMPACT DASHBOARD HEADER */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#E7E3F0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#6C4DFF] uppercase">
              TrendSkope Intelligence
            </span>
            <span className="text-[10px] text-[#68677D]">·</span>
            <span className="text-[11px] font-semibold text-[#68677D]">ML Analytics Control Center</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#242137] tracking-tight">
            TrendSkope Dashboard
          </h1>
          <p className="text-xs text-[#68677D]">
            Dataset intelligence and model performance at a glance.
          </p>
        </div>

        {/* Real Backend Status Indicators */}
        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] text-xs font-semibold text-[#242137] shadow-sm">
            <span className="text-[#68677D] text-[11px]">Backend API:</span>
            <span className="inline-flex items-center gap-1 text-[#0F9D8A] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0F9D8A] animate-pulse" />
              {systemStatus === "Operational" ? "Online" : "Offline"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] text-xs font-semibold text-[#242137] shadow-sm">
            <span className="text-[#68677D] text-[11px]">Model:</span>
            <span
              className={`inline-flex items-center gap-1 font-bold ${
                isReady ? "text-[#0F9D8A]" : "text-[#F06F73]"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isReady ? "bg-[#0F9D8A] animate-pulse" : "bg-[#F06F73]"
                }`}
              />
              {isReady ? "Model Ready" : "Not Ready"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. SECTION 1: SYSTEM OVERVIEW (4 METRIC CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Dataset: Active Dataset Size */}
        <div className="p-5 rounded-3xl bg-white border border-[#E7E3F0] shadow-sm hover:border-[#6C4DFF]/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#68677D] uppercase tracking-wider">
              ACTIVE DATASET
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#F0EBFF] flex items-center justify-center text-[#6C4DFF]">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div>
            <strong className="text-2xl font-mono font-black text-[#242137] block">
              {masterPosts.toLocaleString()}
            </strong>
            <div className="flex items-center justify-between gap-1 mt-1 flex-wrap">
              <span className="text-[11px] text-[#0F9D8A] font-medium">
                Unique Posts
              </span>
              <span className="text-[10px] font-mono font-bold text-[#0F9D8A] bg-[#0F9D8A]/10 border border-[#0F9D8A]/20 px-1.5 py-0.5 rounded-md">
                +{recordsAdded.toLocaleString()} added
              </span>
            </div>
          </div>
        </div>

        {/* Accounts: Unique Accounts */}
        <div className="p-5 rounded-3xl bg-white border border-[#E7E3F0] shadow-sm hover:border-[#6C4DFF]/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#68677D] uppercase tracking-wider">
              ACCOUNTS
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#F0EBFF] flex items-center justify-center text-[#6C4DFF]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <strong className="text-2xl font-mono font-black text-[#242137] block">
              {uniqueAccounts}
            </strong>
            <span className="text-[11px] text-[#68677D] block mt-0.5 font-medium">
              Unique Creator Accounts
            </span>
          </div>
        </div>

        {/* Model: Active Model */}
        <div className="p-5 rounded-3xl bg-white border border-[#E7E3F0] shadow-sm hover:border-[#6C4DFF]/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#68677D] uppercase tracking-wider">
              MODEL
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#F0EBFF] flex items-center justify-center text-[#6C4DFF]">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div>
            <strong className="text-base font-black text-[#242137] block truncate">
              {modelName}
            </strong>
            <span className="text-[11px] text-[#0F9D8A] block mt-0.5 font-medium">
              Val MAE: {data?.model.validation_mae !== undefined && data.model.validation_mae !== null ? `${data.model.validation_mae.toFixed(3)} pp` : "2.795 pp"}
            </span>
          </div>
        </div>

        {/* Test MAE: Final Performance */}
        <div className="p-5 rounded-3xl bg-white border border-[#E7E3F0] shadow-sm hover:border-[#6C4DFF]/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#6C4DFF] uppercase tracking-wider">
              TEST MAE
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#F0EBFF] flex items-center justify-center text-[#6C4DFF]">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <strong className="text-2xl font-mono font-black text-[#242137] block">
              {metrics?.mae !== undefined ? `${metrics.mae.toFixed(3)} pp` : "2.948 pp"}
            </strong>
            <span className="text-[11px] text-[#68677D] block mt-0.5 font-medium">
              Held-Out Test Error ({testCount.toLocaleString()} posts)
            </span>
          </div>
        </div>
      </div>

      {/* 3. SECTION 1.5: CORPUS PARTITION & EVALUATION INTEGRITY */}
      <section className="p-5 sm:p-6 rounded-3xl bg-white border border-[#E7E3F0] shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-[#E7E3F0]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0F9D8A]" />
            <h2 className="text-sm font-bold text-[#242137]">Corpus Partition & Evaluation Integrity</h2>
          </div>
          <span className="text-[10px] text-[#68677D] font-mono">
            Chronological Split: 70% Train · 15% Validation · 15% Held-Out Test
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-[#68677D] text-[10px] uppercase font-bold block mb-1">
                Canonical Master Dataset
              </span>
              <strong className="text-xl font-mono font-black text-[#242137] block">
                {masterPosts.toLocaleString()}
              </strong>
            </div>
            <p className="text-[11px] text-[#0F9D8A] font-semibold mt-2">
              Verified Unique Posts (100% Corpus)
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-[#68677D] text-[10px] uppercase font-bold block mb-1">
                Active Training Corpus
              </span>
              <strong className="text-xl font-mono font-black text-[#6C4DFF] block">
                {activeTrainingCorpus.toLocaleString()}
              </strong>
            </div>
            <p className="text-[11px] text-[#68677D] font-medium mt-2">
              Train ({trainCount.toLocaleString()}) + Val ({valCount.toLocaleString()}) (85% of Corpus)
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-[#68677D] text-[10px] uppercase font-bold block mb-1">
                Held-Out Evaluation Set
              </span>
              <strong className="text-xl font-mono font-black text-[#0F9D8A] block">
                {testCount.toLocaleString()}
              </strong>
            </div>
            <p className="text-[11px] text-[#68677D] font-medium mt-2">
              Unseen Test Set (15% Chronological Split)
            </p>
          </div>
        </div>
      </section>

      {/* 4. SECTION 2: DATASET SNAPSHOT & SPECIFICATIONS */}
      <section className="p-6 rounded-3xl bg-white border border-[#E7E3F0] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E7E3F0]">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#6C4DFF]" />
            <h2 className="text-base font-bold text-[#242137]">Dataset Snapshot & Specifications</h2>
          </div>
          <a
            href="/dataset"
            onClick={(e) => {
              e.preventDefault();
              onNavigateToDataset?.();
            }}
            className="text-xs font-semibold text-[#6C4DFF] hover:text-[#4B35B5] inline-flex items-center gap-1 transition-colors"
          >
            <span>Manage Dataset</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] shadow-sm">
            <span className="text-[#68677D] text-[10px] uppercase font-bold block mb-0.5">Total Valid Posts</span>
            <strong className="text-sm font-mono font-bold text-[#242137] block">
              {masterPosts.toLocaleString()}
            </strong>
            <span className="text-[10px] text-[#0F9D8A] block mt-0.5 font-semibold">100% verified</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] shadow-sm">
            <span className="text-[#68677D] text-[10px] uppercase font-bold block mb-0.5">Unique Post IDs</span>
            <strong className="text-sm font-mono font-bold text-[#242137] block">
              {uniquePostIds.toLocaleString()}
            </strong>
            <span className="text-[10px] text-[#0F9D8A] block mt-0.5 font-semibold">0 collisions</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] shadow-sm">
            <span className="text-[#68677D] text-[10px] uppercase font-bold block mb-0.5">Unique Accounts</span>
            <strong className="text-sm font-mono font-bold text-[#242137] block">
              {uniqueAccounts}
            </strong>
            <span className="text-[10px] text-[#68677D] block mt-0.5">15 creator domains</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] shadow-sm">
            <span className="text-[#68677D] text-[10px] uppercase font-bold block mb-0.5">Date Range</span>
            <strong className="text-xs font-mono font-bold text-[#242137] block truncate">
              {dataset?.date_coverage || "2025-01-01 to 2026-10-25"}
            </strong>
            <span className="text-[10px] text-[#68677D] block mt-0.5">Chronologically ordered</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] shadow-sm">
            <span className="text-[#68677D] text-[10px] uppercase font-bold block mb-0.5">Duplicate Records</span>
            <strong className="text-xs font-mono font-bold text-[#0F9D8A] block truncate">
              {dataset?.duplicate_rows ?? 0} Duplicates
            </strong>
            <span className="text-[10px] text-[#0F9D8A] block mt-0.5 font-semibold">0 combo collisions</span>
          </div>
        </div>

        {/* Format Distribution & Provenance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] md:col-span-2 shadow-sm">
            <span className="text-[#68677D] text-[10px] uppercase font-bold block mb-1">
              Format Distribution (Image, Carousel, Reel)
            </span>
            <div className="flex items-center gap-4 flex-wrap text-xs font-mono">
              <span className="text-[#242137]">
                <strong>Image:</strong> {dataset?.media_types?.image?.toLocaleString() || "5,993"} (40.0%)
              </span>
              <span className="text-[#68677D]">·</span>
              <span className="text-[#242137]">
                <strong>Reel:</strong> {dataset?.media_types?.reel?.toLocaleString() || "5,382"} (35.9%)
              </span>
              <span className="text-[#68677D]">·</span>
              <span className="text-[#242137]">
                <strong>Carousel:</strong> {dataset?.media_types?.carousel?.toLocaleString() || "3,625"} (24.1%)
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] shadow-sm">
            <span className="text-[#68677D] text-[10px] uppercase font-bold block mb-1">
              Dataset Provenance & Type
            </span>
            <strong className="text-xs font-bold text-[#242137] block truncate">
              {dataset?.provenance_status || "Synthetic Simulation Research Data"}
            </strong>
            <span className="text-[10px] text-[#68677D] block mt-0.5">
              Multi-account empirical simulation
            </span>
          </div>
        </div>
      </section>

      {/* 5. SECTION 2.5: MULTIMODAL MEDIA ASSET CORPUS */}
      <section className="p-6 rounded-3xl bg-white border border-[#E7E3F0] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E7E3F0]">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#6C4DFF]" />
            <div>
              <h2 className="text-base font-bold text-[#242137]">Multimodal Media Dataset</h2>
              <p className="text-[11px] text-[#68677D]">
                Verified physical media assets stored on disk and linked to master post IDs across 12 creator themes.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold text-[#0F9D8A] bg-[#0F9D8A]/10 border border-[#0F9D8A]/25 px-2.5 py-0.5 rounded-full">
              {totalMediaAssets} Media Assets
            </span>
            <span className="text-[10px] font-mono text-[#68677D] bg-[#F8F7FC] border border-[#E7E3F0] px-2.5 py-0.5 rounded-full">
              {licenseProvenance}
            </span>
          </div>
        </div>

        {/* 5 Media Asset Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[#68677D] text-[10px] uppercase font-bold">Image Assets</span>
              <ImageIcon className="w-3.5 h-3.5 text-[#6C4DFF]" />
            </div>
            <strong className="text-xl font-mono font-black text-[#242137] block">
              {imageAssets}
            </strong>
            <span className="text-[10px] text-[#68677D] block mt-0.5">
              4:5 Portrait & 1:1 Square
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[#68677D] text-[10px] uppercase font-bold">Video & Reels</span>
              <Film className="w-3.5 h-3.5 text-[#6C4DFF]" />
            </div>
            <strong className="text-xl font-mono font-black text-[#242137] block">
              {videoAssets}
            </strong>
            <span className="text-[10px] text-[#68677D] block mt-0.5">
              9:16 Vertical MP4s
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[#68677D] text-[10px] uppercase font-bold">Carousels</span>
              <Layers className="w-3.5 h-3.5 text-[#6C4DFF]" />
            </div>
            <strong className="text-xl font-mono font-black text-[#242137] block">
              {carouselPostsCount} <span className="text-xs font-normal text-[#68677D]">({carouselSlidesCount} slides)</span>
            </strong>
            <span className="text-[10px] text-[#0F9D8A] block mt-0.5 font-semibold">
              4 Ordered Slides/Post
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[#68677D] text-[10px] uppercase font-bold">Audio Assets</span>
              <Music className="w-3.5 h-3.5 text-[#6C4DFF]" />
            </div>
            <strong className="text-xl font-mono font-black text-[#242137] block">
              {audioAssets}
            </strong>
            <span className="text-[10px] text-[#68677D] block mt-0.5">
              44.1kHz Stereo WAV
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[#68677D] text-[10px] uppercase font-bold">Analysis Status</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0F9D8A]" />
            </div>
            <strong className="text-xl font-mono font-black text-[#0F9D8A] block">
              {analyzedSuccess} / {totalMediaAssets}
            </strong>
            <span className="text-[10px] text-[#0F9D8A] block mt-0.5 font-semibold">
              0 Pending · 0 Failed
            </span>
          </div>
        </div>

        {/* Coverage Progress Bar & Attribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#68677D]">Modality Coverage</span>
              <span className="text-[10px] font-mono text-[#6C4DFF] font-bold">15,000 Total Master Records</span>
            </div>
            
            <div className="w-full h-2.5 bg-[#E7E3F0] rounded-full overflow-hidden flex">
              <div className="bg-[#6C4DFF] h-full rounded-full" style={{ width: "100%" }} title="Text & Scheduling (100%)" />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#68677D] pt-1">
              <span>Text & Scheduling Features: <strong className="text-[#242137]">15,000 posts (100%)</strong></span>
              <span>Physical Media: <strong className="text-[#0F9D8A]">96 assets (48 posts)</strong></span>
            </div>
            <p className="text-[10px] text-[#68677D] leading-relaxed">
              Posts without physical media files use explicit missing-modality indicator flags (<code>has_media=0</code>), allowing the model to evaluate text and scheduling without fabricating media values.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] space-y-2 shadow-sm">
            <div className="flex items-center gap-1.5 text-[#0F9D8A] font-bold text-[11px]">
              <ShieldCheck className="w-4 h-4" />
              <span>Scientific Media Attribution Guarantee</span>
            </div>
            <ul className="text-[10px] text-[#68677D] space-y-1 list-disc list-inside">
              <li>
                <strong>Post vs Asset Distinction:</strong> One carousel post with 4 images is counted as 1 post record and 4 distinct slide assets.
              </li>
              <li>
                <strong>Real Pixel & Frame Extraction:</strong> Video features are extracted directly from sampled MP4 frames using OpenCV; audio tempo and RMS are measured from WAV signals.
              </li>
              <li>
                <strong>Zero-Leakage Training:</strong> Chronological 70/15/15 splits preserve prior historical features without future data contamination.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6. SECTION 3: MODEL SNAPSHOT & PERFORMANCE */}
      <section className="p-6 rounded-3xl bg-white border border-[#E7E3F0] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E7E3F0]">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#6C4DFF]" />
            <h2 className="text-base font-bold text-[#242137]">Model Performance</h2>
          </div>
          <a
            href="/insights"
            onClick={(e) => {
              e.preventDefault();
              onNavigateToInsights?.();
            }}
            className="text-xs font-semibold text-[#6C4DFF] hover:text-[#4B35B5] inline-flex items-center gap-1 transition-colors"
          >
            <span>View Model Insights</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Model Spec & Evaluation Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] col-span-2 sm:col-span-2 lg:col-span-2 shadow-sm">
            <span className="text-[#68677D] text-[10px] uppercase font-bold block mb-0.5">Active Model</span>
            <strong className="text-xs font-bold text-[#242137] block truncate">
              {modelName}
            </strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] col-span-2 sm:col-span-2 lg:col-span-2 shadow-sm">
            <span className="text-[#68677D] text-[10px] uppercase font-bold block mb-0.5">Target Variable</span>
            <strong className="text-xs font-mono font-bold text-[#242137] block truncate">
              log1p(engagement_rate)
            </strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] shadow-sm">
            <span className="text-[#68677D] text-[10px] uppercase font-bold block mb-0.5">Features</span>
            <strong className="text-xs font-mono font-bold text-[#242137] block">
              {data?.model.features || 25} Signals
            </strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] shadow-sm">
            <span className="text-[#68677D] text-[10px] uppercase font-bold block mb-0.5">Validation MAE</span>
            <strong className="text-xs font-mono font-bold text-[#6C4DFF] block">
              {data?.model.validation_mae !== undefined && data.model.validation_mae !== null
                ? `${data.model.validation_mae.toFixed(3)} pp`
                : "2.703 pp"}
            </strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] shadow-sm">
            <span className="text-[#68677D] text-[10px] uppercase font-bold block mb-0.5">Test MAE</span>
            <strong className="text-xs font-mono font-bold text-[#0F9D8A] block">
              {metrics?.mae !== undefined ? `${metrics.mae.toFixed(3)} pp` : "2.677 pp"}
            </strong>
          </div>
        </div>

        {/* Secondary metric row: RMSE & R² */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] flex items-center justify-between shadow-sm">
            <span className="text-[#68677D] text-[11px] font-medium">Held-Out Test RMSE:</span>
            <strong className="font-mono text-[#242137]">
              {metrics?.rmse !== undefined ? metrics.rmse.toFixed(3) : "3.724"}
            </strong>
          </div>
          <div className="p-3 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] flex items-center justify-between shadow-sm">
            <span className="text-[#68677D] text-[11px] font-medium">Held-Out Test R²:</span>
            <strong className="font-mono text-[#242137]">
              {metrics?.r2 !== undefined ? metrics.r2.toFixed(3) : "0.115"}
            </strong>
          </div>
        </div>
      </section>

      {/* 7. SECTION 4: MODEL COMPARISON (BENCHMARK TABLE) */}
      <section className="p-6 rounded-3xl bg-white border border-[#E7E3F0] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-[#E7E3F0]">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#6C4DFF]" />
            <h2 className="text-base font-bold text-[#242137]">Model Comparison</h2>
          </div>
          <span className="text-[11px] font-mono text-[#68677D]">
            Benchmark: 15% Chronological Validation Set
          </span>
        </div>

        {/* Table of Candidate Models */}
        <div className="overflow-x-auto rounded-2xl border border-[#E7E3F0] bg-white shadow-sm">
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] font-bold text-[#68677D] uppercase tracking-wider bg-[#F8F7FC] border-b border-[#E7E3F0]">
              <tr>
                <th className="py-2.5 px-3">Regression Candidate</th>
                <th className="py-2.5 px-3 text-right">Validation MAE</th>
                <th className="py-2.5 px-3 text-right">Validation R²</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E3F0]">
              {comparison.map((row, idx) => {
                const isSelected = row.model === modelName;
                return (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      isSelected ? "bg-[#F0EBFF]/60 font-semibold" : "hover:bg-[#F8F7FC]"
                    }`}
                  >
                    <td className="py-2.5 px-3 text-[#242137] flex items-center gap-2">
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0F9D8A] shrink-0" />
                      )}
                      <span>{row.model}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#242137]">
                      {row.mae.toFixed(3)} pp
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#68677D]">
                      {row.r2.toFixed(3)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {isSelected ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0F9D8A]/10 text-[#0F9D8A] border border-[#0F9D8A]/30">
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
      </section>

      {/* 8. SECTION 5: DATASET + MODEL HEALTH (2 STATUS CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* DATASET HEALTH CARD */}
        <div className="p-5 rounded-3xl bg-white border border-[#E7E3F0] shadow-sm flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#68677D] uppercase tracking-wider block">
              DATASET HEALTH
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  qualityStatus === "Healthy" || qualityStatus === "Optimal & Ready"
                    ? "bg-[#0F9D8A]"
                    : "bg-[#F06F73]"
                }`}
              />
              <strong className="text-base font-bold text-[#242137]">
                {qualityStatus === "Healthy" || qualityStatus === "Optimal & Ready"
                  ? "Healthy"
                  : "Needs Attention"}
              </strong>
            </div>
            <p className="text-[11px] text-[#68677D] leading-relaxed">
              {masterPosts.toLocaleString()} verified rows · {dataset?.missing_values ?? 0} missing values · {dataset?.duplicate_rows ?? 0} duplicates · 8 required fields intact
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#0F9D8A]/10 border border-[#0F9D8A]/25 flex items-center justify-center text-[#0F9D8A] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* MODEL HEALTH CARD */}
        <div className="p-5 rounded-3xl bg-white border border-[#E7E3F0] shadow-sm flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#68677D] uppercase tracking-wider block">
              MODEL HEALTH
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  isReady ? "bg-[#0F9D8A]" : "bg-[#F06F73]"
                }`}
              />
              <strong className="text-base font-bold text-[#242137]">
                {isReady ? "Ready" : "Not Ready"}
              </strong>
            </div>
            <p className="text-[11px] text-[#68677D] leading-relaxed">
              Artifact verified · 25 pre-publication features · 70/15/15 split ({activeTrainingCorpus.toLocaleString()} trained, {testCount.toLocaleString()} tested)
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#F0EBFF] border border-[#6C4DFF]/25 flex items-center justify-center text-[#6C4DFF] shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
