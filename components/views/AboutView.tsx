"use client";

import React from "react";
import {
  Sparkles,
  BarChart3,
  GitCompare,
  ArrowRight,
  ShieldAlert,
  Cpu,
  Layers,
  FileText,
  Instagram,
  Target,
  Users,
} from "lucide-react";

export default function AboutView() {
  const modelChips = [
    "KNN Regressor",
    "Bayesian Ridge",
    "Linear Regression",
    "Ridge",
    "Lasso",
    "Decision Tree",
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* 1. HERO SECTION (MINIMAL, ACADEMIC IDENTITY) */}
      <div className="p-7 sm:p-9 md:p-10 rounded-2xl bg-white border border-[#E7E3F0] shadow-card grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Group Identity & Core Title */}
        <div className="lg:col-span-7 space-y-4 text-left">
          {/* Group 2 Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono font-bold tracking-widest text-[#6C4DFF] uppercase px-3 py-1 rounded-full bg-[#F0EBFF] border border-[#6C4DFF]/20">
              GROUP 2 · MACHINE LEARNING PROJECT
            </span>
            <span className="text-[11px] font-mono font-bold text-[#242137] px-2.5 py-1 rounded-full bg-[#F8F7FC] border border-[#E7E3F0]">
              S5 CSE
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#242137] tracking-tight leading-[1.2]">
            Instagram Content Performance,{" "}
            <span className="text-[#6C4DFF]">Powered by Machine Learning.</span>
          </h1>

          {/* Short description */}
          <p className="text-xs sm:text-sm text-[#68677D] leading-relaxed">
            TrendSkope uses historical Instagram post data and machine learning to estimate engagement performance from observable pre-publication signals.
          </p>
        </div>

        {/* Right Column: Integrated Instagram + TrendSkope Visual Accent */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-xs p-5 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] space-y-2.5 text-center">
            {/* Instagram Icon Badge with subtle gradient accent */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E7E3F0] text-[#242137] text-xs font-bold shadow-sm">
              <Instagram className="w-4 h-4 text-[#E1306C]" />
              <span>Instagram Post</span>
            </div>

            <div className="text-[#68677D] text-xs">↓</div>

            <div className="p-2.5 rounded-xl bg-white border border-[#E7E3F0] text-[11px] font-mono font-semibold text-[#242137] shadow-sm">
              Content Signals (25 Features)
            </div>

            <div className="text-[#68677D] text-xs">↓</div>

            <div className="p-2.5 rounded-xl bg-[#F0EBFF] border border-[#6C4DFF]/30 text-[11px] font-mono font-bold text-[#6C4DFF]">
              TrendSkope ML Engine
            </div>

            <div className="text-[#68677D] text-xs">↓</div>

            <div className="p-2.5 rounded-xl bg-[#0F9D8A]/10 border border-[#0F9D8A]/30 text-[11px] font-mono font-bold text-[#0F9D8A]">
              Engagement Estimate
            </div>
          </div>
        </div>
      </div>

      {/* 2. WHY TRENDSKOPE? (COMPACT) */}
      <section className="p-6 rounded-2xl bg-white border border-[#E7E3F0] shadow-card space-y-2">
        <h2 className="text-base font-bold text-[#242137] tracking-tight">
          Why TrendSkope?
        </h2>
        <p className="text-xs sm:text-sm text-[#68677D] leading-relaxed">
          Instagram content performance depends on many observable signals. TrendSkope explores whether these signals can help estimate follower-normalized engagement before publishing.
        </p>
      </section>

      {/* 3. THREE CORE FEATURES (ANALYZE · PREDICT · OPTIMIZE) */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* ANALYZE */}
        <div className="p-5 rounded-2xl bg-white border border-[#E7E3F0] shadow-card hover:shadow-card-hover transition-all space-y-2 text-left">
          <div className="w-8 h-8 rounded-xl bg-[#F0EBFF] border border-[#6C4DFF]/20 flex items-center justify-center text-[#6C4DFF]">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-[#242137] uppercase tracking-wider">
            Analyze
          </h3>
          <p className="text-xs text-[#68677D] leading-relaxed">
            Understand meaningful signals from planned content.
          </p>
        </div>

        {/* PREDICT */}
        <div className="p-5 rounded-2xl bg-white border border-[#E7E3F0] shadow-card hover:shadow-card-hover transition-all space-y-2 text-left">
          <div className="w-8 h-8 rounded-xl bg-[#F0EBFF] border border-[#6C4DFF]/20 flex items-center justify-center text-[#6C4DFF]">
            <Target className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-[#242137] uppercase tracking-wider">
            Predict
          </h3>
          <p className="text-xs text-[#68677D] leading-relaxed">
            Estimate engagement using machine-learning models.
          </p>
        </div>

        {/* OPTIMIZE */}
        <div className="p-5 rounded-2xl bg-white border border-[#E7E3F0] shadow-card hover:shadow-card-hover transition-all space-y-2 text-left">
          <div className="w-8 h-8 rounded-xl bg-[#F0EBFF] border border-[#6C4DFF]/20 flex items-center justify-center text-[#6C4DFF]">
            <GitCompare className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-[#242137] uppercase tracking-wider">
            Optimize
          </h3>
          <p className="text-xs text-[#68677D] leading-relaxed">
            Compare alternative scenarios before publishing.
          </p>
        </div>
      </section>

      {/* 4. SIMPLE WORKFLOW */}
      <section className="p-6 rounded-2xl bg-white border border-[#E7E3F0] shadow-card space-y-4">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#68677D]">
          Simple Workflow Flow
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs text-center">
          <div className="p-3.5 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0] flex flex-col items-center gap-1.5">
            <Instagram className="w-4 h-4 text-[#E1306C]" />
            <strong className="text-[#242137]">Instagram Post</strong>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0] flex flex-col items-center gap-1.5">
            <Cpu className="w-4 h-4 text-[#6C4DFF]" />
            <strong className="text-[#242137]">Content Signals</strong>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0] flex flex-col items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#6C4DFF]" />
            <strong className="text-[#242137]">Machine Learning</strong>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0F9D8A]/10 border border-[#0F9D8A]/20 flex flex-col items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-[#0F9D8A]" />
            <strong className="text-[#0F9D8A]">Engagement Estimate</strong>
          </div>
        </div>
      </section>

      {/* 5. MACHINE LEARNING (MINIMAL) */}
      <section className="p-6 rounded-2xl bg-white border border-[#E7E3F0] shadow-card space-y-3">
        <h2 className="text-base font-bold text-[#242137] tracking-tight">
          Machine Learning
        </h2>
        <p className="text-xs sm:text-sm text-[#68677D] leading-relaxed">
          TrendSkope evaluates multiple regression approaches using a chronological dataset split and selects the model using validation performance.
        </p>

        {/* 6 small model chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {modelChips.map((chip, idx) => (
            <span
              key={idx}
              className="text-xs font-mono font-medium px-3 py-1 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0] text-[#242137]"
            >
              {chip}
            </span>
          ))}
        </div>
      </section>

      {/* 6. WHAT TRENDSKOPE PREDICTS (ENGAGEMENT RATE) */}
      <section className="p-6 rounded-2xl bg-white border border-[#E7E3F0] shadow-card space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#242137] tracking-tight">
            Engagement Rate
          </h2>
          <span className="text-[11px] font-mono text-[#6C4DFF] bg-[#F0EBFF] border border-[#6C4DFF]/20 px-2.5 py-0.5 rounded-lg font-bold">
            log1p(engagement_rate)
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#68677D] leading-relaxed">
          Follower-normalized engagement estimated from observable pre-publication signals.
        </p>
      </section>

      {/* 7. IMPORTANT BOUNDARIES */}
      <section className="p-5 rounded-2xl bg-amber-50/50 border border-[#E9A23B]/30 space-y-1.5 text-xs text-[#68677D]">
        <div className="flex items-center gap-2 text-[#242137] font-bold">
          <ShieldAlert className="w-4 h-4 text-[#E9A23B]" />
          <h3>Important</h3>
        </div>
        <p className="leading-relaxed">
          TrendSkope provides model-based estimates from historical data. It does not reproduce Instagram&apos;s proprietary recommendation system, guarantee future engagement, or make causal claims.
        </p>
      </section>

      {/* 8. PROJECT FOOTER */}
      <div className="p-6 rounded-2xl bg-white border border-[#E7E3F0] shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <strong className="text-sm font-bold text-[#242137]">GROUP 2 · S5 CSE</strong>
          </div>
          <p className="text-xs text-[#68677D]">
            Machine Learning Project · Built by the TrendSkope team.
          </p>
        </div>

        <a
          href="/developers"
          className="btn-secondary text-xs px-4 py-2 inline-flex items-center gap-1.5"
        >
          <Users className="w-3.5 h-3.5 text-[#6C4DFF]" />
          <span>Meet the Developers</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
