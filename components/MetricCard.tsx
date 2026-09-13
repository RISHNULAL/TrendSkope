import React from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  isReady?: boolean;
  highlight?: boolean;
}

export default function MetricCard({
  label,
  value,
  subtitle,
  isReady,
  highlight,
}: MetricCardProps) {
  const isReadyValue = isReady || value === "Ready";

  return (
    <div
      className={`glass-card p-5 flex flex-col justify-between min-h-[135px] relative overflow-hidden group ${
        highlight ? "border-primary/50 shadow-[0_0_20px_rgba(255,112,72,0.1)]" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        {isReadyValue && (
          <span className="w-2 h-2 rounded-full bg-ready animate-pulse" />
        )}
      </div>

      <div className="my-2">
        <div
          className={`text-2xl md:text-3xl font-extrabold tracking-tight ${
            isReadyValue
              ? "text-ready"
              : value === "Not Trained"
              ? "text-primary-coral"
              : "text-white"
          }`}
        >
          {value}
        </div>
      </div>

      {subtitle && (
        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{subtitle}</p>
      )}

      {/* Subtle corner accent line */}
      <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-white/5 to-transparent pointer-events-none" />
    </div>
  );
}
