import React from "react";
import { Info } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  isReady?: boolean;
  highlight?: boolean;
  tooltip?: string;
  badge?: string;
}

export default function MetricCard({
  label,
  value,
  subtitle,
  isReady,
  highlight,
  tooltip,
  badge,
}: MetricCardProps) {
  const isReadyValue = isReady || value === "Ready";

  return (
    <div
      className={`glass-card p-5 flex flex-col justify-between min-h-[140px] relative overflow-visible group transition-all duration-200 hover:-translate-y-1 hover:border-slate-500/50 hover:shadow-[0_10px_28px_rgba(0,0,0,0.45),0_0_16px_rgba(255,112,72,0.08)] ${
        highlight ? "border-primary/50 shadow-[0_0_20px_rgba(255,112,72,0.12)]" : "border-border/80"
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-1.5 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {label}
          </span>
          {tooltip && (
            <div className="relative group/tip inline-flex items-center">
              <Info className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-help transition-colors" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/tip:block z-30 w-56 p-2.5 rounded-lg bg-[#0c1626] border border-white/10 text-[11px] font-normal leading-normal text-slate-300 shadow-xl pointer-events-none">
                {tooltip}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#0c1626]" />
              </div>
            </div>
          )}
        </div>

        {badge && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
            {badge}
          </span>
        )}

        {isReadyValue && !badge && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </span>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="my-1.5">
        <div
          className={`text-2xl md:text-3xl font-extrabold tracking-tight font-sans ${
            isReadyValue
              ? "text-emerald-400"
              : value === "Not Trained"
              ? "text-rose-400"
              : "text-white"
          }`}
        >
          {value}
        </div>
      </div>

      {/* Subtitle / Description */}
      {subtitle && (
        <p className="text-xs text-slate-400 leading-snug line-clamp-1">{subtitle}</p>
      )}

      {/* Subtle corner accent glow */}
      <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-white/[0.04] to-transparent pointer-events-none rounded-tr-[18px]" />
    </div>
  );
}
