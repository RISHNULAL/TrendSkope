"use client";

import React from "react";
import { Menu, X } from "lucide-react";
import { ModelStatusResponse } from "@/types";

interface HeaderProps {
  activeTab: string;
  modelStatus: ModelStatusResponse | null;
  apiHealthy: boolean;
  mobileOpen: boolean;
  onMobileMenuToggle: () => void;
}

const tabTitles: Record<string, { title: string; subtitle: string }> = {
  Dashboard: {
    title: "TrendSkope Dashboard",
    subtitle: "Dataset intelligence and model performance at a glance.",
  },
  Home: {
    title: "Overview",
    subtitle: "AI-Powered Instagram Content Performance Intelligence",
  },
  "Predict Post": {
    title: "Analyze Post",
    subtitle: "Upload a photo, carousel, or Reel to evaluate content craft quality and expected engagement.",
  },
  "What-If Analysis": {
    title: "Content Comparison Studio",
    subtitle: "Compare two content variations, understand what changes, and identify which improvements are worth testing.",
  },
  "Model Insights": {
    title: "Model Insights",
    subtitle: "Candidate model comparison, validation scores, and feature influence.",
  },
  Dataset: {
    title: "Dataset",
    subtitle: "CSV validation, schema, and dataset provenance.",
  },
  Developers: {
    title: "Developers",
    subtitle: "Meet the team behind TrendSkope.",
  },
  "About Project": {
    title: "About & Methodology",
    subtitle: "Understanding, predicting, and analyzing Instagram content performance through data-driven methods.",
  },
};

export default function Header({
  activeTab,
  modelStatus,
  apiHealthy,
  mobileOpen,
  onMobileMenuToggle,
}: HeaderProps) {
  const current = tabTitles[activeTab] || {
    title: activeTab,
    subtitle: "TrendSkope Intelligence",
  };

  const isModelReady = Boolean(modelStatus?.trained && modelStatus?.status !== "not_ready");

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-5 sm:px-8 py-4 bg-white/90 backdrop-blur-md border-b border-[#E7E3F0] transition-colors">
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={onMobileMenuToggle}
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          className="lg:hidden h-10 w-10 shrink-0 inline-flex items-center justify-center rounded-xl bg-[#F8F7FC] text-[#242137] border border-[#E7E3F0] hover:bg-[#F0EBFF] hover:text-[#6C4DFF] hover:border-[#6C4DFF]/30 transition-all"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-[#242137]" />}
        </button>

        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#242137] leading-tight">
            {current.title}
          </h2>
          <p className="text-xs text-[#68677D] font-medium hidden sm:block mt-0.5">
            {current.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Backend API Status */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            apiHealthy
              ? "bg-[#F8F7FC] border-[#E7E3F0] text-[#0F9D8A]"
              : "bg-[#FEEFF0] border-[#F06F73]/30 text-[#F06F73]"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              apiHealthy ? "bg-[#0F9D8A] animate-pulse" : "bg-[#F06F73]"
            }`}
          />
          <span className="hidden md:inline text-[#68677D] font-medium">Backend API:</span>
          <span>{apiHealthy ? "Online" : "Offline"}</span>
        </div>

        {/* Model Status */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            isModelReady
              ? "bg-[#F8F7FC] border-[#E7E3F0] text-[#0F9D8A]"
              : "bg-[#FDF5EA] border-[#E9A23B]/30 text-[#E9A23B]"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isModelReady ? "bg-[#0F9D8A] animate-pulse" : "bg-[#E9A23B]"
            }`}
          />
          <span>{isModelReady ? "Model Ready" : "Model Not Trained"}</span>
        </div>
      </div>
    </header>
  );
}
