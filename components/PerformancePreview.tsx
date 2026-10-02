"use client";

import React from "react";
import { TrendingUp, Layers, Cpu, FileText, ArrowRight, CheckCircle2 } from "lucide-react";

export default function PerformancePreview() {
  return (
    <div className="w-full max-w-md lg:max-w-none rounded-2xl bg-[#091527]/90 border border-white/10 p-5 sm:p-6 shadow-[0_12px_36px_rgba(0,0,0,0.55),0_0_20px_rgba(255,112,72,0.06)] backdrop-blur-md relative overflow-hidden group">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-[radial-gradient(circle,rgba(255,112,72,0.12)_0%,transparent_70%)] blur-xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/[0.07]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">
            Decision Intelligence
          </span>
        </div>
        <span className="text-[10.5px] font-medium text-primary-orange bg-primary-orange/10 px-2.5 py-0.5 rounded-full border border-primary-orange/20">
          Pre-Publication
        </span>
      </div>

      {/* Decision Pipeline Steps */}
      <div className="grid grid-cols-3 gap-2 text-center mb-4">
        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col items-center justify-center">
          <FileText className="w-4 h-4 text-slate-400 mb-1" />
          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
            01 Draft
          </span>
          <span className="text-[11px] text-slate-200 font-medium truncate w-full">
            Content Idea
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col items-center justify-center">
          <Cpu className="w-4 h-4 text-primary-orange mb-1" />
          <span className="text-[10px] font-mono text-primary-orange uppercase font-semibold">
            02 Signals
          </span>
          <span className="text-[11px] text-slate-200 font-medium truncate w-full">
            25 Features
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center">
          <TrendingUp className="w-4 h-4 text-emerald-400 mb-1" />
          <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">
            03 Decision
          </span>
          <span className="text-[11px] text-emerald-300 font-medium truncate w-full">
            Informed Reach
          </span>
        </div>
      </div>

      {/* Visual Rising Trajectory Graph */}
      <div className="p-3.5 rounded-xl bg-[#060e1b] border border-white/[0.06] mb-4 relative">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-1.5">
          <span>Expected Engagement Trajectory</span>
          <span className="text-emerald-400 font-mono text-[10.5px]">Optimized Path</span>
        </div>

        <div className="relative w-full h-24 sm:h-28">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 280 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="trajGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8a99ad" stopOpacity="0.5" />
                <stop offset="45%" stopColor="#ff9438" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#ff405f" stopOpacity="1" />
              </linearGradient>
              <linearGradient id="trajArea" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ff7048" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#ff7048" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Baseline Guideline */}
            <line
              x1="10"
              y1="75"
              x2="270"
              y2="75"
              stroke="rgba(255,255,255,0.12)"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
            <text x="12" y="88" fill="#64748b" fontSize="8.5" fontFamily="monospace">
              Historical Account Baseline
            </text>

            {/* Area under rising curve */}
            <path
              d="M 10,75 C 60,74 100,70 145,45 C 190,20 230,12 270,10 L 270,95 L 10,95 Z"
              fill="url(#trajArea)"
            />

            {/* Main Upward Trajectory Curve */}
            <path
              d="M 10,75 C 60,74 100,70 145,45 C 190,20 230,12 270,10"
              stroke="url(#trajGrad)"
              strokeWidth="2.4"
              strokeLinecap="round"
            />

            {/* Progression Nodes */}
            <circle cx="10" cy="75" r="3" fill="#8a99ad" />
            <circle cx="145" cy="45" r="3.5" fill="#ff9438" />
            <circle cx="270" cy="10" r="4" fill="#ff405f" />
          </svg>
        </div>

        {/* Informative Label */}
        <div className="flex items-center justify-between text-[10.5px] text-slate-400 mt-1 pt-2 border-t border-white/[0.04]">
          <span>Pre-Publication Tuning</span>
          <span className="text-slate-300 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Data-Informed Publishing
          </span>
        </div>
      </div>

      {/* Before vs After Concept */}
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
          <span className="text-[10px] font-mono text-slate-500 uppercase block font-semibold">
            Before
          </span>
          <span className="text-slate-400 leading-tight block mt-0.5">
            Publish without performance visibility
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-primary-orange/5 border border-primary-orange/20">
          <span className="text-[10px] font-mono text-primary-orange uppercase block font-semibold">
            With TrendSkope
          </span>
          <span className="text-slate-200 leading-tight block mt-0.5 font-medium">
            Test timing & format before publishing
          </span>
        </div>
      </div>
    </div>
  );
}
