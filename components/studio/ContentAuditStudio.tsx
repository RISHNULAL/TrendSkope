"use client";

import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Copy,
  Check,
  Eye,
  TrendingUp,
  Image as ImageIcon,
  FileText,
  ShieldCheck,
  ArrowRight,
  CheckSquare,
  Square,
} from "lucide-react";
import {
  AnalyzeContentResponse,
  AuditStudioData,
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
      <div className="p-6 rounded-3xl bg-white border border-[#E7E3F0] text-[#68677D] text-sm shadow-sm">
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

  // Presentation band color helper using our professional SaaS palette
  const getScoreColor = (score: number) => {
    if (score >= 90) return { stroke: "#0F9D8A", text: "text-[#0F9D8A]", bg: "bg-[#0F9D8A]/10", border: "border-[#0F9D8A]/30" };
    if (score >= 80) return { stroke: "#6C4DFF", text: "text-[#6C4DFF]", bg: "bg-[#F0EBFF]", border: "border-[#6C4DFF]/30" };
    if (score >= 70) return { stroke: "#E9A23B", text: "text-[#E9A23B]", bg: "bg-[#E9A23B]/10", border: "border-[#E9A23B]/30" };
    if (score >= 60) return { stroke: "#F06F73", text: "text-[#F06F73]", bg: "bg-[#F06F73]/10", border: "border-[#F06F73]/30" };
    return { stroke: "#EF4444", text: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" };
  };

  const overallColors = overall ? getScoreColor(overall.score) : getScoreColor(75);

  // SVG Gauge calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = overall
    ? circumference - (overall.score / 100) * circumference
    : circumference * 0.25;

  return (
    <div className="space-y-8 text-[#242137]">
      {/* =========================================================================
          STUDIO HEADER BAR
          ========================================================================= */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E7E3F0] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#6C4DFF]/10 via-[#4B35B5]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0EBFF] border border-[#6C4DFF]/30 text-[#6C4DFF] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Audit Studio Active
              </span>
              <span className="px-3 py-1 rounded-full bg-[#F8F7FC] border border-[#E7E3F0] text-[#242137] text-xs font-mono font-medium">
                {report.input?.media_type?.toUpperCase() || "IMAGE"} POST
              </span>
              <span className="px-3 py-1 rounded-full bg-[#F8F7FC] border border-[#E7E3F0] text-[#68677D] text-xs font-mono">
                {report.input?.category || "General"}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#242137] tracking-tight flex items-center gap-2">
              AI Content Audit, Scoring & Improvement Studio
            </h2>
            <p className="text-xs sm:text-sm text-[#68677D] max-w-2xl leading-relaxed">
              Evidence-based evaluation of visual composition, text legibility, copywriting structure,
              and pre-flight publishing compliance.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#68677D] block">
                Analysis Engine
              </span>
              <span className="text-xs font-bold text-[#242137]">
                Multimodal CV + NLP
              </span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#F0EBFF] border border-[#6C4DFF]/30 flex items-center justify-center text-[#6C4DFF]">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 1: OVERALL CONTENT QUALITY SCORE GAUGE
          ========================================================================= */}
      {overall && (
        <div className="p-7 sm:p-8 rounded-3xl bg-white border border-[#E7E3F0] shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Circular Score Gauge */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#68677D] mb-3">
                Overall Content Quality
              </span>

              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                  {/* Track Circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="#E7E3F0"
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
                  <span className="text-4xl sm:text-5xl font-black text-[#242137] tracking-tight">
                    {overall.score}
                  </span>
                  <span className="text-xs font-mono font-semibold text-[#68677D] mt-0.5">
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
                <p className="text-xs text-[#68677D] font-medium max-w-xs mx-auto leading-snug">
                  {overall.verdict}
                </p>
              </div>
            </div>

            {/* Right: Breakdown of Contributing Criteria */}
            <div className="lg:col-span-7 space-y-4 border-t lg:border-t-0 lg:border-l border-[#E7E3F0] pt-6 lg:pt-0 lg:pl-8">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#68677D] flex items-center justify-between">
                  <span>Contributing Quality Pillars</span>
                  <span className="text-[10px] font-mono text-[#68677D] font-normal">
                    Normalized Weighting
                  </span>
                </h3>
                <p className="text-xs text-[#68677D] mt-1">
                  Derived strictly from applicable evaluated categories. Engagement prediction is excluded from content craft score.
                </p>
              </div>

              <div className="space-y-3">
                {overall.contributing_categories.map((cat, idx) => {
                  const catColor = getScoreColor(cat.score);
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#242137]">
                          {cat.name}
                        </span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-[11px] text-[#68677D]">
                            Weight: {Math.round(cat.weight * 100)}%
                          </span>
                          <span className={`font-bold ${catColor.text}`}>
                            {cat.score} / 100
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-[#F0EBFF] overflow-hidden">
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
              <div className="pt-2 text-[10.5px] font-mono text-[#68677D] grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-center">
                <div className="p-1.5 rounded-lg bg-[#0F9D8A]/10 border border-[#0F9D8A]/20 text-[#0F9D8A] font-semibold">
                  90–100: Excellent
                </div>
                <div className="p-1.5 rounded-lg bg-[#F0EBFF] border border-[#6C4DFF]/30 text-[#6C4DFF] font-semibold">
                  80–89: Very Good
                </div>
                <div className="p-1.5 rounded-lg bg-[#E9A23B]/10 border border-[#E9A23B]/20 text-[#E9A23B] font-semibold">
                  70–79: Good
                </div>
                <div className="p-1.5 rounded-lg bg-[#F06F73]/10 border border-[#F06F73]/20 text-[#F06F73] font-semibold">
                  60–69: Review
                </div>
                <div className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 font-semibold">
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
        <div className="p-7 sm:p-8 rounded-3xl bg-white border border-[#E7E3F0] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E7E3F0] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6C4DFF] to-[#4B35B5] flex items-center justify-center text-white">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#242137] tracking-tight">
                  Image & Poster Quality Audit
                </h3>
              </div>
              <p className="text-xs text-[#68677D] mt-1">
                Photometric diagnostics, resolution suitability, edge sharpness, and visual hierarchy.
              </p>
            </div>

            {imageAudit.overall_score !== null && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-[#68677D] block">
                    Image Quality Rating
                  </span>
                  <span className="text-lg font-black text-[#242137] font-mono">
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
                <div className="rounded-2xl border border-[#E7E3F0] bg-[#F8F7FC] p-2 overflow-hidden shadow-inner flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mediaPreviewUrl}
                    alt="Uploaded media audit preview"
                    className="max-h-64 rounded-xl object-contain"
                  />
                </div>
                <div className="text-[11px] font-mono text-[#68677D] space-y-1">
                  <div className="flex justify-between">
                    <span>Framing:</span>
                    <strong className="text-[#242137]">
                      {report.media_analysis?.dimensions?.aspect_ratio || "Detected"}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Resolution:</span>
                    <strong className="text-[#242137]">
                      {report.media_analysis?.dimensions?.width || 1080} × {report.media_analysis?.dimensions?.height || 1350}px
                    </strong>
                  </div>
                </div>

                {/* Dominant Palette Swatches */}
                {report.media_analysis?.visual_metrics?.dominant_colors && (
                  <div className="p-3 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] space-y-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#68677D] block">
                      Color Palette Harmony
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {report.media_analysis.visual_metrics.dominant_colors.map((c, cIdx) => (
                        <div
                          key={cIdx}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white border border-[#E7E3F0]"
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span className="text-[10px] font-mono text-[#242137]">{c.hex}</span>
                          <span className="text-[9px] font-mono text-[#68677D]">({c.percentage}%)</span>
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
                      className="p-4 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] hover:border-[#6C4DFF]/40 hover:bg-white transition-all space-y-2 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#242137]">
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

                      <p className="text-xs text-[#68677D] font-medium leading-snug">
                        {cat.explanation}
                      </p>

                      <div className="text-[11px] font-mono text-[#68677D] bg-white p-2 rounded-lg border border-[#E7E3F0] leading-tight">
                        <strong className="text-[#242137]">Evidence:</strong> {cat.evidence}
                      </div>

                      <div className="text-[11px] text-[#242137] flex items-start gap-1.5 leading-snug pt-0.5 font-medium">
                        <ArrowRight className="w-3.5 h-3.5 text-[#6C4DFF] shrink-0 mt-0.5" />
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
        <div className="p-7 sm:p-8 rounded-3xl bg-white border border-[#E7E3F0] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E7E3F0] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6C4DFF] to-[#0F9D8A] flex items-center justify-center text-white">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#242137] tracking-tight">
                  Caption & Hashtag Quality Audit
                </h3>
              </div>
              <p className="text-xs text-[#68677D] mt-1">
                Linguistic structure, opening hook clarity, call-to-action placement, and discoverability.
              </p>
            </div>

            {captionAudit.overall_score !== null && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-[#68677D] block">
                    Caption Score
                  </span>
                  <span className="text-lg font-black text-[#242137] font-mono">
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
                  className="p-3.5 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] space-y-1.5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#242137] truncate pr-1">
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
                  <p className="text-[11px] text-[#68677D] leading-snug">
                    {cat.explanation}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Hashtags Analysis */}
          <div className="p-4 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-[#242137] flex items-center gap-1.5">
                <span>Hashtag Allocation:</span>
                <span className="font-mono text-[#6C4DFF]">{captionAudit.hashtag_analysis.count} tags</span>
                <span className="text-[10px] text-[#68677D]">({captionAudit.hashtag_analysis.density_label})</span>
              </span>
              <p className="text-[#68677D]">
                {captionAudit.hashtag_analysis.recommendation}
              </p>
            </div>
            {captionAudit.hashtag_analysis.detected.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {captionAudit.hashtag_analysis.detected.slice(0, 6).map((ht, hIdx) => (
                  <span key={hIdx} className="px-2 py-0.5 rounded bg-white border border-[#E7E3F0] font-mono text-[10.5px] text-[#242137]">
                    {ht}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* CAPTION IMPROVEMENT STUDIO: 3 PRACTICAL ALTERNATIVES */}
          {captionStudio && captionStudio.alternatives.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-t border-[#E7E3F0] pt-5">
                <div>
                  <h4 className="text-sm font-bold text-[#242137] uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#6C4DFF]" />
                    Caption Improvement Studio (3 Practical Alternatives)
                  </h4>
                  <p className="text-xs text-[#68677D] mt-0.5">
                    Preserves all factual dates, prices, and names. Choose the best tone for your objective.
                  </p>
                </div>
                {captionStudio.preserved_entities && (
                  <span className="text-[11px] font-mono text-[#0F9D8A] bg-[#0F9D8A]/10 px-2.5 py-1 rounded-full border border-[#0F9D8A]/25 hidden md:inline-block font-semibold">
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
                          ? "bg-white border-2 border-[#6C4DFF] shadow-md shadow-[#6C4DFF]/10"
                          : "bg-white border-[#E7E3F0] hover:border-[#6C4DFF]/40 shadow-sm"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                              isOptionB
                                ? "bg-[#F0EBFF] text-[#6C4DFF] border-[#6C4DFF]/30"
                                : isOptionA
                                ? "bg-blue-50 text-[#4285F4] border-blue-200"
                                : "bg-purple-50 text-purple-700 border-purple-200"
                            }`}
                          >
                            {alt.title}
                          </span>
                          <span className="text-[10.5px] font-mono text-[#68677D]">
                            {alt.word_count} words
                          </span>
                        </div>

                        <p className="text-xs text-[#68677D] leading-snug">
                          {alt.subtitle}
                        </p>

                        {/* Caption Text Box */}
                        <div className="p-3.5 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0] text-xs text-[#242137] font-sans whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto">
                          {alt.text}
                        </div>

                        {/* Key Improvements */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#68677D] block">
                            Key Refinements:
                          </span>
                          <ul className="text-[11px] text-[#242137] space-y-0.5">
                            {alt.key_changes.map((ch, cIdx) => (
                              <li key={cIdx} className="flex items-start gap-1.5">
                                <CheckCircle2 className="w-3 h-3 text-[#0F9D8A] shrink-0 mt-0.5" />
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
                              ? "bg-[#0F9D8A] text-white border-[#0F9D8A]"
                              : "bg-[#6C4DFF] hover:bg-[#5B3FE6] text-white border-transparent shadow-sm shadow-[#6C4DFF]/25"
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
                            className="py-2 px-3 rounded-xl text-xs font-bold bg-[#F0EBFF] text-[#6C4DFF] border border-[#6C4DFF]/30 hover:bg-[#6C4DFF] hover:text-white transition-all flex items-center gap-1"
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
      <div className="p-7 sm:p-8 rounded-3xl bg-white border border-[#E7E3F0] shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E7E3F0] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#F06F73] to-[#E9A23B] flex items-center justify-center text-white">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#242137] tracking-tight">
                What Needs Improvement? (Prioritized Drawbacks)
              </h3>
            </div>
            <p className="text-xs text-[#68677D] mt-1">
              Detected flaws ordered by severity. Includes evidence, causal explanation, and expected usability benefit.
            </p>
          </div>

          <span className="text-xs font-mono text-[#68677D] self-start sm:self-auto">
            {drawbacks.length} issue{drawbacks.length !== 1 ? "s" : ""} detected
          </span>
        </div>

        {drawbacks.length > 0 ? (
          <div className="space-y-3.5">
            {drawbacks.map((db) => {
              const isCrit = db.severity === "Critical";
              const isHigh = db.severity === "High";
              const isMed = db.severity === "Medium";

              const badgeClass = isCrit || isHigh
                ? "bg-[#F06F73]/10 text-[#F06F73] border-[#F06F73]/30"
                : isMed
                ? "bg-[#E9A23B]/10 text-[#E9A23B] border-[#E9A23B]/30"
                : "bg-blue-50 text-[#4285F4] border-blue-200";

              return (
                <div
                  key={db.id}
                  className="p-5 rounded-2xl bg-white border border-[#E7E3F0] hover:border-[#6C4DFF]/40 transition-all space-y-3 shadow-sm"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`text-[10.5px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badgeClass}`}
                      >
                        {db.severity} Priority
                      </span>
                      <span className="text-sm font-bold text-[#242137]">
                        {db.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-[#68677D]">
                      <span>Confidence:</span>
                      <strong className="text-[#242137]">{db.confidence}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                    <div className="md:col-span-6 space-y-2">
                      <div className="p-2.5 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0]">
                        <strong className="text-[#68677D] font-mono block mb-0.5">Evidence:</strong>
                        <span className="text-[#242137] font-mono">{db.evidence}</span>
                      </div>
                      <p className="text-[#242137] leading-relaxed font-medium">
                        <strong className="text-[#68677D]">Why it matters:</strong> {db.explanation}
                      </p>
                    </div>

                    <div className="md:col-span-6 space-y-2">
                      <div className="p-2.5 rounded-xl bg-[#F0EBFF] border border-[#6C4DFF]/25 text-[#242137]">
                        <strong className="text-[#6C4DFF] font-bold block mb-0.5">Recommended Fix:</strong>
                        <span>{db.recommended_fix}</span>
                      </div>
                      <p className="text-[#0F9D8A] font-mono text-[11px] leading-snug font-bold">
                        <span>Expected benefit: </span>{db.expected_benefit}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-[#0F9D8A]/5 border border-[#0F9D8A]/25 text-[#0F9D8A] text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 mx-auto" />
            <h4 className="font-bold text-sm">No Critical Drawbacks Detected!</h4>
            <p className="text-xs text-[#68677D] max-w-md mx-auto">
              Your content demonstrates strong visual discipline and structural clarity. Review the recommendations checklist below for optional refinements.
            </p>
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 5: ACTIONABLE IMPROVEMENT STUDIO (CHECKLIST & FILTERS)
          ========================================================================= */}
      <div className="p-7 sm:p-8 rounded-3xl bg-white border border-[#E7E3F0] shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E7E3F0] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6C4DFF] to-[#4285F4] flex items-center justify-center text-white">
                <CheckSquare className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#242137] tracking-tight">
                Improvement Studio (Interactive Action Checklist)
              </h3>
            </div>
            <p className="text-xs text-[#68677D] mt-1">
              Check off improvements as you apply them. Progress is tracked for this session.
            </p>
          </div>

          {/* Live Completion Counter */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-mono text-[#68677D] block uppercase">
                Tasks Completed
              </span>
              <span className="text-sm font-bold font-mono text-[#242137]">
                {completedTasks.size} / {checklist.length} ({completionPct}%)
              </span>
            </div>
            <div className="w-20 h-2 rounded-full bg-[#E7E3F0] overflow-hidden">
              <div
                className="h-full bg-[#6C4DFF] transition-all duration-300"
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
                  ? "bg-[#6C4DFF] text-white shadow-sm shadow-[#6C4DFF]/30"
                  : "bg-white text-[#68677D] hover:text-[#242137] border border-[#E7E3F0]"
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
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 shadow-sm ${
                  isDone
                    ? "bg-[#F8F7FC] border-[#E7E3F0] opacity-75"
                    : "bg-white border-[#E7E3F0] hover:border-[#6C4DFF]/40"
                }`}
              >
                <div className="pt-0.5 shrink-0">
                  {isDone ? (
                    <CheckSquare className="w-5 h-5 text-[#0F9D8A]" />
                  ) : (
                    <Square className="w-5 h-5 text-[#68677D] hover:text-[#6C4DFF]" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span
                      className={`font-bold text-sm ${
                        isDone ? "line-through text-[#68677D]" : "text-[#242137]"
                      }`}
                    >
                      {item.title}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
                        item.priority === "Critical" || item.priority === "High"
                          ? "bg-[#F06F73]/10 text-[#F06F73] border-[#F06F73]/30"
                          : "bg-[#F8F7FC] text-[#68677D] border-[#E7E3F0]"
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>

                  <p className="text-[#242137] leading-relaxed font-medium">
                    <strong className="text-[#68677D]">Proposed Change:</strong> {item.proposed_change}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px] text-[#68677D]">
                    <div>
                      <span className="text-[#68677D]">Current Issue:</span> {item.current_issue}
                    </div>
                    <div>
                      <span className="text-[#68677D]">Expected Benefit:</span>{" "}
                      <span className="text-[#0F9D8A] font-bold">{item.expected_benefit}</span>
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
      <div className="p-7 sm:p-8 rounded-3xl bg-white border border-[#E7E3F0] shadow-sm space-y-6">
        <div className="border-b border-[#E7E3F0] pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6C4DFF] to-[#4B35B5] flex items-center justify-center text-white">
              <Eye className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#242137] tracking-tight">
              Before & After Comparison Studio
            </h3>
          </div>
          <p className="text-xs text-[#68677D] mt-1">
            Compare original copy and visual layout specifications side-by-side.
          </p>
        </div>

        {/* Captions Before vs After */}
        {captionStudio && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#242137]">
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
                        ? "bg-[#6C4DFF] text-white"
                        : "bg-[#F8F7FC] text-[#68677D] hover:text-[#242137] border border-[#E7E3F0]"
                    }`}
                  >
                    {a.title.split("—")[0].trim()}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original */}
              <div className="p-4 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase text-[#68677D]">
                    Original Caption
                  </span>
                  <span className="text-[10px] font-mono text-[#68677D]">
                    {report.caption_analysis?.metrics?.words || 0} words
                  </span>
                </div>
                <div className="text-xs text-[#242137] whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                  {captionStudio.original_caption || "No caption entered"}
                </div>
              </div>

              {/* Improved Alternative */}
              {activeAlternative && (
                <div className="p-4 rounded-2xl bg-[#F0EBFF] border border-[#6C4DFF]/40 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase text-[#6C4DFF]">
                      {activeAlternative.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(activeAlternative.id, activeAlternative.text)}
                      className="text-[11px] font-mono font-bold text-[#6C4DFF] hover:text-[#4B35B5] flex items-center gap-1"
                    >
                      {copiedAltId === activeAlternative.id ? (
                        <Check className="w-3 h-3 text-[#0F9D8A]" />
                      ) : (
                        <Copy className="w-3 h-3 text-[#6C4DFF]" />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="text-xs text-[#242137] whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto font-sans">
                    {activeAlternative.text}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Visual Design Specification Specification Box */}
        {visualSpec && visualSpec.has_media && (
          <div className="space-y-3 pt-3 border-t border-[#E7E3F0]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#242137] block">
              Enhanced Visual Design Specification
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] space-y-1">
                <span className="text-[10px] font-mono text-[#68677D] uppercase block">Optimal Framing</span>
                <span className="font-bold text-[#242137] text-xs">{visualSpec.recommended_aspect}</span>
                <p className="text-[11px] text-[#68677D] leading-tight">
                  Current: {visualSpec.original_aspect}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] space-y-1">
                <span className="text-[10px] font-mono text-[#68677D] uppercase block">Subject Placement</span>
                <span className="font-bold text-[#242137] text-xs">Rule-of-Thirds Safe Zone</span>
                <p className="text-[11px] text-[#68677D] leading-tight">
                  {visualSpec.framing_advice}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] space-y-1">
                <span className="text-[10px] font-mono text-[#68677D] uppercase block">Contrast Overlay</span>
                <span className="font-bold text-[#E9A23B] text-xs">WCAG AA 4.5:1 Target</span>
                <p className="text-[11px] text-[#68677D] leading-tight">
                  {visualSpec.contrast_advice}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] space-y-1">
                <span className="text-[10px] font-mono text-[#68677D] uppercase block">UI Margins</span>
                <span className="font-bold text-[#242137] text-xs">IG Overlay Buffer</span>
                <p className="text-[11px] text-[#68677D] leading-tight">
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
        <div className="p-7 sm:p-8 rounded-3xl bg-white border-2 border-[#E7E3F0] shadow-sm space-y-5 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E7E3F0] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6C4DFF] to-[#4285F4] flex items-center justify-center text-white">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#242137] tracking-tight">
                  Engagement Prediction (Statistical Offline Model)
                </h3>
              </div>
              <p className="text-xs text-[#68677D] mt-1">
                Strictly separated from content quality scoring. Models historical audience reaction velocity.
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-[#F8F7FC] border border-[#E7E3F0] text-[#242137] text-xs font-mono font-medium">
              Model: {segregatedPred.model_name}
            </span>
          </div>

          {/* Important Segregation Banner */}
          <div className="p-4 rounded-2xl bg-[#F0EBFF] border border-[#6C4DFF]/30 text-xs text-[#4B35B5] flex items-start gap-3">
            <HelpCircle className="w-4 h-4 text-[#6C4DFF] shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <strong className="text-[#242137] block font-bold">Methodology Distinction:</strong>
              <span>{segregatedPred.methodology_notice}</span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-5 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] space-y-1 shadow-sm">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#68677D] block">
                Predicted Engagement Rate
              </span>
              <div className="text-3xl sm:text-4xl font-black text-[#6C4DFF] font-mono">
                {segregatedPred.predicted_rate.toFixed(2)}%
              </div>
              <span className="text-xs font-bold text-[#E9A23B]">
                {segregatedPred.performance_band} Engagement Band
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] space-y-1 shadow-sm">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#68677D] block">
                90% Uncertainty Interval
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#242137] font-mono">
                {segregatedPred.lower_bound.toFixed(2)}% — {segregatedPred.upper_bound.toFixed(2)}%
              </div>
              <span className="text-xs text-[#68677D]">
                Confidence range across corpus variance
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] space-y-1 shadow-sm">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#68677D] block">
                Historical Benchmark
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#242137] font-mono">
                {segregatedPred.historical_baseline.category_average.toFixed(2)}%
              </div>
              <span className="text-xs text-[#68677D]">
                Average in {segregatedPred.historical_baseline.category}
              </span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-[#68677D] space-y-1 pt-1">
            <div><strong className="text-[#242137]">Formula:</strong> {segregatedPred.target_definition}</div>
            <ul className="list-disc list-inside space-y-0.5 text-[#68677D]">
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
        <div className="p-7 sm:p-8 rounded-3xl bg-white border border-[#E7E3F0] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E3F0] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0F9D8A] to-[#6C4DFF] flex items-center justify-center text-white">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#242137] tracking-tight">
                  Final Pre-Flight Publishing Checklist
                </h3>
              </div>
              <p className="text-xs text-[#68677D] mt-1">
                10 automated pre-publication verification checks evaluating clarity, accessibility, and compliance.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] font-mono text-[#68677D] uppercase block">
                  Readiness Status
                </span>
                <span className="text-sm font-bold font-mono text-[#242137]">
                  {publishingChecklist.summary.readiness_percentage}% Ready
                </span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  publishingChecklist.summary.is_ready_to_publish
                    ? "bg-[#0F9D8A]/10 text-[#0F9D8A] border-[#0F9D8A]/30"
                    : "bg-[#E9A23B]/10 text-[#E9A23B] border-[#E9A23B]/30"
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
            <div className="p-2.5 rounded-xl bg-[#0F9D8A]/10 border border-[#0F9D8A]/20 text-[#0F9D8A] font-bold">
              {publishingChecklist.summary.passed} Passed
            </div>
            <div className="p-2.5 rounded-xl bg-[#E9A23B]/10 border border-[#E9A23B]/20 text-[#E9A23B] font-bold">
              {publishingChecklist.summary.needs_review} Needs Review
            </div>
            <div className="p-2.5 rounded-xl bg-[#F06F73]/10 border border-[#F06F73]/20 text-[#F06F73] font-bold">
              {publishingChecklist.summary.failed} Failed
            </div>
            <div className="p-2.5 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0] text-[#68677D]">
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
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#0F9D8A]/10 text-[#0F9D8A] border border-[#0F9D8A]/30">
                  PASSED
                </span>
              ) : isReview ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#E9A23B]/10 text-[#E9A23B] border border-[#E9A23B]/30">
                  NEEDS REVIEW
                </span>
              ) : isFail ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#F06F73]/10 text-[#F06F73] border border-[#F06F73]/30">
                  FAILED
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#F8F7FC] text-[#68677D] border border-[#E7E3F0]">
                  NOT EVALUATED
                </span>
              );

              return (
                <div
                  key={chk.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E7E3F0] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-sm hover:border-[#6C4DFF]/30 transition-all"
                >
                  <div className="space-y-0.5 flex-1 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#242137]">{chk.item}</span>
                    </div>
                    <p className="text-[#68677D] text-[11px]">{chk.description}</p>
                    <div className="text-[10.5px] font-mono text-[#68677D] pt-0.5">
                      <strong className="text-[#242137]">Finding:</strong> {chk.evidence}
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
