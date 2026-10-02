"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";

interface LoadingScreenProps {
  onComplete?: () => void;
  durationMs?: number;
}

const BRAND_LETTERS = [
  { char: "T", isAccent: false },
  { char: "r", isAccent: false },
  { char: "e", isAccent: false },
  { char: "n", isAccent: false },
  { char: "d", isAccent: false },
  { char: "S", isAccent: true },
  { char: "k", isAccent: true },
  { char: "o", isAccent: true },
  { char: "p", isAccent: true },
  { char: "e", isAccent: true },
];

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
        backgroundColor: "#050b15",
      }}
    >
      {/* Deep Navy Radial Background Layer */}
      <div
        className="absolute inset-0 pointer-events-none animate-bg-gradient"
        style={{
          background: `
            radial-gradient(circle at 50% 45%, rgba(20, 36, 62, 0.45) 0%, rgba(7, 14, 26, 0.85) 55%, #030712 100%),
            radial-gradient(circle at 50% 45%, rgba(255, 112, 72, 0.04) 0%, transparent 65%)
          `,
        }}
      />

      {/* Faint Precision Analytical Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.25) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.25) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Subtle Corner Vignette */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: "radial-gradient(circle at center, transparent 40%, rgba(2, 6, 12, 0.8) 100%)",
        }}
      />

      {/* Top Spacer for perfect vertical centering */}
      <div className="w-full h-8 opacity-0 pointer-events-none" />

      {/* Main Visual Center Stage */}
      <main className="relative z-10 flex flex-col items-center text-center max-w-md w-full my-auto">
        {/* Logo Container with Analytics Ring */}
        <div className="relative inline-flex items-center justify-center mb-6 sm:mb-8 animate-logo-in">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -inset-10 bg-[radial-gradient(circle,rgba(255,112,72,0.12)_0%,rgba(255,64,95,0.02)_50%,transparent_75%)] blur-2xl rounded-full pointer-events-none animate-subtle-pulse" />

          {/* Thin Analytical Ring Around Logo */}
          <div className="absolute -inset-5 sm:-inset-6 pointer-events-none">
            <svg
              className="w-full h-full animate-ring-spin"
              viewBox="0 0 210 148"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="orbitRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff9438" stopOpacity="0.7" />
                  <stop offset="50%" stopColor="#ff6e40" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#ff405f" stopOpacity="0.6" />
                </linearGradient>
              </defs>

              {/* Analytical data path */}
              <rect
                x="3"
                y="3"
                width="204"
                height="142"
                rx="26"
                stroke="url(#orbitRingGrad)"
                strokeWidth="1.2"
                className="animate-ring-draw"
                strokeLinecap="round"
              />

              {/* Tiny analytical nodes along the ring */}
              <circle cx="28" cy="3" r="2" fill="#ff9438" className="animate-data-node" />
              <circle cx="207" cy="60" r="1.8" fill="#ff6e40" className="animate-data-node" />
              <circle cx="170" cy="145" r="2" fill="#ff405f" className="animate-data-node" />
            </svg>
          </div>

          {/* Clean Glass Logo Container - Original Logo Asset Preserved */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0e1a2d]/85 to-[#07111f]/90 border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.7),0_0_20px_rgba(255,112,72,0.1)] p-3 sm:p-3.5 backdrop-blur-md">
            <Image
              src="/assets/logo.png"
              alt="TrendSkope Logo"
              width={160}
              height={106}
              priority
              className="w-32 sm:w-36 md:w-40 h-auto object-contain block"
            />
          </div>
        </div>

        {/* Brand Name Lockup with Staggered Letter Reveal */}
        <h1 className="text-3xl sm:text-4xl md:text-[2.65rem] font-extrabold tracking-tight text-white mb-2 flex items-center justify-center">
          {BRAND_LETTERS.map((item, index) => (
            <span
              key={index}
              className={`inline-block opacity-0 animate-letter-reveal ${
                item.isAccent ? "gradient-accent" : "text-white"
              }`}
              style={{
                animationDelay: `${index * 45 + 1200}ms`,
              }}
            >
              {item.char}
            </span>
          ))}
        </h1>

        {/* Tagline */}
        <p className="text-xs sm:text-[13px] font-medium tracking-[0.24em] text-slate-400 uppercase opacity-0 animate-tagline-in mb-7 sm:mb-8">
          Understand. Predict. Optimize.
        </p>

        {/* Analytics Progress Indicator */}
        <div className="w-full max-w-[290px] sm:max-w-[340px] flex flex-col opacity-0 animate-progress-in">
          {/* Status Row */}
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="tracking-wide text-[11.5px] sm:text-xs font-medium text-slate-300 transition-colors duration-200">
              {currentStatus}
            </span>
            <span className="font-mono text-[11px] sm:text-xs font-semibold text-slate-400">
              {progress}%
            </span>
          </div>

          {/* Thin Horizontal Progress Line */}
          <div className="w-full h-1 bg-white/[0.08] rounded-full overflow-hidden relative shadow-inner border border-white/[0.04]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#ff9438] via-[#ff6e40] to-[#ff405f] shadow-[0_0_10px_rgba(255,112,72,0.7)] transition-[width] duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Minimalist Micro Engagement Trend Visualization */}
          <div className="mt-5 w-full flex items-center justify-center opacity-70">
            <div className="relative w-44 sm:w-48 h-8 flex items-center justify-center">
              <svg
                className="w-full h-full overflow-visible"
                viewBox="0 0 160 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="microTrendGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ff9438" stopOpacity="0.4" />
                    <stop offset="50%" stopColor="#ff6e40" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#ff405f" stopOpacity="0.9" />
                  </linearGradient>
                  <linearGradient id="microTrendArea" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ff7048" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#ff7048" stopOpacity="0" />
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
                  <circle cx="32" cy="22" r="2" fill="#ff9438" className="animate-data-node" />
                  <circle cx="72" cy="14" r="2.2" fill="#ff6e40" className="animate-data-node" />
                  <circle cx="118" cy="17" r="2" fill="#ff6e40" className="animate-data-node" />
                  <circle cx="154" cy="6" r="2.4" fill="#ff405f" className="animate-data-node" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </main>

      {/* Brand Footer */}
      <footer className="relative z-10 w-full text-center opacity-40 text-[10px] sm:text-[10.5px] text-slate-400 tracking-[0.2em] font-medium uppercase animate-tagline-in">
        AI-Powered Instagram Content Performance Intelligence
      </footer>
    </div>
  );
}
