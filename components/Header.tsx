"use client";

import React from "react";
import { ModelStatusResponse } from "@/types";

interface HeaderProps {
  activeTab: string;
  modelStatus: ModelStatusResponse | null;
  apiHealthy: boolean;
  onMobileMenuToggle: () => void;
}

const tabTitles: Record<string, { title: string; subtitle: string }> = {
  Home: {
    title: "Overview",
    subtitle: "AI-Powered Instagram Content Performance Intelligence",
  },
  "Predict Post": {
    title: "Pre-Publish Content Analyzer",
    subtitle: "Analyze your content, caption, publishing context, and media signals before you publish",
  },
  "What-If Analysis": {
    title: "Pre-Publish Scenario Studio",
    subtitle: "Compare complete content plans and evaluate how the trained model responds to different publishing scenarios",
  },
  "Model Insights": {
    title: "Model & Validation Insights",
    subtitle: "Transparent evaluation metrics, error rates, and candidate comparisons",
  },
  Dataset: {
    title: "Dataset & Validation",
    subtitle: "Upload, test CSV compliance, download templates, and view dataset cards",
  },
  "About Project": {
    title: "About TrendSkope",
    subtitle: "Methodology, ML architecture, pre-publication constraints, and ethics",
  },
};

export default function Header({
  activeTab,
  modelStatus,
  apiHealthy,
  onMobileMenuToggle,
}: HeaderProps) {
  const current = tabTitles[activeTab] || {
    title: activeTab,
    subtitle: "TrendSkope Intelligence",
  };

  const isModelReady = Boolean(modelStatus?.trained);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[#050b15]/85 backdrop-blur-md border-b border-border/80">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <button
          onClick={onMobileMenuToggle}
          aria-label="Toggle navigation menu"
          className="lg:hidden p-2 rounded-lg bg-surface border border-border text-slate-300 hover:text-white transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-tight">
            {current.title}
          </h2>
          <p className="text-xs text-slate-400 font-medium hidden sm:block mt-0.5">
            {current.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Backend API Status */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            apiHealthy
              ? "bg-emerald-950/30 border-emerald-500/25 text-emerald-400"
              : "bg-rose-950/30 border-rose-500/25 text-rose-400"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              apiHealthy ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
            }`}
          />
          <span className="hidden md:inline text-slate-300 font-medium">Backend API:</span>
          <span>{apiHealthy ? "Online" : "Offline"}</span>
        </div>

        {/* Model Status */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            isModelReady
              ? "bg-emerald-950/30 border-emerald-500/25 text-emerald-400"
              : "bg-amber-950/30 border-amber-500/25 text-amber-400"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isModelReady ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
            }`}
          />
          <span>{isModelReady ? "Model Ready" : "Model Not Trained"}</span>
        </div>
      </div>
    </header>
  );
}
