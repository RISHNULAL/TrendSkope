"use client";

import React from "react";
import {
  Home,
  Sparkles,
  GitCompare,
  Info,
  Users,
  X,
  Radio,
  LayoutDashboard,
  Database,
  BarChart3,
  ArrowLeft,
} from "lucide-react";
import { ModelStatusResponse } from "@/types";
import BrandLockup from "@/components/BrandLockup";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  modelStatus: ModelStatusResponse | null;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  navMode?: "user" | "dashboard";
}

// User-facing navigation items (Strictly 5 items)
const userNavItems = [
  { id: "Home", label: "Home", icon: Home, route: "/" },
  { id: "Predict Post", label: "Analyze Post", icon: Sparkles, route: "/analyze" },
  { id: "What-If Analysis", label: "Comparison Studio", icon: GitCompare, route: "/what-if" },
  { id: "Developers", label: "Developers", icon: Users, route: "/developers" },
  { id: "About Project", label: "About & Methodology", icon: Info, route: "/about" },
];

// Dashboard-specific navigation items (Internal ML Analytics Control Center)
const dashboardNavItems = [
  { id: "Dashboard", label: "Dashboard Overview", icon: LayoutDashboard, route: "/dashboard" },
  { id: "Dataset", label: "Dataset & Provenance", icon: Database, route: "/dataset" },
  { id: "Model Insights", label: "Model Insights", icon: BarChart3, route: "/insights" },
];

export default function Sidebar({
  activeTab,
  setActiveTab,
  modelStatus,
  mobileOpen,
  setMobileOpen,
  navMode = "user",
}: SidebarProps) {
  const isReady = Boolean(modelStatus?.trained && modelStatus?.status !== "not_ready");
  const isDashboardMode = navMode === "dashboard";
  const items = isDashboardMode ? dashboardNavItems : userNavItems;

  const handleSelectTab = (name: string) => {
    setActiveTab(name);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-[#242137]/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-[#E7E3F0] flex flex-col justify-between transition-transform duration-300 ease-out lg:translate-x-0 shadow-sm ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Branding & Navigation Section */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex items-start justify-between gap-2 mb-6">
            <a
              href="/"
              aria-label="Reload TrendSkope and go to Home"
              onClick={(event) => {
                event.preventDefault();
                window.location.href = "/";
              }}
              className="rounded-2xl cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6C4DFF]"
            >
              <BrandLockup variant="sidebar" />
            </a>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
              className="lg:hidden h-9 w-9 shrink-0 inline-flex items-center justify-center text-[#68677D] hover:text-[#242137] rounded-xl bg-[#F8F7FC] border border-[#E7E3F0]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-xs text-[#68677D] font-medium tracking-wide">
              {isDashboardMode ? "Analytics & Model Control Center" : "Understand. Predict. Optimize."}
            </p>
          </div>

          {/* Navigation Items */}
          <nav aria-label="Main navigation" className="space-y-1.5">
            {isDashboardMode && (
              <div className="text-[10px] font-bold text-[#6C4DFF] uppercase tracking-wider px-3.5 pb-2">
                Dashboard Controls
              </div>
            )}

            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full min-h-[44px] flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 text-left ${
                    isActive
                      ? "bg-[#F0EBFF] text-[#6C4DFF] font-bold border-l-4 border-[#6C4DFF] rounded-r-xl rounded-l-none shadow-sm"
                      : "text-[#68677D] hover:text-[#242137] hover:bg-[#F8F7FC] rounded-xl"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors shrink-0 ${
                      isActive ? "text-[#6C4DFF]" : "text-[#68677D]"
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Back to main app link when in dashboard mode */}
            {isDashboardMode && (
              <div className="pt-4 mt-4 border-t border-[#E7E3F0]">
                <a
                  href="/"
                  className="w-full min-h-[40px] flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#68677D] hover:text-[#6C4DFF] hover:bg-[#F0EBFF] transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Main App</span>
                </a>
              </div>
            )}
          </nav>
        </div>

        {/* Bottom Model Status Section */}
        <div className="p-5 border-t border-[#E7E3F0] bg-[#F8F7FC]">
          <div className="mb-2">
            <div className="text-[11px] font-mono font-bold text-[#68677D] uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Model Status</span>
              <Radio
                className={`w-3.5 h-3.5 ${
                  isReady ? "text-[#0F9D8A] animate-pulse" : "text-[#E9A23B]"
                }`}
              />
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  isReady ? "bg-[#0F9D8A]" : "bg-[#E9A23B]"
                }`}
              />
              <span
                className={`text-xs font-bold ${
                  isReady ? "text-[#0F9D8A]" : "text-[#E9A23B]"
                }`}
              >
                {isReady ? "Model Active" : "Model Not Trained"}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-[#68677D] leading-relaxed">
            CSV inputs verified · No Instagram credentials required
          </p>
        </div>
      </aside>
    </>
  );
}
