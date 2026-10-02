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
  Home: {
    title: "Overview",
    subtitle: "AI-Powered Instagram Content Performance Intelligence",
  },
  "Predict Post": {
    title: "Analyze Post",
    subtitle: "Upload a photo, carousel, or Reel and see the expected engagement before it goes live.",
  },
  "What-If Analysis": {
    title: "What-If Scenarios",
    subtitle: "Compare two versions of a post and see which estimate is higher.",
  },
  "Model Insights": {
    title: "Model Insights",
    subtitle: "Model comparisons, validation scores, and limitations",
  },
  Dataset: {
    title: "Dataset",
    subtitle: "CSV validation, schema, and dataset provenance",
  },
  "About Project": {
    title: "About & Methodology",
    subtitle: "How the project and model work",
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

  const isModelReady = Boolean(modelStatus?.trained);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 sm:px-6 py-4 bg-[#E0E5EC]/90 backdrop-blur-md">
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={onMobileMenuToggle}
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          className="lg:hidden h-12 w-12 shrink-0 inline-flex items-center justify-center rounded-2xl bg-[#E0E5EC] text-[#3D4852] shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] active:shadow-[inset_3px_3px_6px_rgb(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.5)] transition-all duration-300"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#3D4852] leading-tight">
            {current.title}
          </h2>
          <p className="text-xs text-[#6B7280] font-medium hidden sm:block mt-0.5">
            {current.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Backend API Status */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs font-semibold border transition-all ${
            apiHealthy
              ? "bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] border-transparent text-[#0F766E]"
              : "bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] border-transparent text-[#BE123C]"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              apiHealthy ? "bg-[#38B2AC] animate-pulse" : "bg-[#E11D48]"
            }`}
          />
          <span className="hidden md:inline text-[#6B7280] font-medium">Backend API:</span>
          <span>{apiHealthy ? "Online" : "Offline"}</span>
        </div>

        {/* Model Status */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs font-semibold border transition-all ${
            isModelReady
              ? "bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] border-transparent text-[#0F766E]"
              : "bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] border-transparent text-[#B45309]"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isModelReady ? "bg-[#38B2AC] animate-pulse" : "bg-[#D97706]"
            }`}
          />
          <span>{isModelReady ? "Model Ready" : "Model Not Trained"}</span>
        </div>
      </div>
    </header>
  );
}
