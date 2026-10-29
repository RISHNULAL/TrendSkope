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
      className={`p-5 flex flex-col justify-between min-h-[140px] relative rounded-2xl bg-white border transition-all duration-200 group ${
        highlight
          ? "border-[#6C4DFF]/40 shadow-card hover:border-[#6C4DFF]"
          : "border-[#E7E3F0] shadow-card hover:shadow-card-hover hover:border-[#D9D4E8]"
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-1.5 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono font-bold text-[#68677D] uppercase tracking-wider">
            {label}
          </span>
          {tooltip && (
            <div className="relative group/tip inline-flex items-center">
              <Info className="w-3.5 h-3.5 text-[#68677D] hover:text-[#6C4DFF] cursor-help transition-colors" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/tip:block z-30 w-56 p-2.5 rounded-xl bg-white border border-[#E7E3F0] text-[11px] font-medium leading-relaxed text-[#242137] shadow-dropdown pointer-events-none">
                {tooltip}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-white" />
              </div>
            </div>
          )}
        </div>

        {badge && (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#F0EBFF] border border-[#6C4DFF]/20 text-[#6C4DFF]">
            {badge}
          </span>
        )}

        {isReadyValue && !badge && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#0F9D8A] animate-pulse" />
          </span>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="my-1.5">
        <div
          className={`text-2xl md:text-3xl font-black tracking-tight font-sans ${
            isReadyValue
              ? "text-[#0F9D8A]"
              : value === "Not Trained"
              ? "text-[#F06F73]"
              : "text-[#242137]"
          }`}
        >
          {value}
        </div>
      </div>

      {/* Subtitle / Description */}
      {subtitle && (
        <p className="text-xs text-[#68677D] leading-snug line-clamp-1">{subtitle}</p>
      )}

      {/* Subtle corner accent glow */}
      {highlight && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#6C4DFF]/10 to-transparent pointer-events-none rounded-tr-2xl" />
      )}
    </div>
  );
}
