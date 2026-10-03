"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Video,
  Clock,
  CheckCircle2,
  BarChart3,
  GitCompare,
  Zap,
  Sparkles,
} from "lucide-react";

interface HowToUseProps {
  onNavigateToPredict: () => void;
  onNavigateToWhatIf?: () => void;
}

interface SlideItem {
  num: string;
  code: string;
  title: string;
  tagline: string;
  ctaText: string;
  onCta: () => void;
  callouts: { num: string; label: string; detail: string }[];
  renderUI: () => React.ReactNode;
}

export default function HowToUse({
  onNavigateToPredict,
  onNavigateToWhatIf,
}: HowToUseProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const sectionRef = useRef<HTMLDivElement | null>(null);

  const SLIDE_DURATION = 5000; // 5 seconds per slide
  const TICK_INTERVAL = 50;

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);

      const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener("change", handleMotionChange);
      return () => mediaQuery.removeEventListener("change", handleMotionChange);
    }
  }, []);

  // IntersectionObserver: Only enable autoplay when section is visible in viewport
  useEffect(() => {
    const target = sectionRef.current;
    if (!target || typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.35, // Autoplay starts when 35% of section is visible
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, []);

  const slides: SlideItem[] = [
    {
      num: "01",
      code: "CREATE",
      title: "01",
      tagline: "Add your planned post details.",
      ctaText: "Start Creating →",
      onCta: onNavigateToPredict,
      callouts: [
        { num: "①", label: "Caption", detail: "Text length, tone & hashtags" },
        { num: "②", label: "Format", detail: "Reel video / carousel / image" },
        { num: "③", label: "Publishing time", detail: "Scheduled day & peak hour" },
      ],
      renderUI: () => (
        <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 rounded-2xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] space-y-4">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-border/20 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6C63FF]" />
              <strong className="text-[#3D4852] font-bold text-xs sm:text-sm">Analyze Post Workspace</strong>
            </div>
            <span className="text-[10px] font-mono text-[#0F766E] bg-emerald-500/10 px-2.5 py-0.5 rounded-full font-semibold">
              Pre-Publication Draft
            </span>
          </div>

          {/* ① Caption */}
          <div className="relative p-3.5 rounded-xl bg-[#E0E5EC] shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-[#6B7280]">
                Planned Caption Text
              </span>
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#6C63FF] text-white text-[11px] font-bold shadow-sm">
                ①
              </span>
            </div>
            <div className="text-xs text-[#3D4852] font-medium leading-relaxed bg-[#E0E5EC] p-2.5 rounded-lg shadow-[inset_2px_2px_4px_rgb(163,177,198,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]">
              &quot;Behind the scenes of our summer collection release 🎬 Drop your thoughts below! #behindthescenes #launch&quot;
            </div>
          </div>

          {/* ② Format & ③ Publishing Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* ② Format */}
            <div className="relative p-3 rounded-xl bg-[#E0E5EC] shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-[#6B7280]">
                  Media Format
                </span>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#6C63FF] text-white text-[11px] font-bold shadow-sm">
                  ②
                </span>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#6C63FF]/10 border border-[#6C63FF]/30 text-xs font-bold text-[#6C63FF]">
                <Video className="w-3.5 h-3.5 shrink-0" />
                <span>Reel (Short Video)</span>
              </div>
            </div>

            {/* ③ Publishing time */}
            <div className="relative p-3 rounded-xl bg-[#E0E5EC] shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-[#6B7280]">
                  Publishing Time
                </span>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#6C63FF] text-white text-[11px] font-bold shadow-sm">
                  ③
                </span>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#E0E5EC] shadow-[inset_2px_2px_4px_rgb(163,177,198,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.5)] text-xs font-semibold text-[#3D4852]">
                <Clock className="w-3.5 h-3.5 text-[#6C63FF] shrink-0" />
                <span>Friday · 7:30 PM (Peak)</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      num: "02",
      code: "ANALYZE",
      title: "02",
      tagline: "Understand the signals extracted from your content.",
      ctaText: "Analyze a Post →",
      onCta: onNavigateToPredict,
      callouts: [
        { num: "①", label: "Content signals", detail: "Sentiment, length & keyword patterns" },
        { num: "②", label: "Media signals", detail: "Format binary flags & encoding" },
        { num: "③", label: "Caption signals", detail: "Hashtags, question markers & emojis" },
      ],
      renderUI: () => (
        <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 rounded-2xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] space-y-3.5">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-border/20 text-xs">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#6C63FF]" />
              <strong className="text-[#3D4852] font-bold text-xs sm:text-sm">Signal Extraction Matrix</strong>
            </div>
            <span className="text-[10px] font-mono text-[#6C63FF] bg-primary-orange/10 px-2.5 py-0.5 rounded-full font-semibold">
              25 Signals Parsed
            </span>
          </div>

          {/* ① Content Signals */}
          <div className="relative p-3 rounded-xl bg-[#E0E5EC] shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono font-bold uppercase text-[#6B7280]">
                Content Signals
              </span>
              <div className="text-xs font-mono text-[#3D4852] font-bold">
                Sentiment: +0.62 · Length: 94 chars · Positive Tone
              </div>
            </div>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#6C63FF] text-white text-[11px] font-bold shadow-sm">
              ①
            </span>
          </div>

          {/* ② Media Signals */}
          <div className="relative p-3 rounded-xl bg-[#E0E5EC] shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono font-bold uppercase text-[#6B7280]">
                Media Signals
              </span>
              <div className="text-xs font-mono text-[#3D4852] font-bold">
                is_reel: 1.0 · is_image: 0.0 · is_carousel: 0.0
              </div>
            </div>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#6C63FF] text-white text-[11px] font-bold shadow-sm">
              ②
            </span>
          </div>

          {/* ③ Caption Signals */}
          <div className="relative p-3 rounded-xl bg-[#E0E5EC] shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono font-bold uppercase text-[#6B7280]">
                Caption Signals
              </span>
              <div className="text-xs font-mono text-[#3D4852] font-bold">
                Hashtags: 2 · Emojis: 1 · Questions: 1 (Engagement Prompt)
              </div>
            </div>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#6C63FF] text-white text-[11px] font-bold shadow-sm">
              ③
            </span>
          </div>
        </div>
      ),
    },
    {
      num: "03",
      code: "PREDICT",
      title: "03",
      tagline: "Estimate engagement before publishing.",
      ctaText: "Try a Prediction →",
      onCta: onNavigateToPredict,
      callouts: [
        { num: "①", label: "Estimated engagement", detail: "Follower-normalized engagement estimate" },
        { num: "②", label: "Model status", detail: "Bayesian Ridge trained regression model" },
        { num: "③", label: "Performance interpretation", detail: "Ranked vs historical corpus percentiles" },
      ],
      renderUI: () => (
        <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 rounded-2xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] space-y-4">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-border/20 text-xs">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#6C63FF]" />
              <strong className="text-[#3D4852] font-bold text-xs sm:text-sm">Model Prediction Output</strong>
            </div>
            <span className="text-[10px] font-mono text-[#6B7280] bg-[#E0E5EC] px-2.5 py-0.5 rounded-full shadow-[inset_2px_2px_4px_rgb(163,177,198,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]">
              Illustrative Result
            </span>
          </div>

          {/* ① Estimated Engagement & ③ Performance Interpretation */}
          <div className="p-4 rounded-2xl bg-[#E0E5EC] shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono uppercase font-bold text-[#6B7280]">
                  Estimated Engagement
                </span>
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#6C63FF] text-white text-[10px] font-bold">
                  ①
                </span>
              </div>
              <div className="text-3xl font-mono font-black text-[#3D4852]">
                8.42% <span className="text-xs font-normal text-[#6B7280]">est.</span>
              </div>
              <div className="text-[10px] text-[#6B7280] font-mono">
                Uncertainty range: 7.15% → 9.69%
              </div>
            </div>

            {/* ③ Performance Interpretation */}
            <div className="text-right space-y-1.5">
              <div className="flex items-center justify-end gap-1">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#6C63FF] text-white text-[10px] font-bold">
                  ③
                </span>
                <span className="text-[10px] font-mono text-[#6B7280]">Performance Band</span>
              </div>
              <span className="inline-block px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-[#0F766E]">
                Above Baseline
              </span>
              <div className="text-[10px] text-[#6B7280] font-mono">Top 25% of corpus</div>
            </div>
          </div>

          {/* ② Model Status */}
          <div className="p-3 rounded-xl bg-[#E0E5EC] shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#38B2AC] animate-pulse" />
              <span className="text-[#3D4852] font-semibold">Model Status:</span>
              <span className="text-[#6C63FF] font-mono font-bold">Bayesian Ridge Regression (Ready)</span>
            </div>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#6C63FF] text-white text-[11px] font-bold shadow-sm">
              ②
            </span>
          </div>
        </div>
      ),
    },
    {
      num: "04",
      code: "OPTIMIZE",
      title: "04",
      tagline: "Compare alternative post configurations.",
      ctaText: "Open What-If →",
      onCta: onNavigateToWhatIf || onNavigateToPredict,
      callouts: [
        { num: "①", label: "Scenario A", detail: "Original draft configuration (5.80%)" },
        { num: "②", label: "Scenario B", detail: "Optimized variant with Reel format (8.42%)" },
        { num: "③", label: "Estimated difference", detail: "+2.62 pp data-informed shift" },
      ],
      renderUI: () => (
        <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 rounded-2xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] space-y-4">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-border/20 text-xs">
            <div className="flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-[#6C63FF]" />
              <strong className="text-[#3D4852] font-bold text-xs sm:text-sm">What-If Studio Comparison</strong>
            </div>
            <span className="text-[10px] font-mono text-[#6C63FF] bg-primary-orange/10 px-2.5 py-0.5 rounded-full font-semibold">
              Side-by-Side Analysis
            </span>
          </div>

          {/* ① Scenario A vs ② Scenario B */}
          <div className="grid grid-cols-2 gap-3">
            {/* ① Scenario A */}
            <div className="p-3.5 rounded-xl bg-[#E0E5EC] shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-[#6B7280]">
                  Scenario A
                </span>
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#6B7280] text-white text-[10px] font-bold">
                  ①
                </span>
              </div>
              <div className="text-lg sm:text-xl font-mono font-bold text-[#6B7280]">
                5.80% <span className="text-[10px] font-normal">est.</span>
              </div>
              <div className="text-[11px] text-[#6B7280]">
                Single Image · Fri 2:00 PM
              </div>
            </div>

            {/* ② Scenario B */}
            <div className="p-3.5 rounded-xl bg-[#E0E5EC] shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] border border-[#6C63FF]/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-[#6C63FF]">
                  Scenario B
                </span>
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#6C63FF] text-white text-[10px] font-bold">
                  ②
                </span>
              </div>
              <div className="text-lg sm:text-xl font-mono font-bold text-[#0F766E]">
                8.42% <span className="text-[10px] font-normal">est.</span>
              </div>
              <div className="text-[11px] text-[#3D4852] font-semibold">
                Reel Video · Fri 7:30 PM
              </div>
            </div>
          </div>

          {/* ③ Estimated Difference */}
          <div className="p-3 rounded-xl bg-[#E0E5EC] shadow-[inset_4px_4px_8px_rgb(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="text-[#6B7280] text-[10px] uppercase font-bold block">
                Estimated Difference
              </span>
              <div className="font-bold text-[#0F766E] flex items-center gap-1.5 text-xs sm:text-sm">
                <span>Expected Impact:</span>
                <span className="font-mono text-base font-black">+2.62 pp</span>
              </div>
            </div>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#6C63FF] text-white text-[11px] font-bold shadow-sm">
              ③
            </span>
          </div>
        </div>
      ),
    },
  ];

  const totalSlides = slides.length;

  // Autoplay handler: Only runs if isVisible is true, not isHovered, and not prefersReducedMotion
  useEffect(() => {
    if (!isVisible || isHovered || prefersReducedMotion) {
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveSlide((curr) => (curr + 1) % totalSlides);
          return 0;
        }
        return prev + (TICK_INTERVAL / SLIDE_DURATION) * 100;
      });
    }, TICK_INTERVAL);

    return () => clearInterval(interval);
  }, [isVisible, isHovered, prefersReducedMotion, totalSlides]);

  // Manual slide selection
  const goToSlide = (idx: number) => {
    setActiveSlide(idx);
    setProgress(0);
  };

  const nextSlide = () => {
    setActiveSlide((curr) => (curr + 1) % totalSlides);
    setProgress(0);
  };

  const prevSlide = () => {
    setActiveSlide((curr) => (curr - 1 + totalSlides) % totalSlides);
    setProgress(0);
  };

  const current = slides[activeSlide];

  return (
    <section
      id="how-to-use"
      ref={sectionRef}
      className="space-y-4 max-w-7xl mx-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. Header */}
      <div className="space-y-1 text-left">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#6C63FF] uppercase bg-[#E0E5EC] px-2.5 py-1 rounded-full shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] inline-flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            <span>Interactive Product Tour</span>
          </span>
          <span className="text-[10px] text-[#6B7280]">·</span>
          <span className="text-xs font-semibold text-[#6B7280]">Step-by-Step Preview</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#3D4852] tracking-tight">
          How to Use
        </h2>
        <p className="text-xs sm:text-sm text-[#6B7280]">
          Explore TrendSkope step by step.
        </p>
      </div>

      {/* 2. Walkthrough Card */}
      <div className="p-6 sm:p-8 md:p-10 rounded-3xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] border border-transparent space-y-6 sm:space-y-8">
        {/* Step tabs (01 CREATE, 02 ANALYZE, 03 PREDICT, 04 OPTIMIZE) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {slides.map((step, idx) => {
            const isActive = activeSlide === idx;
            return (
              <button
                key={step.num}
                type="button"
                onClick={() => goToSlide(idx)}
                className={`relative overflow-hidden p-3.5 rounded-2xl text-left transition-all duration-300 ${
                  isActive
                    ? "bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)]"
                    : "bg-[#E0E5EC] shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] hover:-translate-y-px"
                }`}
              >
                {/* Active Timer Progress Line */}
                {isActive && isVisible && !isHovered && !prefersReducedMotion && (
                  <div
                    className="absolute bottom-0 left-0 h-1 bg-[#6C63FF] transition-all duration-75 ease-linear rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                )}

                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                      isActive ? "text-[#6C63FF]" : "text-[#6B7280]"
                    }`}
                  >
                    Step {step.num}
                  </span>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-[#6C63FF] animate-pulse" />
                  )}
                </div>

                <div className="text-xs sm:text-sm font-bold text-[#3D4852] truncate">
                  {step.code}
                </div>
              </button>
            );
          })}
        </div>

        {/* Slide Stage: LEFT UI visual, RIGHT short text */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          {/* LEFT: Realistic UI preview */}
          <div className="lg:col-span-7 transition-all duration-300">
            {current.renderUI()}
          </div>

          {/* RIGHT: Short text & Callouts */}
          <div className="lg:col-span-5 space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-[#6C63FF] uppercase tracking-widest block">
                {current.num}
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#3D4852] tracking-tight">
                {current.code}
              </h3>
              <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                {current.tagline}
              </p>
            </div>

            {/* 2–3 Callouts */}
            <div className="p-3.5 rounded-2xl bg-[#E0E5EC] shadow-[inset_4px_4px_8px_rgb(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6B7280] block">
                Screen Elements:
              </span>
              <div className="space-y-1.5">
                {current.callouts.map((c, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#6C63FF] text-white text-[10px] font-bold shrink-0">
                      {c.num}
                    </span>
                    <div className="min-w-0">
                      <strong className="text-[#3D4852] font-semibold mr-1.5">{c.label}:</strong>
                      <span className="text-[#6B7280] text-[11px]">{c.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action CTA & Navigation Buttons */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={current.onCta}
                className="btn-primary text-xs px-4 py-2.5 group inline-flex items-center gap-1.5"
              >
                <span>{current.ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous slide"
                  className="w-8 h-8 rounded-xl bg-[#E0E5EC] shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] active:shadow-[inset_2px_2px_4px_rgb(163,177,198,0.6)] text-[#6B7280] hover:text-[#3D4852] flex items-center justify-center transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next slide"
                  className="w-8 h-8 rounded-xl bg-[#E0E5EC] shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] active:shadow-[inset_2px_2px_4px_rgb(163,177,198,0.6)] text-[#6B7280] hover:text-[#3D4852] flex items-center justify-center transition-all"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Progress & Dots (● ━━━ ○ ━━━ ○ ━━━ ○) */}
        <div className="flex items-center justify-center gap-4 pt-2 border-t border-border/20">
          <span className="text-xs font-mono font-bold text-[#3D4852]">
            {current.num} <span className="text-[#6B7280]">/</span> 04
          </span>

          <div className="flex items-center gap-2">
            {slides.map((_, idx) => {
              const isActive = activeSlide === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className="group flex items-center gap-1.5 focus:outline-none"
                >
                  <span
                    className={`inline-block transition-all duration-300 rounded-full ${
                      isActive
                        ? "w-7 h-2 bg-[#6C63FF] shadow-[0_0_8px_rgba(108,99,255,0.6)]"
                        : "w-2 h-2 bg-[#6B7280]/40 group-hover:bg-[#6B7280]"
                    }`}
                  />
                  {idx < slides.length - 1 && (
                    <span className="w-4 h-0.5 bg-border/40 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
