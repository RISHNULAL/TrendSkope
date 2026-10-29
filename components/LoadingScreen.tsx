"use client";

import React, { useEffect, useState, useMemo } from "react";
import BrandLockup from "@/components/BrandLockup";

interface LoadingScreenProps {
  onComplete?: () => void;
  durationMs?: number;
}

export default function LoadingScreen({
  onComplete,
  durationMs = 2600,
}: LoadingScreenProps) {
  const [fadingOut, setFadingOut] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Disable body scroll while loading screen is active
    document.body.style.overflow = "hidden";

    // Check for reduced motion preference
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setProgress(100);
      const timer = setTimeout(() => {
        setFadingOut(true);
        setTimeout(() => {
          setHidden(true);
          document.body.style.overflow = "";
          onComplete?.();
        }, 300);
      }, Math.min(durationMs, 800));
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "";
      };
    }

    const startTime = performance.now();
    let animationFrameId: number;

    const updateProgress = (now: number) => {
      const elapsed = now - startTime;
      // Progress finishes at durationMs - 350ms to allow smooth "Ready" settle
      const activeDuration = Math.max(durationMs - 350, 600);
      const rawRatio = Math.min(elapsed / activeDuration, 1);
      
      // Smooth cubic ease-out progression
      const easeProgress = 1 - Math.pow(1 - rawRatio, 2.8);
      const currentProgress = Math.min(Math.round(easeProgress * 100), 100);
      
      setProgress(currentProgress);

      if (rawRatio < 1) {
        animationFrameId = requestAnimationFrame(updateProgress);
      }
    };

    animationFrameId = requestAnimationFrame(updateProgress);

    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, durationMs);

    const hideTimer = setTimeout(() => {
      setHidden(true);
      document.body.style.overflow = "";
      if (onComplete) onComplete();
    }, durationMs + 500);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
      document.body.style.overflow = "";
    };
  }, [durationMs, onComplete]);

  // Natural status progression
  const currentStatus = useMemo(() => {
    if (progress < 18) return "Initializing TrendSkope...";
    if (progress < 40) return "Loading intelligence engine...";
    if (progress < 64) return "Preparing analytics...";
    if (progress < 82) return "Loading prediction model...";
    if (progress < 96) return "Preparing insights...";
    if (progress < 100) return "Almost ready...";
    return "Ready";
  }, [progress]);

  if (hidden) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-[9999] w-screen h-screen flex flex-col items-center justify-between p-6 sm:p-8 md:p-12 select-none overflow-hidden transition-all duration-500 ease-out ${
        fadingOut ? "opacity-0 scale-[0.99] pointer-events-none" : "opacity-100 scale-100"
      }`}
      style={{
        backgroundColor: "#F8F7FC",
      }}
    >
      {/* Light Lavender Ambient Radial Layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 18% 8%, rgba(240,235,255,0.85) 0%, transparent 45%),
            radial-gradient(circle at 88% 92%, rgba(240,235,255,0.7) 0%, transparent 45%),
            #F8F7FC
          `,
        }}
      />

      {/* Subtle Analytical Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #6C4DFF 1px, transparent 1px),
            linear-gradient(to bottom, #6C4DFF 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Top Spacer for vertical centering */}
      <div className="w-full h-8 opacity-0 pointer-events-none" />

      {/* Main Visual Center Stage */}
      <main className="relative z-10 flex flex-col items-center text-center max-w-md w-full my-auto">
        {/* Logo Container with SaaS Glow Ring */}
        <div className="relative mb-5 sm:mb-6">
          <div className="absolute left-1/2 top-6 -translate-x-1/2 w-40 h-40 sm:w-48 sm:h-48 rounded-full pointer-events-none bg-[#F0EBFF] blur-2xl opacity-70" />
          <div className="relative">
            <BrandLockup animated variant="splash" />
          </div>
        </div>

        {/* Tagline */}
        <p className="text-xs sm:text-[13px] font-semibold tracking-[0.24em] text-[#68677D] uppercase opacity-0 animate-tagline-in mb-7 sm:mb-8">
          Understand. Predict. Optimize.
        </p>

        {/* Analytics Progress Indicator */}
        <div className="w-full max-w-[290px] sm:max-w-[340px] flex flex-col opacity-0 animate-progress-in">
          {/* Status Row */}
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="tracking-wide text-[11.5px] sm:text-xs font-semibold text-[#242137] transition-colors duration-200">
              {currentStatus}
            </span>
            <span className="font-mono text-[11px] sm:text-xs font-bold text-[#6C4DFF]">
              {progress}%
            </span>
          </div>

          {/* Thin Horizontal Progress Line */}
          <div className="w-full h-2.5 bg-[#E7E3F0] rounded-full overflow-hidden relative shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#6C4DFF] via-[#4B35B5] to-[#6C4DFF] shadow-sm shadow-[#6C4DFF]/30 transition-[width] duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Minimalist Micro Engagement Trend Visualization */}
          <div className="mt-5 w-full flex items-center justify-center opacity-85">
            <div className="relative w-44 sm:w-48 h-8 flex items-center justify-center">
              <svg
                className="w-full h-full overflow-visible"
                viewBox="0 0 160 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="microTrendGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6C63FF" stopOpacity="0.4" />
                    <stop offset="50%" stopColor="#8B84FF" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#6C63FF" stopOpacity="0.9" />
                  </linearGradient>
                  <linearGradient id="microTrendArea" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#6C63FF" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#6C63FF" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Ambient Area Under Trend */}
                <path
                  d="M 6,24 C 30,22 50,26 72,14 C 95,1 120,18 154,6 L 154,30 L 6,30 Z"
                  fill="url(#microTrendArea)"
                />

                {/* Subtle Trend Curve */}
                <path
                  d="M 6,24 C 30,22 50,26 72,14 C 95,1 120,18 154,6"
                  stroke="url(#microTrendGrad)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="animate-sparkline"
                />

                {/* 3-4 Minimal Data Points */}
                <g className="opacity-80">
                  <circle cx="32" cy="22" r="2" fill="#6C63FF" className="animate-data-node" />
                  <circle cx="72" cy="14" r="2.2" fill="#8B84FF" className="animate-data-node" />
                  <circle cx="118" cy="17" r="2" fill="#8B84FF" className="animate-data-node" />
                  <circle cx="154" cy="6" r="2.4" fill="#6C63FF" className="animate-data-node" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </main>

      {/* Brand Footer */}
      <footer className="relative z-10 w-full text-center opacity-70 text-[10px] sm:text-[10.5px] text-[#68677D] tracking-[0.2em] font-medium uppercase animate-tagline-in">
        AI-Powered Instagram Content Performance Intelligence
      </footer>
    </div>
  );
}
