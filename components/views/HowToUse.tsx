"use client";

import React, { useState } from "react";
import {
  FileText,
  Cpu,
  Target,
  Sliders,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
  CheckCircle2,
  Clock,
  Video,
  Image as ImageIcon,
  BarChart2,
  TrendingUp,
  Layers,
} from "lucide-react";

interface HowToUseProps {
  onNavigateToPredict: () => void;
  onNavigateToWhatIf?: () => void;
}

export default function HowToUse({
  onNavigateToPredict,
  onNavigateToWhatIf,
}: HowToUseProps) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: "01",
      badge: "01 CREATE",
      title: "Create your post idea",
      shortDesc: "Enter the details of the Instagram post you are planning to publish.",
      fullDesc:
        "Input your planned caption, choose your media format (Image, Reel, or Carousel), set your scheduled publication time, and provide your account's follower scale. All inputs represent information available strictly before the post goes live.",
      keyPoints: [
        "Caption text, length, and hashtag strategy",
        "Planned media format & aspect ratio",
        "Scheduled day of week and posting hour",
        "Historical account scale context",
      ],
      actionText: "Analyze Your Post",
      onAction: onNavigateToPredict,
      illustration: (
        <div className="p-4 rounded-xl bg-[#060e1a] border border-white/[0.08] space-y-3 font-sans">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/[0.06]">
            <span className="font-semibold text-slate-200">Post Draft Input</span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              Ready to analyze
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10.5px] font-mono uppercase text-slate-400">
              Planned Caption
            </label>
            <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-slate-300 line-clamp-2">
              &quot;Behind the scenes of our summer collection release ☀️ Drop a comment below! #summer #launch&quot;
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <span className="text-[10px] font-mono text-slate-500 block">Media Type</span>
              <span className="text-xs font-semibold text-white flex items-center gap-1 mt-0.5">
                <Video className="w-3.5 h-3.5 text-primary-orange" /> Reel Video
              </span>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <span className="text-[10px] font-mono text-slate-500 block">Scheduled Time</span>
              <span className="text-xs font-semibold text-white flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-primary-orange" /> 7:30 PM (Evening)
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "02",
      badge: "02 ANALYZE",
      title: "Analyze pre-publication signals",
      shortDesc: "TrendSkope extracts and cleans 25 pre-publication features automatically.",
      fullDesc:
        "When you click Analyze, TrendSkope parses your post details into linguistic, temporal, media, and scale features. No future data or post-hoc metrics (like actual likes or comments) are ever used, ensuring honest out-of-sample evaluation.",
      keyPoints: [
        "Linguistic features (sentiment, caption length, emojis)",
        "Temporal features (day of week, peak hours, cyclical signals)",
        "Media parameters (video/image encoding flag)",
        "Log follower normalization for fair comparison",
      ],
      actionText: "Run Prediction Now",
      onAction: onNavigateToPredict,
      illustration: (
        <div className="p-4 rounded-xl bg-[#060e1a] border border-white/[0.08] space-y-3 font-sans">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/[0.06]">
            <span className="font-semibold text-slate-200">Feature Extraction Pipeline</span>
            <span className="text-[10px] font-mono text-primary-orange bg-primary-orange/10 px-2 py-0.5 rounded">
              25 Signals Parsed
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
              <span className="text-slate-300 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-primary-orange" /> Caption Sentiment & Length
              </span>
              <span className="text-[10px] font-mono text-emerald-400">Extracted</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
              <span className="text-slate-300 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-primary-orange" /> Temporal Sine/Cosine Timing
              </span>
              <span className="text-[10px] font-mono text-emerald-400">Extracted</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
              <span className="text-slate-300 flex items-center gap-2">
                <Video className="w-3.5 h-3.5 text-primary-orange" /> Format & Account Scale
              </span>
              <span className="text-[10px] font-mono text-emerald-400">Extracted</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "03",
      badge: "03 PREDICT",
      title: "Understand the prediction & performance band",
      shortDesc: "Review your predicted engagement rate, confidence interval, and signal impact.",
      fullDesc:
        "The model produces a predicted engagement rate accompanied by an empirical uncertainty interval and an intuitive performance band (Above Baseline, Average, or Below Baseline) to contextualize expected performance against historical posts.",
      keyPoints: [
        "Expected engagement rate with historical context",
        "Performance band ranking (relative to dataset baseline)",
        "Top positive and negative signal drivers",
        "Actionable recommendations to improve engagement",
      ],
      actionText: "View Predict View",
      onAction: onNavigateToPredict,
      illustration: (
        <div className="p-4 rounded-xl bg-[#060e1a] border border-white/[0.08] space-y-3 font-sans">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/[0.06]">
            <span className="font-semibold text-slate-200">Prediction Interpretation</span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              High Confidence
            </span>
          </div>

          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-slate-400">Performance Band</span>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                Above Baseline
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary-orange to-emerald-400 rounded-full w-[78%]" />
            </div>
          </div>

          <div className="text-[11px] text-slate-400 leading-snug">
            <span className="text-slate-300 font-semibold block mb-0.5">Top Signal Driver:</span>
            Reel video format posted during peak evening window positively influences expected reach.
          </div>
        </div>
      ),
    },
    {
      id: "04",
      badge: "04 OPTIMIZE",
      title: "Use What-If analysis to compare options",
      shortDesc: "Test different captions, media types, and schedules side-by-side.",
      fullDesc:
        "Before hitting publish, use the What-If Analysis view to experiment with alternative scenarios. See how moving your scheduled time from afternoon to evening or changing an image into a video changes the predicted engagement rate.",
      keyPoints: [
        "Side-by-side scenario comparison",
        "Timing sensitivity (morning vs evening vs weekend)",
        "Media type comparison (Single Image vs Carousel vs Reel)",
        "Data-backed publishing optimization",
      ],
      actionText: "Try What-If Analysis",
      onAction: onNavigateToWhatIf || onNavigateToPredict,
      illustration: (
        <div className="p-4 rounded-xl bg-[#060e1a] border border-white/[0.08] space-y-3 font-sans">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/[0.06]">
            <span className="font-semibold text-slate-200">What-If Scenario Comparison</span>
            <span className="text-[10px] font-mono text-primary-orange bg-primary-orange/10 px-2 py-0.5 rounded">
              2 Scenarios
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Scenario A (Draft)</span>
              <span className="text-slate-300 font-medium block mt-1">Friday 2:00 PM</span>
              <span className="text-[11px] text-slate-400">Static Image</span>
              <span className="text-[10px] font-semibold text-slate-400 block mt-1">Baseline Result</span>
            </div>

            <div className="p-2.5 rounded-lg bg-primary-orange/10 border border-primary-orange/25">
              <span className="text-[10px] font-mono text-primary-orange uppercase block font-semibold">Scenario B (Optimized)</span>
              <span className="text-white font-medium block mt-1">Friday 7:30 PM</span>
              <span className="text-slate-300 text-[11px]">Reel Video</span>
              <span className="text-[10px] font-bold text-emerald-400 block mt-1">↑ Improved Trajectory</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const current = steps[activeStep];

  return (
    <section className="glass-card p-7 sm:p-9 md:p-10 rounded-3xl border-border/80 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-primary-orange" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary-orange">
              Interactive Workflow Guide
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            How to Use <span className="gradient-accent">TrendSkope</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            From your post idea to a data-informed publishing decision in a few simple steps.
          </p>
        </div>

        {/* Start Here Badge */}
        <button
          onClick={() => setActiveStep(0)}
          className="self-start sm:self-auto px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 hover:border-primary-orange/40 hover:bg-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white transition-all duration-200 flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary-orange" />
          <span className="text-[11px] font-mono uppercase">New to TrendSkope?</span>
          <span className="text-primary-orange">Start here →</span>
        </button>
      </div>

      {/* Step Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-8">
        {steps.map((step, index) => {
          const isActive = activeStep === index;
          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(index)}
              className={`p-3 sm:p-3.5 rounded-xl text-left transition-all duration-200 border ${
                isActive
                  ? "bg-primary-orange/10 border-primary-orange/40 shadow-[0_0_15px_rgba(255,110,64,0.12)] text-white"
                  : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/15 text-slate-400"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                    isActive ? "text-primary-orange" : "text-slate-500"
                  }`}
                >
                  Step {step.id}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-orange animate-pulse" />
                )}
              </div>
              <span className="text-xs sm:text-sm font-bold block truncate text-slate-200">
                {step.badge.split(" ")[1]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Step Walkthrough Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-2xl bg-white/[0.015] border border-white/[0.05] p-6 sm:p-8">
        {/* Left Side: Step Details & Narrative */}
        <div className="lg:col-span-7 space-y-5">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-primary-orange bg-primary-orange/10 px-2.5 py-1 rounded-md border border-primary-orange/20 inline-block">
              {current.badge}
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {current.title}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              {current.fullDesc}
            </p>
          </div>

          {/* Key Checklist Points */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
              What happens in this step:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {current.keyPoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary-orange shrink-0 mt-0.5" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Controls & Action */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/[0.06]">
            <button
              onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
              disabled={activeStep === 0}
              className={`btn-secondary text-xs px-3.5 py-2 ${
                activeStep === 0 ? "opacity-40 cursor-not-allowed" : "hover:bg-white/10"
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {activeStep < steps.length - 1 ? (
              <button
                onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
                className="btn-secondary text-xs px-3.5 py-2 hover:bg-white/10"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : null}

            <button
              onClick={current.onAction}
              className="btn-primary text-xs px-4 py-2 group ml-auto"
            >
              <span>{current.actionText}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Right Side: Step UI Illustration */}
        <div className="lg:col-span-5">
          {current.illustration}
        </div>
      </div>

      {/* Helpful Technical Concepts Tooltips */}
      <div className="mt-8 pt-6 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400">
        <div className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.015] border border-white/[0.04]">
          <Info className="w-4 h-4 text-primary-orange shrink-0 mt-0.5" />
          <div>
            <span className="text-slate-200 font-semibold block mb-0.5">
              Predicted Engagement
            </span>
            <span>Estimated engagement rate based on pre-publication signals and the trained model.</span>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.015] border border-white/[0.04]">
          <Info className="w-4 h-4 text-primary-orange shrink-0 mt-0.5" />
          <div>
            <span className="text-slate-200 font-semibold block mb-0.5">
              Performance Band
            </span>
            <span>A relative interpretation comparing your post against historical dataset percentiles.</span>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.015] border border-white/[0.04]">
          <Info className="w-4 h-4 text-primary-orange shrink-0 mt-0.5" />
          <div>
            <span className="text-slate-200 font-semibold block mb-0.5">
              What-If Analysis
            </span>
            <span>Compare alternative post configurations (timing, formats) before publishing.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
