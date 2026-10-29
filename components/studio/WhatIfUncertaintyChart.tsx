"use client";

import React, { useState } from "react";
import {
  BarChart3,
  Info,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  HelpCircle,
  Layers,
} from "lucide-react";
import { PredictionResultData } from "@/types";

export interface WhatIfUncertaintyChartProps {
  predictionA: PredictionResultData;
  predictionB: PredictionResultData;
  scenarioALabel?: string;
  scenarioBLabel?: string;
  scenarioAFormat?: string;
  scenarioBFormat?: string;
  deltaPp?: number;
  deltaRelativePct?: number | null;
  intervalsOverlap?: boolean;
  overlapExplanation?: string;
}

export default function WhatIfUncertaintyChart({
  predictionA,
  predictionB,
  scenarioALabel = "Scenario A — Original",
  scenarioBLabel = "Scenario B — Alternative",
  scenarioAFormat = "Draft",
  scenarioBFormat = "Variant",
  deltaPp,
  deltaRelativePct,
  intervalsOverlap,
  overlapExplanation,
}: WhatIfUncertaintyChartProps) {
  const [activeHover, setActiveHover] = useState<"A" | "B" | null>(null);

  // 1. Sanitize and validate input values
  const predA = Number.isFinite(predictionA?.prediction) ? predictionA.prediction : 0;
  const rawLowA = Number.isFinite(predictionA?.lower) ? predictionA.lower : predA * 0.7;
  const rawUpA = Number.isFinite(predictionA?.upper) ? predictionA.upper : predA * 1.3;
  const lowA = Math.max(0, Math.min(rawLowA, rawUpA));
  const upA = Math.max(0, Math.max(rawLowA, rawUpA));

  const predB = Number.isFinite(predictionB?.prediction) ? predictionB.prediction : 0;
  const rawLowB = Number.isFinite(predictionB?.lower) ? predictionB.lower : predB * 0.7;
  const rawUpB = Number.isFinite(predictionB?.upper) ? predictionB.upper : predB * 1.3;
  const lowB = Math.max(0, Math.min(rawLowB, rawUpB));
  const upB = Math.max(0, Math.max(rawLowB, rawUpB));

  // 2. Computed statistical deltas
  const computedDeltaPp =
    typeof deltaPp === "number" && Number.isFinite(deltaPp)
      ? deltaPp
      : Number((predB - predA).toFixed(2));

  const computedRelativePct =
    typeof deltaRelativePct === "number" && Number.isFinite(deltaRelativePct)
      ? deltaRelativePct
      : predA > 0.001
      ? Number((((predB - predA) / predA) * 100).toFixed(1))
      : null;

  // 3. Overlap determination
  const hasOverlap =
    typeof intervalsOverlap === "boolean"
      ? intervalsOverlap
      : Math.max(lowA, lowB) <= Math.min(upA, upB);

  // 4. Calculate dynamic, consistent scale domain (0% baseline up to largest upper bound + padding)
  const maxDataVal = Math.max(predA, predB, upA, upB, 1.0);
  const paddedMax = maxDataVal * 1.18; // 18% headroom so end caps and labels never clip

  let domainMax = 25; // sensible default
  if (paddedMax <= 8) {
    domainMax = 10;
  } else if (paddedMax <= 14) {
    domainMax = 15;
  } else if (paddedMax <= 18) {
    domainMax = 20;
  } else if (paddedMax <= 24) {
    domainMax = 25;
  } else if (paddedMax <= 28) {
    domainMax = 30;
  } else if (paddedMax <= 38) {
    domainMax = 40;
  } else if (paddedMax <= 48) {
    domainMax = 50;
  } else {
    domainMax = Math.ceil(paddedMax / 10) * 10;
  }

  // 5. Generate 5-6 clean axis ticks
  const tickCount = 5;
  const tickStep = domainMax / tickCount;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => Number((i * tickStep).toFixed(1)));

  // 6. SVG Geometry layout coordinates
  const svgWidth = 840;
  const svgHeight = 250;
  const marginLeft = 190; // Space for Scenario title & subtext
  const marginRight = 75; // Space for end labels
  const marginTop = 35;
  const marginBottom = 50;
  const chartWidth = svgWidth - marginLeft - marginRight; // 575px

  // Scale function mapping percentage to SVG X coordinate
  const scaleX = (val: number) => {
    const clamped = Math.max(0, Math.min(domainMax, val));
    return marginLeft + (clamped / domainMax) * chartWidth;
  };

  const yA = marginTop + 45; // Scenario A center line
  const yB = marginTop + 115; // Scenario B center line
  const yAxis = svgHeight - marginBottom + 8; // Axis baseline

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E7E3F0] shadow-card space-y-6">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E7E3F0] gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#F0EBFF] border border-[#6C4DFF]/20 flex items-center justify-center text-[#6C4DFF]">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#242137] tracking-tight">
              Model Prediction & Uncertainty Interval Chart
            </h3>
            <p className="text-xs text-[#68677D]">
              Forest-plot comparison of expected follower-normalized engagement rate with 90% empirical error bounds
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="px-2.5 py-1 rounded-lg bg-[#F8F7FC] border border-[#E7E3F0] text-[11px] font-mono text-[#68677D]">
            Shared Domain: 0% → {domainMax}%
          </span>
        </div>
      </div>

      {/* 2. Compact Comparison Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Scenario A Card */}
        <div
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeHover === "A"
              ? "bg-[#F0EBFF]/70 border-[#4B35B5] shadow-sm"
              : "bg-[#F8F7FC] border-[#E7E3F0] hover:border-[#4B35B5]/40"
          }`}
          onMouseEnter={() => setActiveHover("A")}
          onMouseLeave={() => setActiveHover(null)}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-[#4B35B5] flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4B35B5]" />
              Scenario A
            </span>
            <span className="text-[10px] font-mono text-[#68677D] uppercase bg-white border border-[#E7E3F0] px-1.5 py-0.5 rounded">
              {scenarioAFormat}
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-[#242137]">
            {predA.toFixed(2)}%
          </div>
          <div className="text-[11px] font-mono text-[#68677D] mt-0.5">
            90% CI: {lowA.toFixed(2)}% – {upA.toFixed(2)}%
          </div>
        </div>

        {/* Scenario B Card */}
        <div
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeHover === "B"
              ? "bg-[#F0EBFF]/90 border-[#6C4DFF] shadow-sm"
              : "bg-[#F0EBFF]/40 border-[#6C4DFF]/30 hover:border-[#6C4DFF]"
          }`}
          onMouseEnter={() => setActiveHover("B")}
          onMouseLeave={() => setActiveHover(null)}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-[#6C4DFF] flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6C4DFF]" />
              Scenario B
            </span>
            <span className="text-[10px] font-mono text-[#6C4DFF] uppercase bg-white border border-[#6C4DFF]/30 px-1.5 py-0.5 rounded font-semibold">
              {scenarioBFormat}
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-[#6C4DFF]">
            {predB.toFixed(2)}%
          </div>
          <div className="text-[11px] font-mono text-[#68677D] mt-0.5">
            90% CI: {lowB.toFixed(2)}% – {upB.toFixed(2)}%
          </div>
        </div>

        {/* Absolute & Relative Difference */}
        <div className="p-4 rounded-xl bg-white border border-[#E7E3F0] shadow-sm space-y-0.5">
          <span className="text-[10px] font-mono text-[#68677D] uppercase font-bold block">
            Expected Shift (Delta)
          </span>
          <div
            className={`text-2xl font-black font-mono flex items-center gap-1 ${
              computedDeltaPp > 0
                ? "text-[#0F9D8A]"
                : computedDeltaPp < 0
                ? "text-[#F06F73]"
                : "text-[#242137]"
            }`}
          >
            {computedDeltaPp > 0 ? (
              <TrendingUp className="w-5 h-5 text-[#0F9D8A]" />
            ) : computedDeltaPp < 0 ? (
              <TrendingDown className="w-5 h-5 text-[#F06F73]" />
            ) : null}
            <span>
              {computedDeltaPp > 0 ? `+${computedDeltaPp.toFixed(2)}` : computedDeltaPp.toFixed(2)} pp
            </span>
          </div>
          <div className="text-[11px] text-[#68677D]">
            {computedRelativePct !== null ? (
              <span className="font-mono font-medium">
                Relative: {computedRelativePct > 0 ? `+${computedRelativePct}%` : `${computedRelativePct}%`}
              </span>
            ) : (
              <span>Baseline near zero</span>
            )}
          </div>
        </div>

        {/* Interval Separation Status */}
        <div className="p-4 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0] space-y-1">
          <span className="text-[10px] font-mono text-[#68677D] uppercase font-bold block">
            Interval Overlap (90% CI)
          </span>
          <div>
            {hasOverlap ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#E9A23B]/10 border border-[#E9A23B]/30 text-[#E9A23B]">
                <AlertTriangle className="w-3.5 h-3.5 text-[#E9A23B]" />
                Overlapping Intervals
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#0F9D8A]/10 border border-[#0F9D8A]/30 text-[#0F9D8A]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0F9D8A]" />
                Distinct Intervals
              </span>
            )}
          </div>
          <p className="text-[10.5px] text-[#68677D] leading-tight">
            {hasOverlap
              ? "High variance; outcome difference is uncertain"
              : "Clear statistical separation under trained model"}
          </p>
        </div>
      </div>

      {/* 3. Forest-Plot Statistical Visualization (SVG) */}
      <div className="relative w-full overflow-hidden rounded-xl bg-[#F8F7FC] border border-[#E7E3F0] p-2 sm:p-4">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Shaded hover filter */}
            <filter id="markerGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#6C4DFF" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Background gridlines for ticks */}
          {ticks.map((tick) => {
            const x = scaleX(tick);
            return (
              <g key={tick}>
                <line
                  x1={x}
                  y1={marginTop}
                  x2={x}
                  y2={yAxis}
                  stroke={tick === 0 ? "#8E8DA8" : "#E7E3F0"}
                  strokeWidth={tick === 0 ? "1.5" : "1"}
                  strokeDasharray={tick === 0 ? undefined : "4 4"}
                />
              </g>
            );
          })}

          {/* Row A: Background subtle guide track */}
          <line
            x1={marginLeft}
            y1={yA}
            x2={marginLeft + chartWidth}
            y2={yA}
            stroke="#E7E3F0"
            strokeWidth="1"
          />

          {/* Row B: Background subtle guide track */}
          <line
            x1={marginLeft}
            y1={yB}
            x2={marginLeft + chartWidth}
            y2={yB}
            stroke="#E7E3F0"
            strokeWidth="1"
          />

          {/* ==================== SCENARIO A ==================== */}
          <g
            className="cursor-pointer transition-opacity duration-200"
            opacity={activeHover === "B" ? 0.45 : 1}
            onMouseEnter={() => setActiveHover("A")}
            onMouseLeave={() => setActiveHover(null)}
          >
            {/* Left Descriptor */}
            <text x={10} y={yA - 6} fill="#242137" fontSize="12" fontWeight="700" fontFamily="sans-serif">
              Scenario A
            </text>
            <text x={10} y={yA + 11} fill="#68677D" fontSize="10" fontFamily="monospace">
              {scenarioAFormat} · CI: {lowA.toFixed(1)}%–{upA.toFixed(1)}%
            </text>

            {/* Shaded interval span background */}
            <rect
              x={scaleX(lowA)}
              y={yA - 11}
              width={Math.max(4, scaleX(upA) - scaleX(lowA))}
              height={22}
              rx={6}
              fill="rgba(75, 53, 181, 0.08)"
            />

            {/* Horizontal 90% Uncertainty Interval Line */}
            <line
              x1={scaleX(lowA)}
              y1={yA}
              x2={scaleX(upA)}
              y2={yA}
              stroke="#4B35B5"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Lower Bound End Cap (T-bar) */}
            <line
              x1={scaleX(lowA)}
              y1={yA - 7}
              x2={scaleX(lowA)}
              y2={yA + 7}
              stroke="#4B35B5"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Lower Bound Number */}
            <text
              x={scaleX(lowA)}
              y={yA + 21}
              fill="#68677D"
              fontSize="9.5"
              fontFamily="monospace"
              textAnchor="middle"
            >
              {lowA.toFixed(1)}%
            </text>

            {/* Upper Bound End Cap (T-bar) */}
            <line
              x1={scaleX(upA)}
              y1={yA - 7}
              x2={scaleX(upA)}
              y2={yA + 7}
              stroke="#4B35B5"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Upper Bound Number */}
            <text
              x={scaleX(upA)}
              y={yA + 21}
              fill="#68677D"
              fontSize="9.5"
              fontFamily="monospace"
              textAnchor="middle"
            >
              {upA.toFixed(1)}%
            </text>

            {/* Point Estimate Marker */}
            <circle
              cx={scaleX(predA)}
              cy={yA}
              r={activeHover === "A" ? 8 : 6.5}
              fill="#4B35B5"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              filter="url(#markerGlow)"
              className="transition-all duration-150"
            />

            {/* Value Callout on Point */}
            <text
              x={scaleX(predA)}
              y={yA - 13}
              fill="#242137"
              fontSize="11"
              fontWeight="800"
              fontFamily="monospace"
              textAnchor="middle"
            >
              {predA.toFixed(2)}%
            </text>

            {/* Right Summary Label */}
            <text
              x={svgWidth - 10}
              y={yA + 4}
              fill="#242137"
              fontSize="13"
              fontWeight="800"
              fontFamily="monospace"
              textAnchor="end"
            >
              {predA.toFixed(2)}%
            </text>
          </g>

          {/* ==================== SCENARIO B ==================== */}
          <g
            className="cursor-pointer transition-opacity duration-200"
            opacity={activeHover === "A" ? 0.45 : 1}
            onMouseEnter={() => setActiveHover("B")}
            onMouseLeave={() => setActiveHover(null)}
          >
            {/* Left Descriptor */}
            <text x={10} y={yB - 6} fill="#6C4DFF" fontSize="12" fontWeight="700" fontFamily="sans-serif">
              Scenario B
            </text>
            <text x={10} y={yB + 11} fill="#68677D" fontSize="10" fontFamily="monospace">
              {scenarioBFormat} · CI: {lowB.toFixed(1)}%–{upB.toFixed(1)}%
            </text>

            {/* Shaded interval span background */}
            <rect
              x={scaleX(lowB)}
              y={yB - 11}
              width={Math.max(4, scaleX(upB) - scaleX(lowB))}
              height={22}
              rx={6}
              fill="rgba(108, 77, 255, 0.12)"
            />

            {/* Horizontal 90% Uncertainty Interval Line */}
            <line
              x1={scaleX(lowB)}
              y1={yB}
              x2={scaleX(upB)}
              y2={yB}
              stroke="#6C4DFF"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Lower Bound End Cap (T-bar) */}
            <line
              x1={scaleX(lowB)}
              y1={yB - 7}
              x2={scaleX(lowB)}
              y2={yB + 7}
              stroke="#6C4DFF"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Lower Bound Number */}
            <text
              x={scaleX(lowB)}
              y={yB + 21}
              fill="#68677D"
              fontSize="9.5"
              fontFamily="monospace"
              textAnchor="middle"
            >
              {lowB.toFixed(1)}%
            </text>

            {/* Upper Bound End Cap (T-bar) */}
            <line
              x1={scaleX(upB)}
              y1={yB - 7}
              x2={scaleX(upB)}
              y2={yB + 7}
              stroke="#6C4DFF"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Upper Bound Number */}
            <text
              x={scaleX(upB)}
              y={yB + 21}
              fill="#68677D"
              fontSize="9.5"
              fontFamily="monospace"
              textAnchor="middle"
            >
              {upB.toFixed(1)}%
            </text>

            {/* Point Estimate Marker */}
            <circle
              cx={scaleX(predB)}
              cy={yB}
              r={activeHover === "B" ? 8 : 6.5}
              fill="#6C4DFF"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              filter="url(#markerGlow)"
              className="transition-all duration-150"
            />

            {/* Value Callout on Point */}
            <text
              x={scaleX(predB)}
              y={yB - 13}
              fill="#6C4DFF"
              fontSize="11"
              fontWeight="800"
              fontFamily="monospace"
              textAnchor="middle"
            >
              {predB.toFixed(2)}%
            </text>

            {/* Right Summary Label */}
            <text
              x={svgWidth - 10}
              y={yB + 4}
              fill="#6C4DFF"
              fontSize="13"
              fontWeight="800"
              fontFamily="monospace"
              textAnchor="end"
            >
              {predB.toFixed(2)}%
            </text>
          </g>

          {/* ==================== AXIS & TICKS ==================== */}
          {/* Axis Baseline */}
          <line
            x1={marginLeft}
            y1={yAxis}
            x2={marginLeft + chartWidth}
            y2={yAxis}
            stroke="#8E8DA8"
            strokeWidth="1.5"
          />

          {/* Axis Tick Marks and Labels */}
          {ticks.map((tick) => {
            const x = scaleX(tick);
            return (
              <g key={`tick-${tick}`}>
                <line x1={x} y1={yAxis} x2={x} y2={yAxis + 5} stroke="#8E8DA8" strokeWidth="1.5" />
                <text
                  x={x}
                  y={yAxis + 18}
                  fill="#68677D"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {tick}%
                </text>
              </g>
            );
          })}

          {/* Axis Label */}
          <text
            x={marginLeft + chartWidth / 2}
            y={svgHeight - 6}
            fill="#68677D"
            fontSize="10"
            fontFamily="sans-serif"
            fontWeight="600"
            textAnchor="middle"
            letterSpacing="0.05em"
          >
            ENGAGEMENT RATE (%) — 0% BASELINE TO {domainMax}% SHARED DOMAIN
          </text>
        </svg>
      </div>

      {/* 4. Chart Legend & Methodology Explanation */}
      <div className="flex flex-wrap items-center justify-between text-xs text-[#68677D] pt-1 gap-3 border-t border-[#E7E3F0]">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#4B35B5] inline-block border-2 border-white shadow-sm" />
            <span className="font-semibold text-[#242137]">Scenario A Prediction</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#6C4DFF] inline-block border-2 border-white shadow-sm" />
            <span className="font-semibold text-[#6C4DFF]">Scenario B Prediction</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-0.5 bg-[#6C4DFF]" />
            <span>90% Empirical Uncertainty Interval</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-3 border-x-2 border-[#6C4DFF]" />
            <span>Lower & Upper Bounds</span>
          </div>
        </div>

        <span className="text-[11px] font-mono text-[#8E8DA8]">
          Residuals from validation split
        </span>
      </div>

      {/* 5. Statistical Guidance & Overlap Interpretation Panel */}
      <div className="p-4 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0] text-xs text-[#68677D] flex items-start gap-3">
        <Info className="w-4 h-4 text-[#6C4DFF] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-[#242137] block font-bold text-xs uppercase tracking-wider">
            Uncertainty Interval Interpretation & Decision Guidance
          </strong>
          <p className="leading-relaxed">
            {overlapExplanation ||
              (hasOverlap
                ? `The 90% empirical uncertainty intervals for Scenario A (${lowA.toFixed(1)}%–${upA.toFixed(1)}%) and Scenario B (${lowB.toFixed(1)}%–${upB.toFixed(1)}%) overlap. While Scenario B exhibits a ${Math.abs(computedDeltaPp).toFixed(2)} pp difference in point estimate, historical outcome variance encompasses both values. This shift should not be interpreted as a guaranteed increase or statistically definitive outcome.`
                : `The 90% uncertainty intervals for Scenario A (${lowA.toFixed(1)}%–${upA.toFixed(1)}%) and Scenario B (${lowB.toFixed(1)}%–${upB.toFixed(1)}%) do not overlap, demonstrating a clear separation in expected engagement rate under historical validation data.`)}
          </p>
          <p className="text-[11px] text-[#8E8DA8] pt-1">
            * Note: Uncertainty intervals describe expected outcome variance around the model point estimate. Overlap represents model uncertainty rather than a formal hypothesis-testing significance threshold.
          </p>
        </div>
      </div>
    </div>
  );
}
