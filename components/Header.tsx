"use client";

import React from "react";
import { Activity, ShieldCheck } from "lucide-react";
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
    title: "Predict Post Performance",
    subtitle: "Pre-publication feature modeling without post-hoc data leakage",
  },
  "What-If Analysis": {
    title: "What-If Scenario Comparison",
    subtitle: "Evaluate potential post adjustments against model-learned expectations",
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

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[#050b15]/80 backdrop-blur-md border-b border-border/80">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <button
          onClick={onMobileMenuToggle}
          aria-label="Toggle navigation menu"
          className="lg:hidden p-2 rounded-lg bg-surface border border-border text-slate-300 hover:text-white"
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
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            {current.title}
          </h2>
          <p className="text-xs text-slate-400 hidden sm:block">
            {current.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* API Health Pill */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
            apiHealthy
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400"
              : "bg-rose-950/40 border-rose-500/30 text-rose-400"
          }`}
        >
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span className="hidden md:inline">Backend API:</span>
          <span>{apiHealthy ? "Online" : "Offline"}</span>
        </div>

        {/* Model Status Pill */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
            modelStatus?.trained
              ? "bg-ready/10 border-ready/30 text-ready"
              : "bg-primary-orange/10 border-primary-orange/30 text-primary-orange"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{modelStatus?.trained ? "Model Ready" : "Model Not Trained"}</span>
        </div>
      </div>
    </header>
  );
}
