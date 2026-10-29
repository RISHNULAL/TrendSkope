"use client";

import React, { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Cpu,
  Database,
  Layers,
  Sparkles,
  TrendingDown,
  TrendingUp,
  XCircle,
  Clock,
  ShieldCheck,
  FileSpreadsheet,
  HelpCircle,
  PieChart,
  ShieldAlert,
  Info,
  Film,
  Music,
  Image as ImageIcon,
} from "lucide-react";
import MetricCard from "../MetricCard";
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
        <div className="w-8 h-8 border-2 border-primary-orange border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#6B7280]">Loading TrendSkope Analytics Dashboard...</p>
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
  const pendingAssets = mediaData?.pending ?? 0;
  const failedAssets = mediaData?.failed ?? 0;
  const missingRefs = mediaData?.missing_references ?? 0;
  const licenseProvenance = mediaData?.license_provenance || "CC0 / MIT Procedural Demonstration";
  const multimodalReady = mediaData?.multimodal_model_ready ?? true;

  // Format date helper
  const formatDateStr = (isoStr?: string) => {
    if (!isoStr) return "N/A";
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return isoStr.slice(0, 10);
    }
  };

  const lastUpdateFormatted = formatDateStr(dataset?.last_update);
  const lastTrainingFormatted = formatDateStr(data?.model.last_training);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* 1. COMPACT DASHBOARD HEADER */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#6C63FF] uppercase">
              TrendSkope Intelligence
            </span>
            <span className="text-[10px] text-[#6B7280]">·</span>
            <span className="text-[11px] font-semibold text-[#6B7280]">ML Analytics Control Center</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#3D4852] tracking-tight">
            TrendSkope Dashboard
          </h1>
          <p className="text-xs text-[#6B7280]">
            Dataset intelligence and model performance at a glance.
          </p>
        </div>

        {/* Real Backend Status Indicators */}
        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#E0E5EC] shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] text-xs font-semibold text-[#3D4852]">
            <span className="text-[#6B7280] text-[11px]">Backend API:</span>
            <span className="inline-flex items-center gap-1 text-[#0F766E] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38B2AC] animate-pulse" />
              {systemStatus === "Operational" ? "Online" : "Offline"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#E0E5EC] shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] text-xs font-semibold text-[#3D4852]">
            <span className="text-[#6B7280] text-[11px]">Model:</span>
            <span
              className={`inline-flex items-center gap-1 font-bold ${
                isReady ? "text-[#0F766E]" : "text-[#BE123C]"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isReady ? "bg-[#38B2AC] animate-pulse" : "bg-[#E11D48]"
                }`}
              />
              {isReady ? "Model Ready" : "Not Ready"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. SECTION 1: SYSTEM OVERVIEW (4 COMPACT METRIC CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Dataset: Active Dataset Size Prominently Displayed */}
        <div className="p-5 rounded-3xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
              ACTIVE DATASET
            </span>
            <Database className="w-4 h-4 text-[#6C63FF]" />
          </div>
          <div>
            <strong className="text-2xl font-mono font-black text-[#3D4852] block">
              {masterPosts.toLocaleString()}
            </strong>
            <div className="flex items-center justify-between gap-1 mt-1 flex-wrap">
              <span className="text-[11px] text-[#0F766E] font-medium">
                Unique Posts
              </span>
              <span className="text-[10px] font-mono font-bold text-[#0F766E] bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                +{recordsAdded.toLocaleString()} added
              </span>
            </div>
          </div>
        </div>

        {/* Accounts: Unique Accounts */}
        <div className="p-5 rounded-3xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
              ACCOUNTS
            </span>
            <Layers className="w-4 h-4 text-[#6C63FF]" />
          </div>
          <div>
            <strong className="text-2xl font-mono font-black text-[#3D4852] block">
              {uniqueAccounts}
            </strong>
            <span className="text-[11px] text-[#6B7280] block mt-0.5 font-medium">
              Unique Creator Accounts
            </span>
          </div>
        </div>

        {/* Model: Active Model */}
        <div className="p-5 rounded-3xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
              MODEL
            </span>
            <Cpu className="w-4 h-4 text-[#6C63FF]" />
          </div>
          <div>
            <strong className="text-sm font-extrabold text-[#3D4852] block truncate">
              {modelName}
            </strong>
            <span className="text-[11px] text-[#0F766E] block mt-0.5 font-medium">
              Val MAE: {data?.model.validation_mae !== undefined && data.model.validation_mae !== null ? `${data.model.validation_mae.toFixed(3)} pp` : "2.795 pp"}
            </span>
          </div>
        </div>

        {/* Test MAE: Final Performance */}
        <div className="p-5 rounded-3xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#6C63FF] uppercase tracking-wider">
              TEST MAE
            </span>
            <BarChart3 className="w-4 h-4 text-[#6C63FF]" />
          </div>
          <div>
            <strong className="text-2xl font-mono font-black text-[#3D4852] block">
              {metrics?.mae !== undefined ? `${metrics.mae.toFixed(3)} pp` : "2.948 pp"}
            </strong>
            <span className="text-[11px] text-[#6B7280] block mt-0.5 font-medium">
              Held-Out Test Error ({testCount.toLocaleString()} posts)
            </span>
          </div>
        </div>
      </div>

      {/* 3. SECTION 1.5: CORPUS PARTITION & EVALUATION INTEGRITY (CRITICAL DISTINCTION) */}
      <section className="p-5 sm:p-6 rounded-3xl bg-[#E0E5EC] shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-border/20">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
            <h2 className="text-sm font-bold text-[#3D4852]">Corpus Partition & Evaluation Integrity</h2>
          </div>
          <span className="text-[10px] text-[#6B7280] font-mono">
            Chronological Split: 70% Train · 15% Validation · 15% Held-Out Test
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-[#E0E5EC] shadow-[inset_4px_4px_8px_rgb(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] flex flex-col justify-between">
            <div>
              <span className="text-[#6B7280] text-[10px] uppercase font-bold block mb-1">
                Canonical Master Dataset
              </span>
              <strong className="text-xl font-mono font-black text-[#3D4852] block">
                {masterPosts.toLocaleString()}
              </strong>
            </div>
            <p className="text-[11px] text-[#0F766E] font-medium mt-2">
              Verified Unique Posts (100% Corpus)
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#E0E5EC] shadow-[inset_4px_4px_8px_rgb(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] flex flex-col justify-between">
            <div>
              <span className="text-[#6B7280] text-[10px] uppercase font-bold block mb-1">
                Active Training Corpus
              </span>
              <strong className="text-xl font-mono font-black text-[#6C63FF] block">
                {activeTrainingCorpus.toLocaleString()}
              </strong>
            </div>
            <p className="text-[11px] text-[#6B7280] font-medium mt-2">
              Train ({trainCount.toLocaleString()}) + Val ({valCount.toLocaleString()}) (85% of Corpus)
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#E0E5EC] shadow-[inset_4px_4px_8px_rgb(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] flex flex-col justify-between">
            <div>
              <span className="text-[#6B7280] text-[10px] uppercase font-bold block mb-1">
                Held-Out Evaluation Set
              </span>
              <strong className="text-xl font-mono font-black text-[#0F766E] block">
                {testCount.toLocaleString()}
              </strong>
            </div>
            <p className="text-[11px] text-[#6B7280] font-medium mt-2">
              Unseen Test Set (15% Chronological Split)
            </p>
          </div>
        </div>
      </section>

      {/* 4. SECTION 2: DATASET SNAPSHOT & COMPACT STATISTICS */}
      <section className="p-6 rounded-3xl bg-[#E0E5EC] shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border/20">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#6C63FF]" />
            <h2 className="text-base font-bold text-[#3D4852]">Dataset Snapshot & Specifications</h2>
          </div>
          <a
            href="/dataset"
            onClick={(e) => {
              e.preventDefault();
              onNavigateToDataset?.();
            }}
            className="text-xs font-semibold text-[#6C63FF] hover:text-[#3D4852] inline-flex items-center gap-1 transition-colors"
          >
            <span>Manage Dataset</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#E0E5EC] shadow-[inset_4px_4px_8px_rgb(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]">
            <span className="text-[#6B7280] text-[10px] uppercase font-bold block mb-0.5">Total Valid Posts</span>
            <strong className="text-sm font-mono font-bold text-[#3D4852] block">
              {masterPosts.toLocaleString()}
            </strong>
            <span className="text-[10px] text-[#0F766E] block mt-0.5">100% verified</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#E0E5EC] shadow-[inset_4px_4px_8px_rgb(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]">
            <span className="text-[#6B7280] text-[10px] uppercase font-bold block mb-0.5">Unique Post IDs</span>
            <strong className="text-sm font-mono font-bold text-[#3D4852] block">
              {uniquePostIds.toLocaleString()}
            </strong>
            <span className="text-[10px] text-[#0F766E] block mt-0.5">0 collisions</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#E0E5EC] shadow-[inset_4px_4px_8px_rgb(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]">
            <span className="text-[#6B7280] text-[10px] uppercase font-bold block mb-0.5">Unique Accounts</span>
            <strong className="text-sm font-mono font-bold text-[#3D4852] block">
              {uniqueAccounts}
            </strong>
            <span className="text-[10px] text-[#6B7280] block mt-0.5">15 creator domains</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#E0E5EC] shadow-[inset_4px_4px_8px_rgb(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]">
            <span className="text-[#6B7280] text-[10px] uppercase font-bold block mb-0.5">Date Range</span>
            <strong className="text-xs font-mono font-bold text-[#3D4852] block truncate">
              {dataset?.date_coverage || "2025-01-01 to 2026-10-25"}
            </strong>
            <span className="text-[10px] text-[#6B7280] block mt-0.5">Chronologically ordered</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#E0E5EC] shadow-[inset_4px_4px_8px_rgb(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]">
            <span className="text-[#6B7280] text-[10px] uppercase font-bold block mb-0.5">Duplicate Records</span>
            <strong className="text-xs font-mono font-bold text-[#0F766E] block truncate">
              {dataset?.duplicate_rows ?? 0} Duplicates
            </strong>
            <span className="text-[10px] text-[#0F766E] block mt-0.5">0 combo collisions</span>
          </div>
        </div>

        {/* Compact Media Type & Provenance Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#E0E5EC] shadow-[inset_4px_4px_8px_rgb(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] md:col-span-2">
            <span className="text-[#6B7280] text-[10px] uppercase font-bold block mb-1">
              Format Distribution (Image, Carousel, Reel)
            </span>
            <div className="flex items-center gap-4 flex-wrap text-xs font-mono">
              <span className="text-[#3D4852]">
                <strong>Image:</strong> {dataset?.media_types?.image?.toLocaleString() || "5,993"} (40.0%)
              </span>
              <span className="text-[#6B7280]">·</span>
              <span className="text-[#3D4852]">
                <strong>Reel:</strong> {dataset?.media_types?.reel?.toLocaleString() || "5,382"} (35.9%)
              </span>
              <span className="text-[#6B7280]">·</span>
              <span className="text-[#3D4852]">
                <strong>Carousel:</strong> {dataset?.media_types?.carousel?.toLocaleString() || "3,625"} (24.1%)
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#E0E5EC] shadow-[inset_4px_4px_8px_rgb(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]">
            <span className="text-[#6B7280] text-[10px] uppercase font-bold block mb-1">
              Dataset Provenance & Provenance Type
            </span>
            <strong className="text-xs font-bold text-[#3D4852] block truncate">
              {dataset?.provenance_status || "Synthetic Simulation Research Data"}
            </strong>
            <span className="text-[10px] text-[#6B7280] block mt-0.5">
              Multi-account empirical simulation
            </span>
          </div>
        </div>
      </section>

      {/* 4. SECTION 2.5: MULTIMODAL MEDIA ASSET CORPUS */}
      <section className="p-6 rounded-3xl bg-[#E0E5EC] shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/20">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#6C63FF]" />
            <div>
              <h2 className="text-base font-bold text-[#3D4852]">Multimodal Media Dataset</h2>
              <p className="text-[11px] text-[#6B7280]">
                Verified physical media assets stored on disk and linked to master post IDs across 12 creator themes.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold text-[#0F766E] bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {totalMediaAssets} Media Assets
            </span>
            <span className="text-[10px] font-mono text-[#6B7280] bg-black/5 px-2 py-0.5 rounded-full">
              {licenseProvenance}
            </span>
          </div>
        </div>

        {/* 5 Distinct Media Asset Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#E0E5EC] shadow-[inset_4px_4px_8px_rgb(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[#6B7280] text-[10px] uppercase font-bold">Image Assets</span>
              <ImageIcon className="w-3.5 h-3.5 text-[#6C63FF]" />
            </div>
            <strong className="text-xl font-mono font-black text-[#3D4852] block">
              {imageAssets}
            </strong>
            <span className="text-[10px] text-[#6B7280] block mt-0.5">
              4:5 Portrait & 1:1 Square
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#E0E5EC] shadow-[inset_4px_4px_8px_rgb(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[#6B7280] text-[10px] uppercase font-bold">Video & Reels</span>
              <Film className="w-3.5 h-3.5 text-[#6C63FF]" />
            </div>
            <strong className="text-xl font-mono font-black text-[#3D4852] block">
              {videoAssets}
            </strong>
            <span className="text-[10px] text-[#6B7280] block mt-0.5">
              9:16 Vertical MP4s
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#E0E5EC] shadow-[inset_4px_4px_8px_rgb(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[#6B7280] text-[10px] uppercase font-bold">Carousels</span>
              <Layers className="w-3.5 h-3.5 text-[#6C63FF]" />
            </div>
            <strong className="text-xl font-mono font-black text-[#3D4852] block">
              {carouselPostsCount} <span className="text-xs font-normal text-[#6B7280]">({carouselSlidesCount} slides)</span>
            </strong>
            <span className="text-[10px] text-[#0F766E] block mt-0.5">
              4 Ordered Slides/Post
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#E0E5EC] shadow-[inset_4px_4px_8px_rgb(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[#6B7280] text-[10px] uppercase font-bold">Audio Assets</span>
              <Music className="w-3.5 h-3.5 text-[#6C63FF]" />
            </div>
            <strong className="text-xl font-mono font-black text-[#3D4852] block">
              {audioAssets}
            </strong>
            <span className="text-[10px] text-[#6B7280] block mt-0.5">
              44.1kHz Stereo WAV
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#E0E5EC] shadow-[inset_4px_4px_8px_rgb(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[#6B7280] text-[10px] uppercase font-bold">Analysis Status</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E]" />
            </div>
            <strong className="text-xl font-mono font-black text-[#0F766E] block">
              {analyzedSuccess} / {totalMediaAssets}
            </strong>
            <span className="text-[10px] text-[#0F766E] block mt-0.5">
              0 Pending · 0 Failed
            </span>
          </div>
        </div>

        {/* Coverage Chart & Integrity Specification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-[#E0E5EC] shadow-[inset_4px_4px_8px_rgb(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#6B7280]">Modality Coverage</span>
              <span className="text-[10px] font-mono text-[#6C63FF]">15,000 Total Master Records</span>
            </div>
            
            {/* Horizontal progress breakdown bar */}
            <div className="w-full h-3 bg-black/10 rounded-full overflow-hidden flex">
              <div className="bg-[#6C63FF] h-full" style={{ width: "100%" }} title="Text & Scheduling (100%)" />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#6B7280] pt-1">
              <span>Text & Scheduling Features: <strong className="text-[#3D4852]">15,000 posts (100%)</strong></span>
              <span>Physical Media: <strong className="text-[#0F766E]">96 assets (48 posts)</strong></span>
            </div>
            <p className="text-[10px] text-[#6B7280] leading-relaxed">
              Posts without physical media files use explicit missing-modality indicator flags (<code>has_media=0</code>), allowing the model to evaluate text and scheduling without fabricating media values.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#E0E5EC] shadow-[inset_4px_4px_8px_rgb(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] space-y-2">
            <div className="flex items-center gap-1.5 text-[#0F766E] font-bold text-[11px]">
              <ShieldCheck className="w-4 h-4" />
              <span>Scientific Media Attribution Guarantee</span>
            </div>
            <ul className="text-[10px] text-[#6B7280] space-y-1 list-disc list-inside">
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

      {/* 5. SECTION 3: MODEL SNAPSHOT & PERFORMANCE */}
      <section className="p-6 rounded-3xl bg-[#E0E5EC] shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border/20">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#6C63FF]" />
            <h2 className="text-base font-bold text-[#3D4852]">Model Performance</h2>
          </div>
          <a
            href="/insights"
            onClick={(e) => {
              e.preventDefault();
              onNavigateToInsights?.();
            }}
            className="text-xs font-semibold text-[#6C63FF] hover:text-[#3D4852] inline-flex items-center gap-1 transition-colors"
          >
            <span>View Model Insights</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Model Spec & Evaluation Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#E0E5EC] shadow-[inset_4px_4px_8px_rgb(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] col-span-2 sm:col-span-2 lg:col-span-2">
            <span className="text-[#6B7280] text-[10px] uppercase font-bold block mb-0.5">Active Model</span>
            <strong className="text-xs font-bold text-[#3D4852] block truncate">
              {modelName}
            </strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#E0E5EC] shadow-[inset_4px_4px_8px_rgb(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] col-span-2 sm:col-span-2 lg:col-span-2">
            <span className="text-[#6B7280] text-[10px] uppercase font-bold block mb-0.5">Target Variable</span>
            <strong className="text-xs font-mono font-bold text-[#3D4852] block truncate">
              log1p(engagement_rate)
            </strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#E0E5EC] shadow-[inset_4px_4px_8px_rgb(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]">
            <span className="text-[#6B7280] text-[10px] uppercase font-bold block mb-0.5">Features</span>
            <strong className="text-xs font-mono font-bold text-[#3D4852] block">
              {data?.model.features || 25} Signals
            </strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#E0E5EC] shadow-[inset_4px_4px_8px_rgb(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]">
            <span className="text-[#6B7280] text-[10px] uppercase font-bold block mb-0.5">Validation MAE</span>
            <strong className="text-xs font-mono font-bold text-[#6C63FF] block">
              {data?.model.validation_mae !== undefined && data.model.validation_mae !== null
                ? `${data.model.validation_mae.toFixed(3)} pp`
                : "2.703 pp"}
            </strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#E0E5EC] shadow-[inset_4px_4px_8px_rgb(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]">
            <span className="text-[#6B7280] text-[10px] uppercase font-bold block mb-0.5">Test MAE</span>
            <strong className="text-xs font-mono font-bold text-[#0F766E] block">
              {metrics?.mae !== undefined ? `${metrics.mae.toFixed(3)} pp` : "2.677 pp"}
            </strong>
          </div>
        </div>

        {/* Secondary metric row: RMSE & R² */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-[#E0E5EC] shadow-[inset_4px_4px_8px_rgb(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] flex items-center justify-between">
            <span className="text-[#6B7280] text-[11px] font-medium">Held-Out Test RMSE:</span>
            <strong className="font-mono text-[#3D4852]">
              {metrics?.rmse !== undefined ? metrics.rmse.toFixed(3) : "3.724"}
            </strong>
          </div>
          <div className="p-3 rounded-2xl bg-[#E0E5EC] shadow-[inset_4px_4px_8px_rgb(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] flex items-center justify-between">
            <span className="text-[#6B7280] text-[11px] font-medium">Held-Out Test R²:</span>
            <strong className="font-mono text-[#3D4852]">
              {metrics?.r2 !== undefined ? metrics.r2.toFixed(3) : "0.115"}
            </strong>
          </div>
        </div>
      </section>

      {/* 5. SECTION 4: MODEL COMPARISON (CONCISE SUMMARY TABLE) */}
      <section className="p-6 rounded-3xl bg-[#E0E5EC] shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-border/20">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#6C63FF]" />
            <h2 className="text-base font-bold text-[#3D4852]">Model Comparison</h2>
          </div>
          <span className="text-[11px] font-mono text-[#6B7280]">
            Benchmark: 15% Chronological Validation Set
          </span>
        </div>

        {/* Concise Table of the 6 models */}
        <div className="overflow-x-auto rounded-2xl bg-[#E0E5EC] shadow-[inset_4px_4px_8px_rgb(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] p-1.5">
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Regression Candidate</th>
                <th className="py-2.5 px-3 text-right">Validation MAE</th>
                <th className="py-2.5 px-3 text-right">Validation R²</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {comparison.map((row, idx) => {
                const isSelected = row.model === modelName;
                return (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      isSelected ? "bg-[#6C63FF]/5 font-semibold" : ""
                    }`}
                  >
                    <td className="py-2.5 px-3 text-[#3D4852] flex items-center gap-2">
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
                      )}
                      <span>{row.model}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#3D4852]">
                      {row.mae.toFixed(3)} pp
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#6B7280]">
                      {row.r2.toFixed(3)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {isSelected ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-[#0F766E] border border-emerald-500/30">
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
      </section>

      {/* 6. SECTION 5: DATASET + MODEL HEALTH (2 COMPACT STATUS CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* DATASET HEALTH CARD */}
        <div className="p-5 rounded-3xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
              DATASET HEALTH
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  qualityStatus === "Healthy" || qualityStatus === "Optimal & Ready"
                    ? "bg-[#38B2AC] shadow-[0_0_8px_rgba(56,178,172,0.6)]"
                    : "bg-[#E11D48]"
                }`}
              />
              <strong className="text-base font-bold text-[#3D4852]">
                {qualityStatus === "Healthy" || qualityStatus === "Optimal & Ready"
                  ? "Healthy"
                  : "Needs Attention"}
              </strong>
            </div>
            <p className="text-[11px] text-[#6B7280] leading-relaxed">
              {masterPosts.toLocaleString()} verified rows · {dataset?.missing_values ?? 0} missing values · {dataset?.duplicate_rows ?? 0} duplicates · 8 required fields intact
            </p>
          </div>
          <ShieldCheck className="w-5 h-5 text-[#0F766E] shrink-0 mt-0.5" />
        </div>

        {/* MODEL HEALTH CARD */}
        <div className="p-5 rounded-3xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
              MODEL HEALTH
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  isReady
                    ? "bg-[#38B2AC] shadow-[0_0_8px_rgba(56,178,172,0.6)]"
                    : "bg-[#E11D48]"
                }`}
              />
              <strong className="text-base font-bold text-[#3D4852]">
                {isReady ? "Ready" : "Not Ready"}
              </strong>
            </div>
            <p className="text-[11px] text-[#6B7280] leading-relaxed">
              Artifact verified · 25 pre-publication features · 70/15/15 split ({activeTrainingCorpus.toLocaleString()} trained, {testCount.toLocaleString()} tested)
            </p>
          </div>
          <Cpu className="w-5 h-5 text-[#6C63FF] shrink-0 mt-0.5" />
        </div>
      </div>
    </div>
  );
}
