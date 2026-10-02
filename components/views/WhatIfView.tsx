"use client";

import React, { useState, useMemo } from "react";
import {
  GitCompare,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  Sliders,
  Clock,
  Type,
  Video,
  Image as ImageIcon,
  CheckCircle2,
  ShieldCheck,
  Zap,
  FileText,
  SlidersHorizontal,
} from "lucide-react";
import { predictPost } from "@/lib/api";
import { ModelStatusResponse, PredictionResultData } from "@/types";
import ScenarioPostCard, { StudioScenarioFormState } from "@/components/studio/ScenarioPostCard";
import { detectScenarioDifferences } from "@/lib/media-signals";

interface WhatIfViewProps {
  modelStatus: ModelStatusResponse | null;
}

export default function WhatIfView({ modelStatus }: WhatIfViewProps) {
  const isTrained = Boolean(modelStatus?.trained);
  const today = new Date().toISOString().split("T")[0];

  // Comparison Mode: "single" | "multiple"
  const [comparisonMode, setComparisonMode] = useState<"single" | "multiple">("single");

  // Plan A (Current Planned Scenario)
  const [planA, setPlanA] = useState<StudioScenarioFormState>({
    caption: "Excited to share our latest product launch! Check out the details at the link in bio #launch #tech #startup",
    mediaType: "image",
    followers: 2500,
    date: today,
    time: "10:30",
    category: "Technology",
    goal: "Engagement",
    audioName: "Original Audio",
    audioType: "original",
    audioId: "",
    media: null,
    carouselItems: [],
  });

  // Plan B (Alternative Planned Scenario)
  const [planB, setPlanB] = useState<StudioScenarioFormState>({
    caption: "Excited to share our latest product launch! Check out the details at the link in bio #launch #tech #startup",
    mediaType: "image",
    followers: 2500,
    date: today,
    time: "19:00",
    category: "Technology",
    goal: "Engagement",
    audioName: "Original Audio",
    audioType: "original",
    audioId: "",
    media: null,
    carouselItems: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resA, setResA] = useState<PredictionResultData | null>(null);
  const [resB, setResB] = useState<PredictionResultData | null>(null);

  // Compute live differences between Plan A and Plan B
  const differences = useMemo(() => {
    return detectScenarioDifferences(
      {
        caption: planA.caption,
        mediaType: planA.mediaType,
        followers: planA.followers,
        date: planA.date,
        time: planA.time,
        category: planA.category,
        goal: planA.goal,
        audioName: planA.audioName,
        audioType: planA.audioType,
        media: planA.media,
      },
      {
        caption: planB.caption,
        mediaType: planB.mediaType,
        followers: planB.followers,
        date: planB.date,
        time: planB.time,
        category: planB.category,
        goal: planB.goal,
        audioName: planB.audioName,
        audioType: planB.audioType,
        media: planB.media,
      }
    );
  }, [planA, planB]);

  const changedFieldsSet = useMemo(() => {
    return new Set(differences.changed.map((c) => c.field));
  }, [differences]);

  // Quick Preset Test Scenarios
  const handleApplyPreset = (preset: "time" | "caption" | "mediaType" | "reelAudio") => {
    setError(null);
    setResA(null);
    setResB(null);

    const baseCaption = "✨ Revealing the full journey behind our newest release. Which feature are you most excited to test? Tell us below! 🔥 #innovation #buildinpublic #community";

    if (preset === "time") {
      setComparisonMode("single");
      setPlanA((prev) => ({
        ...prev,
        caption: baseCaption,
        mediaType: "image",
        followers: 2500,
        time: "10:30",
      }));
      setPlanB((prev) => ({
        ...prev,
        caption: baseCaption,
        mediaType: "image",
        followers: 2500,
        time: "19:00",
      }));
    } else if (preset === "caption") {
      setComparisonMode("single");
      setPlanA((prev) => ({
        ...prev,
        caption: "Short announcement: New features available now in bio link.",
        mediaType: "image",
        time: "18:00",
        followers: 2500,
      }));
      setPlanB((prev) => ({
        ...prev,
        caption: "✨ Behind the scenes: We spent 6 months rebuilding our analytics engine from scratch. Which metric matters most to your team? Drop a comment below! 🔥 #buildinpublic #creators #datascience #community",
        mediaType: "image",
        time: "18:00",
        followers: 2500,
      }));
    } else if (preset === "mediaType") {
      setComparisonMode("single");
      setPlanA((prev) => ({
        ...prev,
        caption: baseCaption,
        mediaType: "image",
        time: "18:00",
        followers: 2500,
      }));
      setPlanB((prev) => ({
        ...prev,
        caption: baseCaption,
        mediaType: "reel",
        time: "18:00",
        followers: 2500,
        audioType: "original",
        audioName: "Original Audio",
      }));
    } else if (preset === "reelAudio") {
      setComparisonMode("single");
      setPlanA((prev) => ({
        ...prev,
        caption: baseCaption,
        mediaType: "reel",
        time: "19:00",
        followers: 2500,
        audioType: "original",
        audioName: "CyberPulse Original Audio",
      }));
      setPlanB((prev) => ({
        ...prev,
        caption: baseCaption,
        mediaType: "reel",
        time: "19:00",
        followers: 2500,
        audioType: "custom",
        audioName: "Trending Instagram Sound",
      }));
    }
  };

  // Copy Plan A into Plan B
  const handleCopyPlanA = () => {
    setPlanB({
      ...planA,
      carouselItems: [...planA.carouselItems],
    });
  };

  // Run Comparison Prediction
  const handleCompare = async () => {
    if (!isTrained) {
      setError("The prediction model is not ready yet. Train it from the Dataset page first.");
      return;
    }

    if (!planA.caption.trim()) {
      setError("Add a caption to Option A.");
      return;
    }
    if (!planB.caption.trim()) {
      setError("Add a caption to Option B.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [respA, respB] = await Promise.all([
        predictPost({
          caption: planA.caption,
          media_type: planA.mediaType,
          followers_at_or_near_collection: planA.followers,
          published_at: `${planA.date}T${planA.time}:00Z`,
        }),
        predictPost({
          caption: planB.caption,
          media_type: planB.mediaType,
          followers_at_or_near_collection: planB.followers,
          published_at: `${planB.date}T${planB.time}:00Z`,
        }),
      ]);

      if (respA.success && respB.success) {
        setResA(respA.result);
        setResB(respB.result);
      } else {
        throw new Error("The comparison did not finish. Try again.");
      }
    } catch (err: any) {
      setError(err.message || "The comparison did not finish. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const delta = resA && resB ? Number((resB.prediction - resA.prediction).toFixed(2)) : null;

  // Check if intervals overlap
  const intervalsOverlap =
    resA && resB ? Math.max(resA.lower, resB.lower) <= Math.min(resA.upper, resB.upper) : false;

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      <div className="glass-card p-5 sm:p-6 rounded-3xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <p className="text-sm text-[#6B7280] max-w-xl leading-relaxed">
            {comparisonMode === "single"
              ? "Change one detail in Option B, such as the time or the caption. That makes it easier to see what caused the difference."
              : "Change as many details as you want. Option B is a full alternative to Option A."}
          </p>
          <div className="bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] p-1 rounded-2xl flex items-center shrink-0 self-start">
            <button
              type="button"
              onClick={() => setComparisonMode("single")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all min-h-11 ${
                comparisonMode === "single"
                  ? "bg-[#E0E5EC] text-[#6C63FF] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)]"
                  : "text-[#6B7280] hover:text-[#3D4852]"
              }`}
            >
              Change one thing
            </button>
            <button
              type="button"
              onClick={() => setComparisonMode("multiple")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all min-h-11 ${
                comparisonMode === "multiple"
                  ? "bg-[#E0E5EC] text-[#6C63FF] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)]"
                  : "text-[#6B7280] hover:text-[#3D4852]"
              }`}
            >
              Change several things
            </button>
          </div>
        </div>
        {comparisonMode === "single" && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[#6B7280]">Try an example:</span>
          <button type="button" onClick={() => handleApplyPreset("time")} className="btn-secondary px-3 py-2 text-xs">
            Posting time
          </button>
          <button type="button" onClick={() => handleApplyPreset("caption")} className="btn-secondary px-3 py-2 text-xs">
            Caption
          </button>
          <button type="button" onClick={() => handleApplyPreset("mediaType")} className="btn-secondary px-3 py-2 text-xs">
            Photo or Reel
          </button>
          <button type="button" onClick={() => handleApplyPreset("reelAudio")} className="btn-secondary px-3 py-2 text-xs">
            Reel audio
          </button>
        </div>
        )}
      </div>

      {/* Untrained Model Warning */}
      {!isTrained && (
        <div className="p-4 rounded-2xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-[#B45309] text-sm">The prediction model is not ready yet</p>
            <p className="mt-0.5 text-[#6B7280] leading-relaxed">
              Train it from the Dataset page before comparing two options.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] text-xs text-[#BE123C] flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* SECTION: Scenario Input Cards (Plan A & Plan B) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ScenarioPostCard
          planId="A"
          title="Option A"
          state={planA}
          onChange={setPlanA}
          changedFields={changedFieldsSet}
          singleVariableMode={comparisonMode === "single"}
        />

        <ScenarioPostCard
          planId="B"
          title="Option B"
          state={planB}
          onChange={setPlanB}
          changedFields={changedFieldsSet}
          singleVariableMode={comparisonMode === "single"}
          onCopyFromA={handleCopyPlanA}
        />
      </div>

      {/* SECTION: Compare Action Button */}
      <div className="flex flex-col items-center justify-center gap-3 pt-2">
        <button
          onClick={handleCompare}
          disabled={loading || !isTrained}
          className="btn-primary px-10 py-4 text-base font-bold shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] disabled:opacity-50 transition-transform active:scale-95"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin" />
              Comparing the two options...
            </span>
          ) : (
            <span className="flex items-center gap-2.5">
              <GitCompare className="w-5 h-5" />
              Compare options
            </span>
          )}
        </button>

        <p className="text-xs text-[#6B7280] text-center">
          Both options need a caption. A file is optional.
        </p>
      </div>

      {/* SECTION: What Changed? & Unchanged Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* What Changed? */}
        <div className="glass-card p-6 rounded-3xl border border-border/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-orange" />
              <h2 className="text-sm font-bold text-[#3D4852]">What is different</h2>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary-orange/20 text-[#6C63FF]">
              {differences.changed.length === 0
                ? "Nothing yet"
                : `${differences.changed.length} change${differences.changed.length > 1 ? "s" : ""}`}
            </span>
          </div>

          {differences.changed.length === 0 ? (
            <p className="text-xs text-[#6B7280] py-2">
              Option A and Option B match. Change something in Option B, then compare.
            </p>
          ) : (
            <div className="space-y-3">
              {differences.changed.map((param) => (
                <div key={param.field} className="p-3 rounded-2xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] border border-transparent space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#3D4852]">{param.label}</span>
                    <span className="text-[10px] text-[#6C63FF]">Different</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                    <span className="px-2 py-0.5 rounded bg-surface border border-transparent text-[#6B7280] font-mono truncate max-w-[140px]">
                      {param.value_a}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#6B7280] shrink-0" />
                    <span className="px-2 py-0.5 rounded bg-primary-orange/20 border border-transparent text-[#6C63FF] font-mono truncate max-w-[140px]">
                      {param.value_b}
                    </span>
                  </div>
                  {param.impact_note && (
                    <p className="text-[11px] text-[#6B7280] mt-1">{param.impact_note}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Unchanged Parameters */}
        <div className="glass-card p-6 rounded-3xl border border-border/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
              <h2 className="text-sm font-bold text-[#3D4852]">What stays the same</h2>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E0E5EC] text-[#0F766E] shadow-[inset_3px_3px_6px_rgb(163,177,198,0.55),inset_-3px_-3px_6px_rgba(255,255,255,0.5)]">
              {differences.unchanged.length} matching
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {differences.unchanged.map((item) => (
              <div key={item.field} className="p-2.5 rounded-xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] border border-transparent">
                <span className="text-[#6B7280] text-[10px] block">{item.label}</span>
                <span className="font-mono text-[#3D4852] truncate block mt-0.5">{item.value}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-[#6B7280] pt-1">
            These details match, so the comparison is only about what you changed.
          </p>
        </div>
      </div>

      {/* SECTION: Dedicated Media Content Comparison (if media uploaded) */}
      {(planA.media || planB.media) && (
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-border/80 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <ImageIcon className="w-5 h-5 text-[#6C63FF]" />
              <div>
                <h2 className="text-base font-bold text-[#3D4852]">The files</h2>
                <p className="text-xs text-[#6B7280]">Details from the files you uploaded</p>
              </div>
            </div>
            <span className="text-xs text-[#6B7280]">Uploaded files</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Plan A Media Profile */}
            <div className="p-4 rounded-2xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] border border-transparent space-y-3">
              <span className="text-xs font-bold text-[#6B7280] block pb-1 border-b border-transparent">
                Option A file
              </span>
              {planA.media ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-transparent">
                    <span className="text-[#6B7280]">Format & Type</span>
                    <span className="text-[#3D4852] font-mono">{planA.media.format} ({planA.mediaType.toUpperCase()})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-transparent">
                    <span className="text-[#6B7280]">Aspect Ratio</span>
                    <span className="text-[#3D4852] font-mono">{planA.media.aspectRatio}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-transparent">
                    <span className="text-[#6B7280]">Dimensions</span>
                    <span className="text-[#3D4852] font-mono">{planA.media.width} × {planA.media.height} px</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-transparent">
                    <span className="text-[#6B7280]">Playback Duration</span>
                    <span className="text-[#3D4852] font-mono">
                      {planA.media.durationSec ? `${planA.media.durationSec}s` : "Static (Image)"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#6B7280]">Audio Stream</span>
                    <span className="text-[#3D4852] font-mono">
                      {planA.mediaType === "reel" ? (planA.media.audioDetected ? "Detected in Video" : "No Audio Track") : "Not applicable (Image)"}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#6B7280]">No file added for Option A.</p>
              )}
            </div>

            {/* Plan B Media Profile */}
            <div className="p-4 rounded-2xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] border border-transparent space-y-3">
              <span className="text-xs font-bold text-[#6B7280] block pb-1 border-b border-transparent">
                Option B file
              </span>
              {planB.media ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-transparent">
                    <span className="text-[#6B7280]">Format & Type</span>
                    <span className="text-[#3D4852] font-mono">{planB.media.format} ({planB.mediaType.toUpperCase()})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-transparent">
                    <span className="text-[#6B7280]">Aspect Ratio</span>
                    <span className="text-[#3D4852] font-mono">{planB.media.aspectRatio}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-transparent">
                    <span className="text-[#6B7280]">Dimensions</span>
                    <span className="text-[#3D4852] font-mono">{planB.media.width} × {planB.media.height} px</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-transparent">
                    <span className="text-[#6B7280]">Playback Duration</span>
                    <span className="text-[#3D4852] font-mono">
                      {planB.media.durationSec ? `${planB.media.durationSec}s` : "Static (Image)"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#6B7280]">Audio Stream</span>
                    <span className="text-[#3D4852] font-mono">
                      {planB.mediaType === "reel" ? (planB.media.audioDetected ? "Detected in Video" : "No Audio Track") : "Not applicable (Image)"}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#6B7280]">No file added for Option B.</p>
              )}
            </div>
          </div>

          <p className="text-xs text-[#6B7280]">
            These file details are shown for context. The estimate uses the format, caption, time, and follower count.
          </p>
        </div>
      )}

      {/* SECTION: Model Results & Comparison Card */}
      {delta !== null && resA && resB && (
        <div className="glass-card-accent p-6 md:p-10 rounded-3xl animate-fade-in space-y-8">
          {/* Main Delta Result Header */}
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#6B7280]">
              How the estimate changes
            </span>

            <div className="flex items-center justify-center gap-3">
              {delta > 0 ? (
                <div className="p-2 rounded-2xl bg-emerald-500/20 text-[#0F766E]">
                  <TrendingUp className="w-8 h-8" />
                </div>
              ) : delta < 0 ? (
                <div className="p-2 rounded-2xl bg-rose-500/20 text-[#BE123C]">
                  <TrendingDown className="w-8 h-8" />
                </div>
              ) : (
                <div className="p-2 rounded-2xl bg-[#E0E5EC] text-[#6B7280] shadow-[inset_3px_3px_6px_rgb(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.5)]">
                  <Sliders className="w-8 h-8" />
                </div>
              )}

              <div
                className={`text-4xl sm:text-6xl font-black font-mono ${
                  delta > 0 ? "text-[#0F766E]" : delta < 0 ? "text-[#BE123C]" : "text-[#6B7280]"
                }`}
              >
                {delta > 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)}
              </div>
            </div>

            <p className="text-sm text-[#6B7280] font-medium">
              Option A: <strong className="text-[#3D4852]">{resA.prediction.toFixed(2)}%</strong>
              {" · "}
              Option B: <strong className="text-[#3D4852]">{resB.prediction.toFixed(2)}%</strong>
            </p>

            <p className="text-xs text-[#6B7280] max-w-xl mx-auto">
              {delta > 0
                ? `Option B is about ${delta.toFixed(2)} percentage points higher. This is an estimate, not a guarantee.`
                : delta < 0
                ? `Option B is about ${Math.abs(delta).toFixed(2)} percentage points lower. This is an estimate, not a guarantee.`
                : "Both options get the same estimate."}
            </p>
          </div>

          {/* Uncertainty Intervals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-transparent text-xs">
            <div className="p-4 rounded-2xl bg-[#E0E5EC] border border-transparent text-center space-y-1">
              <span className="text-[#6B7280] block font-medium">Option A likely range</span>
              <strong className="text-[#3D4852] font-mono text-base block">
                {resA.lower.toFixed(2)}% — {resA.upper.toFixed(2)}%
              </strong>
              <span className="text-[11px] text-[#6B7280]">Band: {resA.band}</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#E0E5EC] border border-transparent text-center space-y-1">
              <span className="text-[#6B7280] block font-medium">Option B likely range</span>
              <strong className="text-[#3D4852] font-mono text-base block">
                {resB.lower.toFixed(2)}% — {resB.upper.toFixed(2)}%
              </strong>
              <span className="text-[11px] text-[#6B7280]">Band: {resB.band}</span>
            </div>
          </div>

          {/* Overlap Caution & Disclaimer */}
          <div className="space-y-2">
            {intervalsOverlap && (
              <div className="p-3.5 rounded-xl bg-[#E0E5EC] shadow-[inset_4px_4px_8px_rgb(163,177,198,0.55),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] text-[#B45309] text-xs flex items-center justify-center gap-2 text-center">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  The two ranges overlap, so the difference is small enough that either option could land in the same place.
                </span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] border border-transparent text-center text-xs text-[#6B7280] flex items-center justify-center gap-2">
              <Info className="w-4 h-4 text-[#6C63FF] shrink-0" />
              <span>
                The ranges show uncertainty. They are not a promise of future likes or comments.
              </span>
            </div>
          </div>

          {/* THREE-TIER SEPARATION: Extracted Signals vs Model Inputs vs Model Estimate */}
          <div className="p-6 rounded-2xl bg-[#E0E5EC] border border-transparent space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-transparent">
              <span className="font-bold text-[#3D4852] uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#6C63FF]" />
                How this result was built
              </span>
              <span className="text-[11px] text-[#6B7280]">Three parts</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tier 1: Extracted Media Signals */}
              <div className="p-3.5 rounded-xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] border border-transparent space-y-2">
                <div className="flex items-center gap-1.5 text-[#6C63FF] font-bold uppercase text-[11px]">
                  <Video className="w-3.5 h-3.5" />
                  <span>1. The files</span>
                </div>
                <ul className="text-[#6B7280] text-[11px] space-y-1 list-disc list-inside">
                  <li>Option A: {planA.media ? `${planA.media.aspectRatio}, ${planA.media.width}×${planA.media.height}` : "No file"}</li>
                  <li>Option B: {planB.media ? `${planB.media.aspectRatio}, ${planB.media.width}×${planB.media.height}` : "No file"}</li>
                  <li>Audio: {planA.mediaType === "reel" ? planA.audioName || planA.audioType : "Not applicable"} → {planB.mediaType === "reel" ? planB.audioName || planB.audioType : "Not applicable"}</li>
                </ul>
                <p className="text-[11px] text-[#6B7280] pt-1">Shown for context. Not all of this is used in the estimate.</p>
              </div>

              {/* Tier 2: Model Inputs */}
              <div className="p-3.5 rounded-xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] border border-transparent space-y-2">
                <div className="flex items-center gap-1.5 text-[#6C63FF] font-bold uppercase text-[11px]">
                  <FileText className="w-3.5 h-3.5" />
                  <span>2. What the estimate uses</span>
                </div>
                <ul className="text-[#6B7280] text-[11px] space-y-1 list-disc list-inside">
                  <li>Media Type: {planA.mediaType.toUpperCase()} → {planB.mediaType.toUpperCase()}</li>
                  <li>Caption Length: {planA.caption.length} → {planB.caption.length} chars</li>
                  <li>Posting Hour: {planA.time} → {planB.time} UTC</li>
                  <li>Followers: {planA.followers.toLocaleString()} → {planB.followers.toLocaleString()}</li>
                </ul>
                <p className="text-[11px] text-[#6B7280] pt-1">Format, caption, posting time, and followers.</p>
              </div>

              {/* Tier 3: Model Estimate */}
              <div className="p-3.5 rounded-xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] border border-transparent space-y-2">
                <div className="flex items-center gap-1.5 text-[#0F766E] font-bold uppercase text-[11px]">
                  <Zap className="w-3.5 h-3.5" />
                  <span>3. The result</span>
                </div>
                <ul className="text-[#6B7280] text-[11px] space-y-1 list-disc list-inside">
                  <li>Option A: {resA.prediction.toFixed(2)}%</li>
                  <li>Option B: {resB.prediction.toFixed(2)}%</li>
                  <li>Difference: {delta >= 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)} points</li>
                </ul>
                <p className="text-[11px] text-[#6B7280] pt-1">An estimate from similar posts, not a guarantee.</p>
              </div>
            </div>
          </div>

          {/* SECTION: Model Sensitivity Analysis */}
          <div className="p-5 rounded-2xl bg-[#E0E5EC] border border-transparent space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#3D4852] uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#6C63FF]" />
                What moved the estimate
              </span>
              <span className="text-[11px] text-[#6B7280]">From your changes</span>
            </div>

            <p className="text-[#6B7280]">
              The estimate changed by{" "}
              <strong className={delta >= 0 ? "text-[#0F766E]" : "text-[#BE123C]"}>
                {delta >= 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)} percentage points
              </strong>{" "}
              after the changes below.
            </p>

            <div className="space-y-1.5 pt-1">
              <span className="text-[#6B7280] text-[11px] block font-semibold">What you changed:</span>
              <ul className="list-disc list-inside space-y-1 text-[#6B7280] pl-1">
                {differences.changed.map((param) => (
                  <li key={param.field}>
                    <strong>{param.label}:</strong> {param.value_a} → {param.value_b}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* SECTION: Model Capability & Scientific Integrity */}
          <div className="p-5 rounded-2xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] border border-transparent space-y-2 text-xs">
            <div className="flex items-center gap-2 text-[#6B7280] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#6C63FF]" />
              <span>What this estimate includes</span>
            </div>
            <p className="text-[#6B7280] leading-relaxed">
              The estimate uses the caption, format, posting time, and follower count. File details and audio are shown so you can compare them, and they are not part of the number unless the model was trained on them.
            </p>
          </div>

          {/* SECTION: Interpretation / What You Could Test Next */}
          <div className="p-5 rounded-2xl bg-surface/50 border border-transparent space-y-3 text-xs">
            <span className="font-bold text-[#3D4852] block">Try another comparison</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleApplyPreset("time")}
                className="p-3 rounded-2xl bg-[#E0E5EC] text-left shadow-[5px_5px_10px_rgb(163,177,198,0.55),-5px_-5px_10px_rgba(255,255,255,0.5)] hover:shadow-[inset_4px_4px_8px_rgb(163,177,198,0.55),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] transition-shadow"
              >
                <Clock className="w-4 h-4 text-[#6C63FF] mb-1.5" />
                <strong className="text-[#3D4852] block mb-1">Posting time</strong>
                <p className="text-[11px] text-[#6B7280]">Morning at 10:30 UTC versus evening at 19:00 UTC.</p>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset("caption")}
                className="p-3 rounded-2xl bg-[#E0E5EC] text-left shadow-[5px_5px_10px_rgb(163,177,198,0.55),-5px_-5px_10px_rgba(255,255,255,0.5)] hover:shadow-[inset_4px_4px_8px_rgb(163,177,198,0.55),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] transition-shadow"
              >
                <Type className="w-4 h-4 text-[#6C63FF] mb-1.5" />
                <strong className="text-[#3D4852] block mb-1">Caption</strong>
                <p className="text-[11px] text-[#6B7280]">A short note versus a longer caption with a question.</p>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset("mediaType")}
                className="p-3 rounded-2xl bg-[#E0E5EC] text-left shadow-[5px_5px_10px_rgb(163,177,198,0.55),-5px_-5px_10px_rgba(255,255,255,0.5)] hover:shadow-[inset_4px_4px_8px_rgb(163,177,198,0.55),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] transition-shadow"
              >
                <Video className="w-4 h-4 text-[#6C63FF] mb-1.5" />
                <strong className="text-[#3D4852] block mb-1">Photo or Reel</strong>
                <p className="text-[11px] text-[#6B7280]">Keep the caption and switch the format.</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="text-center text-xs text-[#6B7280] pt-4">
        <p>Uploaded media is used for scenario analysis and is not automatically added to model training data.</p>
      </div>
    </div>
  );
}
