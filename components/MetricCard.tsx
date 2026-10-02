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
      className="glass-card p-5 flex flex-col justify-between min-h-[140px] relative overflow-visible group"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-1.5 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
            {label}
          </span>
          {tooltip && (
            <div className="relative group/tip inline-flex items-center">
              <Info className="w-3.5 h-3.5 text-[#6B7280] hover:text-[#6B7280] cursor-help transition-colors" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/tip:block z-30 w-56 p-2.5 rounded-2xl bg-[#E0E5EC] border border-transparent text-[11px] font-normal leading-normal text-[#6B7280] shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] pointer-events-none">
                {tooltip}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#E0E5EC]" />
              </div>
            </div>
          )}
        </div>

        {badge && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E0E5EC] border border-transparent text-[#6B7280]">
            {badge}
          </span>
        )}

        {isReadyValue && !badge && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#38B2AC] animate-pulse" />
          </span>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="my-1.5">
        <div
          className={`text-2xl md:text-3xl font-extrabold tracking-tight font-sans ${
            isReadyValue
              ? "text-[#0F766E]"
              : value === "Not Trained"
              ? "text-[#BE123C]"
              : "text-[#3D4852]"
          }`}
        >
          {value}
        </div>
      </div>

      {/* Subtitle / Description */}
      {subtitle && (
        <p className="text-xs text-[#6B7280] leading-snug line-clamp-1">{subtitle}</p>
      )}

      {/* Subtle corner accent glow */}
      <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-transparent to-transparent pointer-events-none rounded-tr-[18px]" />
    </div>
  );
}
