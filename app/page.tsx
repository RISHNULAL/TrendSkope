"use client";

import React, { useEffect, useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import HomeView from "@/components/views/HomeView";
import PredictView from "@/components/views/PredictView";
import WhatIfView from "@/components/views/WhatIfView";
import InsightsView from "@/components/views/InsightsView";
import DatasetView from "@/components/views/DatasetView";
import AboutView from "@/components/views/AboutView";
import { fetchHealth, fetchModelStatus } from "@/lib/api";
import { ModelStatusResponse } from "@/types";

export default function App() {
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [activeTab, setActiveTab] = useState("Home");
  const [mobileOpen, setMobileOpen] = useState(false);

  const [modelStatus, setModelStatus] = useState<ModelStatusResponse | null>(null);
  const [apiHealthy, setApiHealthy] = useState(true);

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
      {/* High-end animated splash screen */}
      <LoadingScreen
        durationMs={1300}
        onComplete={() => setLoadingComplete(true)}
      />

      <div className="min-h-screen flex bg-[#050b15] text-slate-100 selection:bg-primary-orange/30 selection:text-white">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          modelStatus={modelStatus}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen lg:pl-72 transition-all duration-300">
          {/* Header */}
          <Header
            activeTab={activeTab}
            modelStatus={modelStatus}
            apiHealthy={apiHealthy}
            onMobileMenuToggle={() => setMobileOpen(!mobileOpen)}
          />

          {/* Active View Container */}
          <main className="flex-1 p-6 md:p-8 lg:p-10">
            {activeTab === "Home" && (
              <HomeView
                modelStatus={modelStatus}
                onNavigateToPredict={() => setActiveTab("Predict Post")}
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
            {activeTab === "About Project" && <AboutView />}
          </main>

          {/* Minimal Footer */}
          <footer className="px-8 py-6 border-t border-border/40 text-center text-xs text-slate-400">
            <p>
              TrendSkope · AI-Powered Instagram Content Performance Intelligence · Academic Machine Learning Research
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
