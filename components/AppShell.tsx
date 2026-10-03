"use client";

import React, { useEffect, useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import DashboardView from "@/components/views/DashboardView";
import HomeView from "@/components/views/HomeView";
import PredictView from "@/components/views/PredictView";
import WhatIfView from "@/components/views/WhatIfView";
import InsightsView from "@/components/views/InsightsView";
import DatasetView from "@/components/views/DatasetView";
import DevelopersView from "@/components/views/DevelopersView";
import AboutView from "@/components/views/AboutView";
import { fetchHealth, fetchModelStatus } from "@/lib/api";
import { ModelStatusResponse } from "@/types";

interface AppShellProps {
  initialTab?: string;
  skipSplash?: boolean;
  navMode?: "user" | "dashboard";
}

const tabToRouteUser: Record<string, string> = {
  Home: "/",
  "Predict Post": "/analyze",
  "What-If Analysis": "/what-if",
  Developers: "/developers",
  "About Project": "/about",
};

const tabToRouteDashboard: Record<string, string> = {
  Dashboard: "/dashboard",
  Dataset: "/dataset",
  "Model Insights": "/insights",
};

export default function AppShell({
  initialTab = "Home",
  skipSplash = false,
  navMode = "user",
}: AppShellProps) {
  const [loadingComplete, setLoadingComplete] = useState(skipSplash);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [modelStatus, setModelStatus] = useState<ModelStatusResponse | null>(null);
  const [apiHealthy, setApiHealthy] = useState(true);

  // Sync activeTab if initialTab changes via Next.js navigation and reset scroll to top
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
      if (typeof window !== "undefined") {
        window.scrollTo(0, 0);
      }
    }
  }, [initialTab]);

  // Tab change handler with history pushState and scroll-to-top
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
      const mapping = navMode === "dashboard" ? tabToRouteDashboard : tabToRouteUser;
      const route = mapping[tab];
      if (route && window.location.pathname !== route) {
        window.history.pushState(null, "", route);
      }
    }
  };

  // Fetch initial model status & health
  const refreshStatus = async () => {
    try {
      const [health, status] = await Promise.all([
        fetchHealth().catch(() => ({ status: "error" })),
        fetchModelStatus().catch(() => ({
          trained: false,
          selected_model: null,
          metrics: null,
          dataset_size: null,
          features_used: null,
          splits: null,
        })),
      ]);
      setApiHealthy(health.status === "ok");
      setModelStatus(status);
    } catch {
      setApiHealthy(false);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  return (
    <>
      {/* Splash screen animation on first load */}
      {!loadingComplete && !skipSplash && (
        <LoadingScreen
          durationMs={2000}
          onComplete={() => setLoadingComplete(true)}
        />
      )}

      <div
        className={`min-h-screen flex bg-[#E0E5EC] text-[#3D4852] selection:bg-primary-orange/30 selection:text-white transition-opacity duration-500 ease-out ${
          loadingComplete ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          modelStatus={modelStatus}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          navMode={navMode}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen lg:pl-72 transition-all duration-300">
          {/* Header */}
          <Header
            activeTab={activeTab}
            modelStatus={modelStatus}
            apiHealthy={apiHealthy}
            mobileOpen={mobileOpen}
            onMobileMenuToggle={() => setMobileOpen(!mobileOpen)}
          />

          {/* Active View Container */}
          <main className="flex-1 p-6 md:p-8 lg:p-10">
            {activeTab === "Dashboard" && (
              <DashboardView
                onNavigateToDataset={() => handleTabChange("Dataset")}
                onNavigateToInsights={() => handleTabChange("Model Insights")}
              />
            )}
            {activeTab === "Home" && (
              <HomeView
                modelStatus={modelStatus}
                onNavigateToPredict={() => handleTabChange("Predict Post")}
                onNavigateToWhatIf={() => handleTabChange("What-If Analysis")}
                onNavigateToInsights={() => handleTabChange("Model Insights")}
              />
            )}
            {activeTab === "Predict Post" && (
              <PredictView modelStatus={modelStatus} />
            )}
            {activeTab === "What-If Analysis" && (
              <WhatIfView modelStatus={modelStatus} />
            )}
            {activeTab === "Model Insights" && <InsightsView />}
            {activeTab === "Dataset" && <DatasetView />}
            {activeTab === "Developers" && <DevelopersView />}
            {activeTab === "About Project" && <AboutView />}
          </main>

          {/* Minimal Footer */}
          <footer className="px-8 py-6 text-center text-xs text-[#6B7280]">
            <p>
              TrendSkope · AI-Powered Instagram Content Performance Intelligence · Academic Machine Learning Research
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
