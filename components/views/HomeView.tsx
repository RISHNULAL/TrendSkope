"use client";

import React from "react";
import {
  ArrowRight,
  Sparkles,
  Database,
  Cpu,
  BarChart3,
  ShieldCheck,
  Info,
  Layers,
  CheckCircle2,
} from "lucide-react";
import MetricCard from "../MetricCard";
import PerformancePreview from "../PerformancePreview";
import HowItWorks from "./HowItWorks";
import HowToUse from "./HowToUse";
import { ModelStatusResponse } from "@/types";

interface HomeViewProps {
  modelStatus: ModelStatusResponse | null;
  onNavigateToPredict: () => void;
  onNavigateToWhatIf?: () => void;
  onNavigateToInsights?: () => void;
}

export default function HomeView({
  modelStatus,
  onNavigateToPredict,
  onNavigateToWhatIf,
  onNavigateToInsights,
}: HomeViewProps) {
  const isTrained = Boolean(modelStatus?.trained);
  const metrics = modelStatus?.metrics;

  const testMae = metrics?.mae !== undefined ? metrics.mae.toFixed(3) : "--";
  const testR2 = metrics?.r2 !== undefined ? metrics.r2.toFixed(3) : "--";
  const featuresCount = modelStatus?.features_used ? String(modelStatus.features_used) : "--";
  const datasetSize = modelStatus?.dataset_size
    ? modelStatus.dataset_size.toLocaleString()
    : "--";
  const selectedModelName = modelStatus?.selected_model || "Ridge Regression";

  return (
    <div className="space-y-12 animate-fade-in max-w-7xl mx-auto pb-8">
      {/* 1. Hero Section with Decision Intelligence Preview */}
      <section className="relative overflow-hidden rounded-3xl p-7 sm:p-9 md:p-10 lg:p-12 glass-card border border-[#E7E3F0] bg-white shadow-card">
        {/* Subtle Background Lighting */}
        <div className="absolute -top-16 -right-10 w-96 h-96 rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(108,77,255,0.08)_0%,transparent_70%)] blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Brand Hero Text & Primary CTA */}
          <div className="lg:col-span-7 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0EBFF] border border-[#6C4DFF]/20 text-[#6C4DFF] text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Powered Content Performance Intelligence</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#242137] leading-[1.15]">
              Welcome to <span className="bg-gradient-to-r from-[#6C4DFF] to-[#4B35B5] bg-clip-text text-transparent">TrendSkope</span>
            </h1>

            <p className="text-base sm:text-lg text-[#68677D] leading-relaxed max-w-xl font-normal">
              Predict your post&apos;s engagement rate before you publish and make
              smarter content decisions with a transparent, research-first ML workflow.
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={onNavigateToPredict}
                className="btn-primary group"
              >
                <span>Analyze Your Post</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  document.getElementById("how-to-use")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
                className="btn-secondary text-xs sm:text-sm"
              >
                How to Use
              </button>

              {onNavigateToWhatIf && (
                <button
                  onClick={onNavigateToWhatIf}
                  className="btn-secondary text-xs sm:text-sm hover:border-[#6C4DFF]/40 transition-colors"
                >
                  <span>Explore What-If Scenarios</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Content Performance Preview Visualization */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <PerformancePreview />
          </div>
        </div>
      </section>

      {/* 2. How to Use (Interactive Visual Walkthrough with IntersectionObserver) */}
      <HowToUse
        onNavigateToPredict={onNavigateToPredict}
        onNavigateToWhatIf={onNavigateToWhatIf}
      />

      {/* 3. How It Works (4-Stage Workflow Architecture) */}
      <HowItWorks />

      {/* 4. Key Performance Metrics */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#68677D] uppercase tracking-wider">
              Key Performance Metrics
            </h3>
            <div className="relative group inline-flex items-center">
              <Info className="w-3.5 h-3.5 text-[#68677D] hover:text-[#242137] cursor-help transition-colors" />
              <div className="absolute left-0 sm:left-1/2 sm:-translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-30 w-64 p-3 rounded-xl bg-white border border-[#E7E3F0] text-[11px] font-normal leading-normal text-[#68677D] shadow-card pointer-events-none">
                Metrics are calculated on the held-out test partition and are intended to provide an honest evaluation of model performance.
                <div className="absolute top-full left-4 sm:left-1/2 sm:-translate-x-1/2 -mt-1 border-4 border-transparent border-t-white" />
              </div>
            </div>
          </div>

          <span className="text-xs text-[#68677D] font-medium">
            {isTrained ? "Validated test partition evaluation" : "Awaiting training artifacts"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            label="AI Model Status"
            value={isTrained ? "Ready" : "Not Trained"}
            subtitle={isTrained ? selectedModelName : "Train via pipeline"}
            isReady={isTrained}
          />
          <MetricCard
            label="Test MAE"
            value={testMae}
            subtitle="Mean Absolute Error (pp)"
            tooltip="Mean Absolute Error in percentage points between predicted and actual test engagement rates."
          />
          <MetricCard
            label="R² Score"
            value={testR2}
            subtitle="Held-out test performance"
            tooltip="R² measures how much variance in the held-out test data is explained by the model. A negative value indicates performance below the mean-prediction baseline on this test split."
          />
          <MetricCard
            label="Features Used"
            value={featuresCount}
            subtitle="Pre-publication signals"
            tooltip="Count of engineered signals available strictly before post publication."
          />
          <MetricCard
            label="Dataset Size"
            value={datasetSize}
            subtitle="Validated training posts"
            tooltip="Total post records in the validated training repository."
          />
        </div>
      </section>

      {/* 5. Model Configuration / Research Context */}
      <section className="glass-card p-6 sm:p-7 rounded-2xl border border-[#E7E3F0] bg-white shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4 text-[#6C4DFF]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#68677D]">
            Model Configuration
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0]">
            <span className="text-[11px] font-mono text-[#68677D] uppercase block mb-1">
              Model Architecture
            </span>
            <span className="text-sm font-semibold text-[#242137]">
              {isTrained ? selectedModelName : "Ridge Regression"}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0]">
            <span className="text-[11px] font-mono text-[#68677D] uppercase block mb-1">
              Target Metric
            </span>
            <span className="text-sm font-semibold text-[#242137]">
              Engagement Rate (%)
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0]">
            <span className="text-[11px] font-mono text-[#68677D] uppercase block mb-1">
              Validation Strategy
            </span>
            <span className="text-sm font-semibold text-[#242137]">
              Chronological hold-out (70/15/15)
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0]">
            <span className="text-[11px] font-mono text-[#68677D] uppercase block mb-1">
              Prediction Type
            </span>
            <span className="text-sm font-semibold text-[#0F9D8A] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Pre-publication only
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
