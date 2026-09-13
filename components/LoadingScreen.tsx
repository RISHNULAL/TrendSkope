"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface LoadingScreenProps {
  onComplete?: () => void;
  durationMs?: number;
}

export default function LoadingScreen({
  onComplete,
  durationMs = 1400,
}: LoadingScreenProps) {
  const [fadingOut, setFadingOut] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, durationMs);

    const hideTimer = setTimeout(() => {
      setHidden(true);
      if (onComplete) onComplete();
    }, durationMs + 450);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [durationMs, onComplete]);

  if (hidden) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_50%_45%,#0b1020_0%,#08111f_50%,#050912_100%)] transition-opacity duration-500 ease-out ${
        fadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Ambient background glow */}
      <div className="absolute w-[460px] h-[460px] rounded-full bg-[radial-gradient(circle,rgba(255,112,72,0.08)_0%,rgba(255,64,95,0.02)_45%,transparent_70%)] blur-[50px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full">
        {/* Logo with glow wrapper */}
        <div className="relative inline-flex items-center justify-center mb-5 animate-fade-in">
          <div className="absolute -inset-3 bg-[radial-gradient(circle,rgba(255,120,60,0.22)_0%,rgba(255,64,95,0.07)_55%,transparent_75%)] blur-lg rounded-2xl pointer-events-none" />
          <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-[0_14px_34px_rgba(0,0,0,0.6),0_0_24px_rgba(255,112,72,0.18)]">
            <Image
              src="/assets/logo.png"
              alt="TrendSkope Logo"
              width={160}
              height={106}
              priority
              className="w-36 md:w-44 h-auto object-contain block"
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6">
          Trend<span className="gradient-accent">Skope</span>
        </h1>

        {/* Loading Bar & Status */}
        <div className="flex flex-col items-center w-full">
          <div className="w-64 md:w-72 h-1 bg-white/10 rounded-full overflow-hidden relative shadow-inner mb-3">
            <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-transparent via-[#ff9438] to-[#ff405f] shadow-[0_0_12px_rgba(255,112,72,0.8)] animate-slide-bar" />
          </div>
          <p className="text-xs font-medium text-slate-400 tracking-wider uppercase">
            Loading...
          </p>
        </div>
      </div>
    </div>
  );
}
