"use client";

import React from "react";
import Image from "next/image";
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
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-gradient-to-b from-[#071221] to-[#050b15] border-r border-[#233044] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Branding Section */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative overflow-hidden rounded-xl border border-white/10 shadow-md">
                <Image
                  src="/assets/logo.png"
                  alt="TrendSkope Logo"
                  width={140}
                  height={93}
                  className="w-28 h-auto object-contain block"
                  priority
                />
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <h1 className="text-lg font-extrabold text-white tracking-tight">
              Trend<span className="gradient-accent">Skope</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide">
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
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-left ${
                    isActive
                      ? "bg-gradient-to-r from-primary-coral/20 to-primary-pink/10 text-white border border-primary-coral/40 shadow-[0_0_15px_rgba(255,110,64,0.15)]"
                      : "text-slate-300 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? "text-primary-orange" : "text-slate-400"
                    }`}
                  />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Model Status Section */}
        <div className="p-6 border-t border-[#233044]/80 bg-[#040810]/50">
          <div className="mb-3">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Model Status</span>
              <Radio
                className={`w-3.5 h-3.5 ${
                  isReady ? "text-ready animate-pulse" : "text-primary-orange"
                }`}
              />
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  isReady
                    ? "bg-ready shadow-[0_0_8px_rgba(66,214,164,0.8)]"
                    : "bg-primary-coral shadow-[0_0_8px_rgba(255,110,64,0.8)]"
                }`}
              />
              <span
                className={`text-sm font-bold ${
                  isReady ? "text-ready" : "text-primary-coral"
                }`}
              >
                {isReady ? "Model Ready" : "Model Not Trained"}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            CSV input only · No Instagram login or API required
          </p>
        </div>
      </aside>
    </>
  );
}
