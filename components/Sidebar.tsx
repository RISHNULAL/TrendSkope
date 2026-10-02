"use client";

import React from "react";
import {
  Home,
  Sparkles,
  GitCompare,
  BarChart3,
  Database,
  Info,
  X,
  Radio,
} from "lucide-react";
import { ModelStatusResponse } from "@/types";
import BrandLockup from "@/components/BrandLockup";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  modelStatus: ModelStatusResponse | null;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const navItems = [
  { name: "Home", icon: Home },
  { name: "Predict Post", icon: Sparkles },
  { name: "What-If Analysis", icon: GitCompare },
  { name: "Model Insights", icon: BarChart3 },
  { name: "Dataset", icon: Database },
  { name: "About Project", icon: Info },
];

export default function Sidebar({
  activeTab,
  setActiveTab,
  modelStatus,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const isReady = modelStatus?.trained;

  const handleSelectTab = (name: string) => {
    setActiveTab(name);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-[#3D4852]/30 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#E0E5EC] flex flex-col justify-between transition-transform duration-300 ease-out lg:translate-x-0 shadow-[9px_0_16px_rgb(163,177,198,0.35)] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Branding Section */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-2 mb-6">
            <BrandLockup variant="sidebar" />
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
              className="lg:hidden h-12 w-12 shrink-0 inline-flex items-center justify-center text-[#6B7280] hover:text-[#3D4852] rounded-2xl bg-[#E0E5EC] shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-xs text-[#6B7280] font-medium tracking-wide">
              Understand. Predict. Optimize.
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;

              return (
                <button
                  key={item.name}
                  onClick={() => handleSelectTab(item.name)}
                  className={`w-full min-h-[44px] flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 ease-out text-left ${
                    isActive
                      ? "bg-[#E0E5EC] text-[#6C63FF] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)]"
                      : "text-[#6B7280] hover:text-[#3D4852] hover:-translate-y-px shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)]"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? "text-[#6C63FF]" : "text-[#6B7280]"
                    }`}
                  />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Model Status Section */}
        <div className="p-6 border-t border-transparent bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)]">
          <div className="mb-3">
            <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Model Status</span>
              <Radio
                className={`w-3.5 h-3.5 ${
                  isReady ? "text-ready animate-pulse" : "text-[#6C63FF]"
                }`}
              />
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  isReady
                    ? "bg-ready shadow-[0_0_8px_rgba(66,214,164,0.8)]"
                    : "bg-primary-coral "
                }`}
              />
              <span
                className={`text-sm font-bold ${
                  isReady ? "text-ready" : "text-[#6C63FF]"
                }`}
              >
                {isReady ? "Model Ready" : "Model Not Trained"}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-[#6B7280] leading-relaxed">
            CSV input only · No Instagram login or API required
          </p>
        </div>
      </aside>
    </>
  );
}
