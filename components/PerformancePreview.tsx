"use client";

import React from "react";
import { TrendingUp, Layers, Cpu, FileText, ArrowRight, CheckCircle2 } from "lucide-react";

export default function PerformancePreview() {
  return (
    <div className="w-full max-w-md lg:max-w-none rounded-2xl bg-white shadow-card border border-[#E7E3F0] p-5 sm:p-6 backdrop-blur-md relative overflow-hidden group">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-[radial-gradient(circle,rgba(108,77,255,0.08)_0%,transparent_70%)] blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#E7E3F0]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#0F9D8A] animate-pulse" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#68677D]">
            Decision Intelligence
          </span>
        </div>
        <span className="text-[10.5px] font-semibold text-[#6C4DFF] bg-[#F0EBFF] px-2.5 py-0.5 rounded-full border border-[#6C4DFF]/20">
          Pre-Publication
        </span>
      </div>

      {/* Decision Pipeline Steps */}
      <div className="grid grid-cols-3 gap-2 text-center mb-4">
        <div className="p-2.5 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0] flex flex-col items-center justify-center">
          <FileText className="w-4 h-4 text-[#68677D] mb-1" />
          <span className="text-[10px] font-mono text-[#68677D] uppercase font-semibold">
            01 Draft
          </span>
          <span className="text-[11px] text-[#242137] font-semibold truncate w-full">
            Content Idea
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#F0EBFF] border border-[#6C4DFF]/20 flex flex-col items-center justify-center">
          <Cpu className="w-4 h-4 text-[#6C4DFF] mb-1" />
          <span className="text-[10px] font-mono text-[#6C4DFF] uppercase font-bold">
            02 Signals
          </span>
          <span className="text-[11px] text-[#242137] font-semibold truncate w-full">
            25 Features
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#0F9D8A]/10 border border-[#0F9D8A]/20 flex flex-col items-center justify-center">
          <TrendingUp className="w-4 h-4 text-[#0F9D8A] mb-1" />
          <span className="text-[10px] font-mono text-[#0F9D8A] uppercase font-bold">
            03 Decision
          </span>
          <span className="text-[11px] text-[#0F9D8A] font-bold truncate w-full">
            Informed Reach
          </span>
        </div>
      </div>

      {/* Visual Rising Trajectory Graph */}
      <div className="p-3.5 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0] mb-4 relative">
        <div className="flex items-center justify-between text-[11px] font-semibold text-[#68677D] mb-1.5">
          <span>Expected Engagement Trajectory</span>
          <span className="text-[#0F9D8A] font-mono text-[10.5px]">Optimized Path</span>
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
                <stop offset="0%" stopColor="#8E8DA8" stopOpacity="0.5" />
                <stop offset="45%" stopColor="#6C4DFF" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#6C4DFF" stopOpacity="1" />
              </linearGradient>
              <linearGradient id="trajArea" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6C4DFF" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#6C4DFF" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Baseline Guideline */}
            <line
              x1="10"
              y1="75"
              x2="270"
              y2="75"
              stroke="#E7E3F0"
              strokeDasharray="4 4"
              strokeWidth="1.5"
            />
            <text x="12" y="88" fill="#8E8DA8" fontSize="8.5" fontFamily="monospace">
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
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Progression Nodes */}
            <circle cx="10" cy="75" r="3.5" fill="#8E8DA8" />
            <circle cx="145" cy="45" r="4" fill="#6C4DFF" />
            <circle cx="270" cy="10" r="4.5" fill="#6C4DFF" stroke="#FFFFFF" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Informative Label */}
        <div className="flex items-center justify-between text-[10.5px] text-[#68677D] mt-1 pt-2 border-t border-[#E7E3F0]">
          <span>Pre-Publication Tuning</span>
          <span className="text-[#242137] font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0F9D8A]" />
            Data-Informed Publishing
          </span>
        </div>
      </div>

      {/* Before vs After Concept */}
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="p-2.5 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0]">
          <span className="text-[10px] font-mono text-[#68677D] uppercase block font-bold">
            Before
          </span>
          <span className="text-[#68677D] leading-tight block mt-0.5">
            Publish without performance visibility
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#F0EBFF] border border-[#6C4DFF]/20">
          <span className="text-[10px] font-mono text-[#6C4DFF] uppercase block font-bold">
            With TrendSkope
          </span>
          <span className="text-[#242137] leading-tight block mt-0.5 font-semibold">
            Test timing & format before publishing
          </span>
        </div>
      </div>
    </div>
  );
}
