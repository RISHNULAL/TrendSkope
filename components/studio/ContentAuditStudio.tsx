"use client";

import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  Copy,
  Check,
  Eye,
  Sliders,
  TrendingUp,
  Layers,
  Image as ImageIcon,
  Video,
  FileText,
  ShieldCheck,
  ArrowRight,
  Maximize2,
  Palette,
  Type,
  Layout,
  Sun,
  Contrast,
  CheckSquare,
  Square,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  AnalyzeContentResponse,
  AuditStudioData,
  CaptionAlternativeOption,
  DrawbackItem,
  ImprovementChecklistItem,
  PublishingChecklistItem,
} from "@/types";

interface ContentAuditStudioProps {
  report: AnalyzeContentResponse;
  mediaPreviewUrl?: string | null;
  onApplyCaption?: (text: string) => void;
}

export default function ContentAuditStudio({
  report,
  mediaPreviewUrl,
  onApplyCaption,
}: ContentAuditStudioProps) {
  const studio: AuditStudioData | undefined = report.audit_studio;
  const overall = studio?.overall_quality;
  const imageAudit = studio?.image_audit;
  const captionAudit = studio?.caption_audit;
  const captionStudio = studio?.caption_studio;
  const drawbacks = studio?.drawbacks || [];
  const checklist = studio?.improvement_checklist || [];
  const publishingChecklist = studio?.publishing_checklist;
  const visualSpec = studio?.before_after_comparison?.visual_specification;
  const segregatedPred = studio?.segregated_engagement_prediction;

  // Interactive UI State
  const [activeChecklistFilter, setActiveChecklistFilter] = useState<string>("all");
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [copiedAltId, setCopiedAltId] = useState<string | null>(null);
  const [selectedAltForCompare, setSelectedAltForCompare] = useState<string>("option-b-professional");
  const [expandedDrawbackId, setExpandedDrawbackId] = useState<string | null>(null);

  // Toggle checklist item completion
  const toggleTaskCompletion = (taskId: string) => {
    setCompletedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  // Copy to clipboard handler
  const handleCopy = (altId: string, text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedAltId(altId);
      setTimeout(() => setCopiedAltId(null), 2400);
    }
  };

  if (!studio) {
    return (
      <div className="p-6 rounded-3xl bg-[#0D131F] border border-slate-800 text-slate-300 text-sm">
        Content Audit Studio data is loading or standard analysis is active.
      </div>
    );
  }

  // Filter recommendations
  const filteredRecommendations = checklist.filter((item) => {
    if (activeChecklistFilter === "all") return true;
    if (activeChecklistFilter === "high") return item.priority === "Critical" || item.priority === "High";
    if (activeChecklistFilter === "visual") return item.filter_tag === "visual";
    if (activeChecklistFilter === "caption") return item.filter_tag === "caption";
    if (activeChecklistFilter === "accessibility") return item.filter_tag === "accessibility";
    return true;
  });

  const completionPct = checklist.length > 0
    ? Math.round((completedTasks.size / checklist.length) * 100)
    : 100;

  // Selected alternative for before-after
  const activeAlternative = captionStudio?.alternatives.find(
    (a) => a.id === selectedAltForCompare
  ) || captionStudio?.alternatives[1] || captionStudio?.alternatives[0];

  // Presentation band color helper
  const getScoreColor = (score: number) => {
    if (score >= 90) return { stroke: "#10B981", text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" };
    if (score >= 80) return { stroke: "#0EA5E9", text: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/30" };
    if (score >= 70) return { stroke: "#F59E0B", text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" };
    if (score >= 60) return { stroke: "#FF6B4A", text: "text-[#FF6B4A]", bg: "bg-[#FF6B4A]/10", border: "border-[#FF6B4A]/30" };
    return { stroke: "#EF4444", text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30" };
  };

  const overallColors = overall ? getScoreColor(overall.score) : getScoreColor(75);

  // SVG Gauge calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = overall
    ? circumference - (overall.score / 100) * circumference
    : circumference * 0.25;

  return (
    <div className="space-y-8 text-slate-200">
      {/* =========================================================================
          STUDIO HEADER BAR
          ========================================================================= */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#0D131F] border border-slate-800/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#FF6B4A]/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6B4A]/15 border border-[#FF6B4A]/30 text-[#FF6B4A] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Audit Studio Active
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-mono font-medium">
                {report.input?.media_type?.toUpperCase() || "IMAGE"} POST
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-400 text-xs font-mono">
                {report.input?.category || "General"}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              AI Content Audit, Scoring & Improvement Studio
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Evidence-based evaluation of visual composition, text legibility, copywriting structure,
              and pre-flight publishing compliance.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                Analysis Engine
              </span>
              <span className="text-xs font-bold text-slate-200">
                Multimodal CV + NLP
              </span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#FF6B4A]/10 border border-[#FF6B4A]/30 flex items-center justify-center text-[#FF6B4A]">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 1: OVERALL CONTENT QUALITY SCORE GAUGE
          ========================================================================= */}
      {overall && (
        <div className="p-7 sm:p-8 rounded-3xl bg-[#0D131F] border border-slate-800/80 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Circular Score Gauge */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-3">
                Overall Content Quality
              </span>

              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                  {/* Track Circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="#1E293B"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  {/* Indicator Arc */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke={overallColors.stroke}
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    style={{ transition: "stroke-dashoffset 1s ease-out" }}
                  />
                </svg>

                {/* Inner Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                    {overall.score}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-400 mt-0.5">
                    / {overall.max_score}
                  </span>
                </div>
              </div>

              {/* Presentation Band Pill */}
              <div className="mt-4 space-y-1.5">
                <span
                  className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold border ${overallColors.bg} ${overallColors.text} ${overallColors.border}`}
                >
                  {overall.band}
                </span>
                <p className="text-xs text-slate-300 font-medium max-w-xs mx-auto leading-snug">
                  {overall.verdict}
                </p>
              </div>
            </div>

            {/* Right: Breakdown of Contributing Criteria */}
            <div className="lg:col-span-7 space-y-4 border-t lg:border-t-0 lg:border-l border-slate-800/80 pt-6 lg:pt-0 lg:pl-8">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Contributing Quality Pillars</span>
                  <span className="text-[10px] font-mono text-slate-500 font-normal">
                    Normalized Weighting
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Derived strictly from applicable evaluated categories. Engagement prediction is excluded from content craft score.
                </p>
              </div>

              <div className="space-y-3">
                {overall.contributing_categories.map((cat, idx) => {
                  const catColor = getScoreColor(cat.score);
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">
                          {cat.name}
                        </span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-[11px] text-slate-400">
                            Weight: {Math.round(cat.weight * 100)}%
                          </span>
                          <span className={`font-bold ${catColor.text}`}>
                            {cat.score} / 100
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-slate-800/90 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${cat.score}%`,
                            backgroundColor: catColor.stroke,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Calibrated Bands Guide */}
              <div className="pt-2 text-[10.5px] font-mono text-slate-400 grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-center">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  90–100: Excellent
                </div>
                <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
                  80–89: Very Good
                </div>
                <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  70–79: Good
                </div>
                <div className="p-1.5 rounded-lg bg-[#FF6B4A]/10 border border-[#FF6B4A]/20 text-[#FF6B4A]">
                  60–69: Review
                </div>
                <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  &lt;60: Significant
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 2: IMAGE & POSTER QUALITY AUDIT
          ========================================================================= */}
      {imageAudit && imageAudit.evaluated && (
        <div className="p-7 sm:p-8 rounded-3xl bg-[#0D131F] border border-slate-800/80 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF6B4A] to-amber-500 flex items-center justify-center text-white">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Image & Poster Quality Audit
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Photometric diagnostics, resolution suitability, edge sharpness, and visual hierarchy.
              </p>
            </div>

            {imageAudit.overall_score !== null && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">
                    Image Quality Rating
                  </span>
                  <span className="text-lg font-black text-white font-mono">
                    {imageAudit.overall_score} / 100
                  </span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${getScoreColor(imageAudit.overall_score).bg} ${getScoreColor(imageAudit.overall_score).text} ${getScoreColor(imageAudit.overall_score).border}`}
                >
                  {imageAudit.overall_score >= 80 ? "High Quality" : "Needs Refinement"}
                </span>
              </div>
            )}
          </div>

          {/* Media Preview + Dominant Palette Strip */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {mediaPreviewUrl && (
              <div className="md:col-span-4 space-y-3">
                <div className="rounded-2xl border border-slate-800 bg-[#070A10] p-2 overflow-hidden shadow-inner flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mediaPreviewUrl}
                    alt="Uploaded media audit preview"
                    className="max-h-64 rounded-xl object-contain"
                  />
                </div>
                <div className="text-[11px] font-mono text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Framing:</span>
                    <strong className="text-slate-200">
                      {report.media_analysis?.dimensions?.aspect_ratio || "Detected"}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Resolution:</span>
                    <strong className="text-slate-200">
                      {report.media_analysis?.dimensions?.width || 1080} × {report.media_analysis?.dimensions?.height || 1350}px
                    </strong>
                  </div>
                </div>

                {/* Dominant Palette Swatches */}
                {report.media_analysis?.visual_metrics?.dominant_colors && (
                  <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                      Color Palette Harmony
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {report.media_analysis.visual_metrics.dominant_colors.map((c, cIdx) => (
                        <div
                          key={cIdx}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60"
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span className="text-[10px] font-mono text-slate-200">{c.hex}</span>
                          <span className="text-[9px] font-mono text-slate-400">({c.percentage}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 8 Categories Grid */}
            <div className={mediaPreviewUrl ? "md:col-span-8 space-y-3" : "md:col-span-12 space-y-3"}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {imageAudit.categories.map((cat, idx) => {
                  const catColor = getScoreColor(cat.score);
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/90 hover:border-slate-700 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">
                          {cat.category}
                        </span>
                        <div className="flex items-center gap-2 font-mono">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${catColor.bg} ${catColor.text} ${catColor.border}`}
                          >
                            {cat.status}
                          </span>
                          <span className={`text-xs font-bold ${catColor.text}`}>
                            {cat.score}/100
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 font-medium leading-snug">
                        {cat.explanation}
                      </p>

                      <div className="text-[11px] font-mono text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60 leading-tight">
                        <strong className="text-slate-300">Evidence:</strong> {cat.evidence}
                      </div>

                      <div className="text-[11px] text-slate-300 flex items-start gap-1.5 leading-snug pt-0.5">
                        <ArrowRight className="w-3.5 h-3.5 text-[#FF6B4A] shrink-0 mt-0.5" />
                        <span>{cat.recommendation}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 3: CAPTION & HASHTAG AUDIT + CAPTION IMPROVEMENT STUDIO
          ========================================================================= */}
      {captionAudit && captionAudit.evaluated && (
        <div className="p-7 sm:p-8 rounded-3xl bg-[#0D131F] border border-slate-800/80 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-[#FF6B4A] flex items-center justify-center text-white">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Caption & Hashtag Quality Audit
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Linguistic structure, opening hook clarity, call-to-action placement, and discoverability.
              </p>
            </div>

            {captionAudit.overall_score !== null && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">
                    Caption Score
                  </span>
                  <span className="text-lg font-black text-white font-mono">
                    {captionAudit.overall_score} / 100
                  </span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${getScoreColor(captionAudit.overall_score).bg} ${getScoreColor(captionAudit.overall_score).text} ${getScoreColor(captionAudit.overall_score).border}`}
                >
                  {captionAudit.overall_score >= 80 ? "Well Structured" : "Refinement Needed"}
                </span>
              </div>
            )}
          </div>

          {/* Caption Categories Evaluation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {captionAudit.categories.map((cat, idx) => {
              const catColor = getScoreColor(cat.score);
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate pr-1">
                      {cat.category}
                    </span>
                    <span className={`text-xs font-bold font-mono ${catColor.text}`}>
                      {cat.score}
                    </span>
                  </div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${catColor.bg} ${catColor.text} ${catColor.border}`}
                  >
                    {cat.status}
                  </span>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    {cat.explanation}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Hashtags Analysis */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span>Hashtag Allocation:</span>
                <span className="font-mono text-amber-400">{captionAudit.hashtag_analysis.count} tags</span>
                <span className="text-[10px] text-slate-400">({captionAudit.hashtag_analysis.density_label})</span>
              </span>
              <p className="text-slate-400">
                {captionAudit.hashtag_analysis.recommendation}
              </p>
            </div>
            {captionAudit.hashtag_analysis.detected.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {captionAudit.hashtag_analysis.detected.slice(0, 6).map((ht, hIdx) => (
                  <span key={hIdx} className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700/80 font-mono text-[10.5px] text-slate-300">
                    {ht}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* CAPTION IMPROVEMENT STUDIO: 3 PRACTICAL ALTERNATIVES */}
          {captionStudio && captionStudio.alternatives.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-t border-slate-800 pt-5">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FF6B4A]" />
                    Caption Improvement Studio (3 Practical Alternatives)
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Preserves all factual dates, prices, and names. Choose the best tone for your objective.
                  </p>
                </div>
                {captionStudio.preserved_entities && (
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 hidden md:inline-block">
                    ✓ Factual Details Protected
                  </span>
                )}
              </div>

              {/* 3 Alternatives Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {captionStudio.alternatives.map((alt) => {
                  const isCopied = copiedAltId === alt.id;
                  const isOptionA = alt.id.includes("minimal");
                  const isOptionB = alt.id.includes("professional");

                  return (
                    <div
                      key={alt.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                        isOptionB
                          ? "bg-slate-900/90 border-[#FF6B4A]/50 shadow-lg shadow-[#FF6B4A]/5"
                          : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                              isOptionB
                                ? "bg-[#FF6B4A]/15 text-[#FF6B4A] border-[#FF6B4A]/30"
                                : isOptionA
                                ? "bg-sky-500/15 text-sky-400 border-sky-500/30"
                                : "bg-purple-500/15 text-purple-400 border-purple-500/30"
                            }`}
                          >
                            {alt.title}
                          </span>
                          <span className="text-[10.5px] font-mono text-slate-400">
                            {alt.word_count} words
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 leading-snug">
                          {alt.subtitle}
                        </p>

                        {/* Caption Text Box */}
                        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 text-xs text-slate-200 font-sans whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto">
                          {alt.text}
                        </div>

                        {/* Key Improvements */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                            Key Refinements:
                          </span>
                          <ul className="text-[11px] text-slate-300 space-y-0.5">
                            {alt.key_changes.map((ch, cIdx) => (
                              <li key={cIdx} className="flex items-start gap-1.5">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{ch}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopy(alt.id, alt.text)}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                            isCopied
                              ? "bg-emerald-500 text-white border-emerald-400"
                              : "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy Caption
                            </>
                          )}
                        </button>

                        {onApplyCaption && (
                          <button
                            type="button"
                            onClick={() => onApplyCaption(alt.text)}
                            className="py-2 px-3 rounded-xl text-xs font-bold bg-[#FF6B4A]/10 text-[#FF6B4A] border border-[#FF6B4A]/30 hover:bg-[#FF6B4A]/20 transition-all flex items-center gap-1"
                            title="Insert into Caption form"
                          >
                            Apply
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SECTION 4: DRAWBACKS AND DETECTED ISSUES ("WHAT NEEDS IMPROVEMENT?")
          ========================================================================= */}
      <div className="p-7 sm:p-8 rounded-3xl bg-[#0D131F] border border-slate-800/80 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-[#FF6B4A] flex items-center justify-center text-white">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                What Needs Improvement? (Prioritized Drawbacks)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Detected flaws ordered by severity. Includes evidence, causal explanation, and expected usability benefit.
            </p>
          </div>

          <span className="text-xs font-mono text-slate-400 self-start sm:self-auto">
            {drawbacks.length} issue{drawbacks.length !== 1 ? "s" : ""} detected
          </span>
        </div>

        {drawbacks.length > 0 ? (
          <div className="space-y-3.5">
            {drawbacks.map((db) => {
              const isCrit = db.severity === "Critical";
              const isHigh = db.severity === "High";
              const isMed = db.severity === "Medium";

              const badgeClass = isCrit
                ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                : isHigh
                ? "bg-[#FF6B4A]/15 text-[#FF6B4A] border-[#FF6B4A]/30"
                : isMed
                ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                : "bg-sky-500/15 text-sky-400 border-sky-500/30";

              return (
                <div
                  key={db.id}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`text-[10.5px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badgeClass}`}
                      >
                        {db.severity} Priority
                      </span>
                      <span className="text-sm font-bold text-white">
                        {db.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                      <span>Confidence:</span>
                      <strong className="text-slate-200">{db.confidence}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                    <div className="md:col-span-6 space-y-2">
                      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                        <strong className="text-slate-300 font-mono block mb-0.5">Evidence:</strong>
                        <span className="text-slate-300 font-mono">{db.evidence}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed font-medium">
                        <strong className="text-slate-400">Why it matters:</strong> {db.explanation}
                      </p>
                    </div>

                    <div className="md:col-span-6 space-y-2">
                      <div className="p-2.5 rounded-xl bg-[#FF6B4A]/10 border border-[#FF6B4A]/20 text-slate-200">
                        <strong className="text-[#FF6B4A] font-bold block mb-0.5">Recommended Fix:</strong>
                        <span>{db.recommended_fix}</span>
                      </div>
                      <p className="text-emerald-400 font-mono text-[11px] leading-snug">
                        <strong>Expected benefit:</strong> {db.expected_benefit}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 mx-auto" />
            <h4 className="font-bold text-sm">No Critical Drawbacks Detected!</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your content demonstrates strong visual discipline and structural clarity. Review the recommendations checklist below for optional refinements.
            </p>
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 5: ACTIONABLE IMPROVEMENT STUDIO (CHECKLIST & FILTERS)
          ========================================================================= */}
      <div className="p-7 sm:p-8 rounded-3xl bg-[#0D131F] border border-slate-800/80 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white">
                <CheckSquare className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Improvement Studio (Interactive Action Checklist)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Check off improvements as you apply them. Progress is tracked for this session.
            </p>
          </div>

          {/* Live Completion Counter */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">
                Tasks Completed
              </span>
              <span className="text-sm font-bold font-mono text-white">
                {completedTasks.size} / {checklist.length} ({completionPct}%)
              </span>
            </div>
            <div className="w-20 h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-[#FF6B4A] transition-all duration-300"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {[
            { id: "all", label: `All (${checklist.length})` },
            { id: "high", label: "High Priority" },
            { id: "visual", label: "Visual Improvements" },
            { id: "caption", label: "Caption Improvements" },
            { id: "accessibility", label: "Accessibility" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveChecklistFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                activeChecklistFilter === tab.id
                  ? "bg-[#FF6B4A] text-white shadow-md shadow-[#FF6B4A]/20"
                  : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Recommendations Checklist Items */}
        <div className="space-y-3">
          {filteredRecommendations.map((item) => {
            const isDone = completedTasks.has(item.id);

            return (
              <div
                key={item.id}
                onClick={() => toggleTaskCompletion(item.id)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                  isDone
                    ? "bg-slate-950/40 border-slate-800/50 opacity-60"
                    : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="pt-0.5 shrink-0">
                  {isDone ? (
                    <CheckSquare className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span
                      className={`font-bold text-sm ${
                        isDone ? "line-through text-slate-400" : "text-white"
                      }`}
                    >
                      {item.title}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
                        item.priority === "Critical" || item.priority === "High"
                          ? "bg-[#FF6B4A]/10 text-[#FF6B4A] border-[#FF6B4A]/30"
                          : "bg-slate-800 text-slate-300 border-slate-700"
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>

                  <p className="text-slate-300 leading-relaxed font-medium">
                    <strong className="text-slate-400">Proposed Change:</strong> {item.proposed_change}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px] text-slate-400">
                    <div>
                      <span className="text-slate-500">Current Issue:</span> {item.current_issue}
                    </div>
                    <div>
                      <span className="text-slate-500">Expected Benefit:</span>{" "}
                      <span className="text-emerald-400 font-bold">{item.expected_benefit}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          SECTION 6: BEFORE-AND-AFTER COMPARISON
          ========================================================================= */}
      <div className="p-7 sm:p-8 rounded-3xl bg-[#0D131F] border border-slate-800/80 shadow-2xl space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-[#FF6B4A] flex items-center justify-center text-white">
              <Eye className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Before & After Comparison Studio
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Compare original copy and visual layout specifications side-by-side.
          </p>
        </div>

        {/* Captions Before vs After */}
        {captionStudio && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Caption Comparison
              </span>
              <div className="flex items-center gap-1.5 text-xs">
                {captionStudio.alternatives.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setSelectedAltForCompare(a.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      selectedAltForCompare === a.id
                        ? "bg-[#FF6B4A] text-white"
                        : "bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {a.title.split("—")[0].trim()}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase text-slate-400">
                    Original Caption
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {report.caption_analysis?.metrics?.words || 0} words
                  </span>
                </div>
                <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                  {captionStudio.original_caption || "No caption entered"}
                </div>
              </div>

              {/* Improved Alternative */}
              {activeAlternative && (
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-[#FF6B4A]/40 space-y-2 shadow-lg shadow-[#FF6B4A]/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase text-[#FF6B4A]">
                      {activeAlternative.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(activeAlternative.id, activeAlternative.text)}
                      className="text-[11px] font-mono font-bold text-slate-300 hover:text-white flex items-center gap-1"
                    >
                      {copiedAltId === activeAlternative.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-400" />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="text-xs text-slate-100 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto font-sans">
                    {activeAlternative.text}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Visual Design Specification Specification Box */}
        {visualSpec && visualSpec.has_media && (
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
              Enhanced Visual Design Specification
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Optimal Framing</span>
                <span className="font-bold text-white text-xs">{visualSpec.recommended_aspect}</span>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Current: {visualSpec.original_aspect}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Subject Placement</span>
                <span className="font-bold text-white text-xs">Rule-of-Thirds Safe Zone</span>
                <p className="text-[11px] text-slate-400 leading-tight">
                  {visualSpec.framing_advice}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Contrast Overlay</span>
                <span className="font-bold text-amber-400 text-xs">WCAG AA 4.5:1 Target</span>
                <p className="text-[11px] text-slate-400 leading-tight">
                  {visualSpec.contrast_advice}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">UI Margins</span>
                <span className="font-bold text-white text-xs">IG Overlay Buffer</span>
                <p className="text-[11px] text-slate-400 leading-tight">
                  {visualSpec.safe_zone_notes}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 7: SEGREGATED ENGAGEMENT PREDICTION (SEPARATED FROM QUALITY SCORE)
          ========================================================================= */}
      {segregatedPred && (
        <div className="p-7 sm:p-8 rounded-3xl bg-[#090D17] border-2 border-slate-800/90 shadow-2xl space-y-5 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-500 flex items-center justify-center text-white">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Engagement Prediction (Statistical Offline Model)
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Strictly separated from content quality scoring. Models historical audience reaction velocity.
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono">
              Model: {segregatedPred.model_name}
            </span>
          </div>

          {/* Important Segregation Banner */}
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-3">
            <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <strong className="text-white block">Methodology Distinction:</strong>
              <span>{segregatedPred.methodology_notice}</span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                Predicted Engagement Rate
              </span>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono">
                {segregatedPred.predicted_rate.toFixed(2)}%
              </div>
              <span className="text-xs font-bold text-amber-400">
                {segregatedPred.performance_band} Engagement Band
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                90% Uncertainty Interval
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-200 font-mono">
                {segregatedPred.lower_bound.toFixed(2)}% — {segregatedPred.upper_bound.toFixed(2)}%
              </div>
              <span className="text-xs text-slate-400">
                Confidence range across corpus variance
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                Historical Benchmark
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-200 font-mono">
                {segregatedPred.historical_baseline.category_average.toFixed(2)}%
              </div>
              <span className="text-xs text-slate-400">
                Average in {segregatedPred.historical_baseline.category}
              </span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-500 space-y-1 pt-1">
            <div><strong>Formula:</strong> {segregatedPred.target_definition}</div>
            <ul className="list-disc list-inside space-y-0.5 text-slate-400">
              {segregatedPred.limitations.map((lim, lIdx) => (
                <li key={lIdx}>{lim}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 8: FINAL PUBLISHING-READINESS CHECKLIST
          ========================================================================= */}
      {publishingChecklist && (
        <div className="p-7 sm:p-8 rounded-3xl bg-[#0D131F] border border-slate-800/80 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Final Pre-Flight Publishing Checklist
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                10 automated pre-publication verification checks evaluating clarity, accessibility, and compliance.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">
                  Readiness Status
                </span>
                <span className="text-sm font-bold font-mono text-white">
                  {publishingChecklist.summary.readiness_percentage}% Ready
                </span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  publishingChecklist.summary.is_ready_to_publish
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                }`}
              >
                {publishingChecklist.summary.is_ready_to_publish
                  ? "✓ Cleared to Publish"
                  : "Review Required"}
              </span>
            </div>
          </div>

          {/* Counts Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              {publishingChecklist.summary.passed} Passed
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              {publishingChecklist.summary.needs_review} Needs Review
            </div>
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              {publishingChecklist.summary.failed} Failed
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-400">
              {publishingChecklist.summary.not_evaluated} Not Evaluated
            </div>
          </div>

          {/* 10 Checklist Items */}
          <div className="space-y-2.5">
            {publishingChecklist.items.map((chk) => {
              const isPass = chk.status === "passed";
              const isReview = chk.status === "needs_review";
              const isFail = chk.status === "failed";

              const statusBadge = isPass ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  PASSED
                </span>
              ) : isReview ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  NEEDS REVIEW
                </span>
              ) : isFail ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  FAILED
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-800 text-slate-400 border border-slate-700">
                  NOT EVALUATED
                </span>
              );

              return (
                <div
                  key={chk.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                >
                  <div className="space-y-0.5 flex-1 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{chk.item}</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">{chk.description}</p>
                    <div className="text-[10.5px] font-mono text-slate-400 pt-0.5">
                      <strong className="text-slate-300">Finding:</strong> {chk.evidence}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2 self-start sm:self-center">
                    {statusBadge}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
