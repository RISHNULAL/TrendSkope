"use client";

import React from "react";
import {
  FileText,
  Cpu,
  BarChart3,
  GitCompare,
  ArrowRight,
} from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      badge: "POST IDEA",
      title: "01 — Create",
      desc: "Add your planned post details.",
      icon: FileText,
    },
    {
      num: "02",
      badge: "CONTENT ANALYSIS",
      title: "02 — Analyze",
      desc: "Extract meaningful content signals.",
      icon: Cpu,
    },
    {
      num: "03",
      badge: "ML PREDICTION",
      title: "03 — Predict",
      desc: "Estimate engagement using the trained model.",
      icon: BarChart3,
    },
    {
      num: "04",
      badge: "OPTIMIZATION",
      title: "04 — Optimize",
      desc: "Compare alternative scenarios before publishing.",
      icon: GitCompare,
    },
  ];

  return (
    <section className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-1 text-left">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#6C63FF] uppercase bg-[#E0E5EC] px-2.5 py-1 rounded-full shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)]">
            Workflow Architecture
          </span>
          <span className="text-[10px] text-[#6B7280]">·</span>
          <span className="text-xs font-semibold text-[#6B7280]">4-Stage Framework</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#3D4852] tracking-tight">
          How It Works
        </h2>
        <p className="text-xs sm:text-sm text-[#6B7280]">
          From your post idea to a data-informed decision.
        </p>
      </div>

      {/* 4 Clean Visual Steps with subtle connecting indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="p-5 sm:p-6 rounded-3xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] flex flex-col justify-between relative group transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-[#6C63FF] uppercase">
                    {step.badge}
                  </span>
                  <div className="w-8 h-8 rounded-2xl bg-[#E0E5EC] shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] flex items-center justify-center text-[#6C63FF]">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#3D4852] tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>

              {/* Connecting arrow for large screens */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-[#E0E5EC] shadow-[3px_3px_6px_rgb(163,177,198,0.6),-3px_-3px_6px_rgba(255,255,255,0.5)] items-center justify-center text-[#6B7280]">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
