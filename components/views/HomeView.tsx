"use client";

import React from "react";
import { ArrowRight, Sparkles, FileText, Cpu, Target, Sliders } from "lucide-react";
import MetricCard from "../MetricCard";
import { ModelStatusResponse } from "@/types";

interface HomeViewProps {
  modelStatus: ModelStatusResponse | null;
  onNavigateToPredict: () => void;
}

export default function HomeView({
  modelStatus,
  onNavigateToPredict,
}: HomeViewProps) {
  const isTrained = Boolean(modelStatus?.trained);
  const metrics = modelStatus?.metrics;

  const testMae = metrics?.mae !== undefined ? metrics.mae.toFixed(3) : "--";
  const testR2 = metrics?.r2 !== undefined ? metrics.r2.toFixed(3) : "--";
  const featuresCount = modelStatus?.features_used ? String(modelStatus.features_used) : "--";
  const datasetSize = modelStatus?.dataset_size
    ? modelStatus.dataset_size.toLocaleString()
    : "--";

  const workflowSteps = [
    {
      num: "01",
      icon: FileText,
      title: "Enter post details",
      desc: "Add your planned caption, media type, publication schedule, and follower context.",
    },
    {
      num: "02",
      icon: Cpu,
      title: "AI feature extraction",
      desc: "Pre-publication linguistic, temporal, and account features are extracted safely without leakage.",
    },
    {
      num: "03",
      icon: Target,
      title: "Get prediction",
      desc: "Receive an engagement rate estimate with empirical uncertainty intervals and performance band.",
    },
    {
      num: "04",
      icon: Sliders,
      title: "Explore & optimize",
      desc: "Compare what-if publishing scenarios side-by-side to understand expected performance differences.",
    },
  ];

  return (
    <div className="space-y-10 animate-fade-in max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl p-8 md:p-12 glass-card border-border/80">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,rgba(255,112,72,0.12)_0%,rgba(255,64,95,0.03)_60%,transparent_80%)] blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-orange/10 border border-primary-orange/30 text-primary-orange text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Content Performance Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
            Welcome to <span className="gradient-text">TrendSkope</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            Predict your post&apos;s engagement rate before you publish and make
            smarter content decisions with a transparent, research-first ML workflow.
          </p>

          <div className="pt-2">
            <button
              onClick={onNavigateToPredict}
              className="btn-primary group"
            >
              <span>Analyze Your Post</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* Metrics Row */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            Key Performance Metrics
          </h3>
          <span className="text-xs text-slate-400">
            {isTrained ? "Validated test partition evaluation" : "Awaiting training artifacts"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            label="AI Model Status"
            value={isTrained ? "Ready" : "Not Trained"}
            subtitle={isTrained ? (modelStatus?.selected_model || "Active Model") : "Train via offline pipeline"}
            isReady={isTrained}
          />
          <MetricCard
            label="Test MAE"
            value={testMae}
            subtitle="Mean Absolute Error (pp)"
          />
          <MetricCard
            label="R² Score"
            value={testR2}
            subtitle="Held-out variance explained"
          />
          <MetricCard
            label="Features Used"
            value={featuresCount}
            subtitle="Pre-publication signals"
          />
          <MetricCard
            label="Dataset Size"
            value={datasetSize}
            subtitle="Validated training posts"
          />
        </div>
      </section>

      {/* How TrendSkope Works */}
      <section className="glass-card p-8 rounded-3xl border-border/80">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            How <span className="gradient-accent">TrendSkope</span> Works
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            A rigorously engineered pre-publication machine learning workflow
            designed without future-data leakage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-primary-orange/40 hover:bg-white/[0.04] transition-all duration-200 relative group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-primary-orange/60 group-hover:text-primary-orange transition-colors">
                      {step.num}
                    </span>
                    <div className="p-2.5 rounded-xl bg-primary-orange/10 border border-primary-orange/20 text-primary-orange">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
