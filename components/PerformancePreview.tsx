"use client";

import React from "react";
import { TrendingUp, Layers, Cpu, FileText, ArrowRight, CheckCircle2 } from "lucide-react";

export default function PerformancePreview() {
  return (
    <div className="w-full max-w-md lg:max-w-none rounded-2xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] border border-transparent p-5 sm:p-6  backdrop-blur-md relative overflow-hidden group">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-[radial-gradient(circle,rgba(255,112,72,0.12)_0%,transparent_70%)] blur-xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-transparent">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#38B2AC] animate-pulse" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6B7280]">
            Decision Intelligence
          </span>
        </div>
        <span className="text-[10.5px] font-medium text-[#6C63FF] bg-primary-orange/10 px-2.5 py-0.5 rounded-full border border-transparent">
          Pre-Publication
        </span>
      </div>

      {/* Decision Pipeline Steps */}
      <div className="grid grid-cols-3 gap-2 text-center mb-4">
        <div className="p-2.5 rounded-xl bg-[#E0E5EC] border border-transparent flex flex-col items-center justify-center">
          <FileText className="w-4 h-4 text-[#6B7280] mb-1" />
          <span className="text-[10px] font-mono text-[#6B7280] uppercase font-semibold">
            01 Draft
          </span>
          <span className="text-[11px] text-[#3D4852] font-medium truncate w-full">
            Content Idea
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#E0E5EC] border border-transparent flex flex-col items-center justify-center">
          <Cpu className="w-4 h-4 text-[#6C63FF] mb-1" />
          <span className="text-[10px] font-mono text-[#6C63FF] uppercase font-semibold">
            02 Signals
          </span>
          <span className="text-[11px] text-[#3D4852] font-medium truncate w-full">
            25 Features
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center">
          <TrendingUp className="w-4 h-4 text-[#0F766E] mb-1" />
          <span className="text-[10px] font-mono text-[#0F766E] uppercase font-semibold">
            03 Decision
          </span>
          <span className="text-[11px] text-[#0F766E] font-medium truncate w-full">
            Informed Reach
          </span>
        </div>
      </div>

      {/* Visual Rising Trajectory Graph */}
      <div className="p-3.5 rounded-xl bg-[#E0E5EC] border border-transparent mb-4 relative">
        <div className="flex items-center justify-between text-[11px] font-medium text-[#6B7280] mb-1.5">
          <span>Expected Engagement Trajectory</span>
          <span className="text-[#0F766E] font-mono text-[10.5px]">Optimized Path</span>
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
                <stop offset="45%" stopColor="#6C63FF" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#6C63FF" stopOpacity="1" />
              </linearGradient>
              <linearGradient id="trajArea" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6C63FF" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#6C63FF" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Baseline Guideline */}
            <line
              x1="10"
              y1="75"
              x2="270"
              y2="75"
              stroke="rgba(163,177,198,0.7)"
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
            <circle cx="145" cy="45" r="3.5" fill="#6C63FF" />
            <circle cx="270" cy="10" r="4" fill="#6C63FF" />
          </svg>
        </div>

        {/* Informative Label */}
        <div className="flex items-center justify-between text-[10.5px] text-[#6B7280] mt-1 pt-2 border-t border-transparent">
          <span>Pre-Publication Tuning</span>
          <span className="text-[#6B7280] font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#0F766E]" />
            Data-Informed Publishing
          </span>
        </div>
      </div>

      {/* Before vs After Concept */}
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="p-2.5 rounded-2xl bg-[#E0E5EC] border border-transparent">
          <span className="text-[10px] font-mono text-[#6B7280] uppercase block font-semibold">
            Before
          </span>
          <span className="text-[#6B7280] leading-tight block mt-0.5">
            Publish without performance visibility
          </span>
        </div>

        <div className="p-2.5 rounded-2xl bg-primary-orange/5 border border-transparent">
          <span className="text-[10px] font-mono text-[#6C63FF] uppercase block font-semibold">
            With TrendSkope
          </span>
          <span className="text-[#3D4852] leading-tight block mt-0.5 font-medium">
            Test timing & format before publishing
          </span>
        </div>
      </div>
    </div>
  );
}
