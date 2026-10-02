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
  Sparkles,
  Layers,
  Clock,
  Type,
  Video,
  Image as ImageIcon,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Music,
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
      setError("The offline trained model is not available. Please train the model with a validated CSV dataset first.");
      return;
    }

    if (!planA.caption.trim()) {
      setError("Please provide a caption for Plan A before running scenario comparison.");
      return;
    }
    if (!planB.caption.trim()) {
      setError("Please provide a caption for Plan B before running scenario comparison.");
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
        throw new Error("Failed to compute predictions for both scenarios.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to compare scenarios. Please try again.");
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
      {/* Top Header & Page Purpose */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-primary-orange/15 border border-primary-orange/30 text-primary-orange text-[11px] font-bold tracking-wide">
              Model-based scenario analysis
            </span>
            <span className="text-xs text-slate-400 font-mono">· What-If Scenario Comparison</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Pre-Publish Scenario Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Compare complete content plans and evaluate how the trained model responds to different publishing scenarios.
          </p>
        </div>

        {/* Comparison Mode Selector */}
        <div className="bg-[#040810]/80 p-1 rounded-2xl border border-border flex items-center shrink-0 self-start md:self-auto">
          <button
            onClick={() => setComparisonMode("single")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              comparisonMode === "single"
                ? "bg-gradient-to-r from-primary-coral/30 to-primary-pink/20 text-white border border-primary-coral/40 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-primary-orange" />
            <span>Single Variable (Recommended)</span>
          </button>
          <button
            onClick={() => setComparisonMode("multiple")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              comparisonMode === "multiple"
                ? "bg-gradient-to-r from-primary-coral/30 to-primary-pink/20 text-white border border-primary-coral/40 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-primary-coral" />
            <span>Multiple Variables</span>
          </button>
        </div>
      </div>

      {/* Mode Guidance & Quick Test Presets */}
      <div className="p-4 rounded-2xl bg-surface/50 border border-border flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2.5 text-slate-300">
          <Info className="w-4 h-4 text-primary-orange shrink-0" />
          <span>
            {comparisonMode === "single" ? (
              <>
                <strong>Single Variable Mode:</strong> Change one supported predictive input at a time to understand model sensitivity.
              </>
            ) : (
              <>
                <strong>Multiple Variables Mode:</strong> Compare two complete publishing plans with multiple differences.
              </>
            )}
          </span>
        </div>

        {/* Test Preset Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 font-bold uppercase mr-1">Test Scenarios:</span>
          <button
            onClick={() => handleApplyPreset("time")}
            className="px-2.5 py-1 rounded-lg bg-surface border border-white/10 hover:border-primary-orange/40 text-slate-200 hover:text-white transition-colors"
          >
            Test 1: Time Sensitivity
          </button>
          <button
            onClick={() => handleApplyPreset("caption")}
            className="px-2.5 py-1 rounded-lg bg-surface border border-white/10 hover:border-primary-orange/40 text-slate-200 hover:text-white transition-colors"
          >
            Test 2: Caption Sensitivity
          </button>
          <button
            onClick={() => handleApplyPreset("mediaType")}
            className="px-2.5 py-1 rounded-lg bg-surface border border-white/10 hover:border-primary-orange/40 text-slate-200 hover:text-white transition-colors"
          >
            Test 3: Media Type
          </button>
          <button
            onClick={() => handleApplyPreset("reelAudio")}
            className="px-2.5 py-1 rounded-lg bg-surface border border-white/10 hover:border-primary-orange/40 text-slate-200 hover:text-white transition-colors"
          >
            Test 4: Reel Audio
          </button>
        </div>
      </div>

      {/* Untrained Model Warning */}
      {!isTrained && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-300 text-sm">Offline Trained Model Required</p>
            <p className="mt-0.5 text-amber-200/90 leading-relaxed">
              Pre-publish scenario comparisons require a trained regression model. Please navigate to the <strong>Dataset</strong> tab to validate and train a model.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* SECTION: Scenario Input Cards (Plan A & Plan B) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ScenarioPostCard
          planId="A"
          title="Plan A (Current Scenario)"
          state={planA}
          onChange={setPlanA}
          changedFields={changedFieldsSet}
          singleVariableMode={comparisonMode === "single"}
        />

        <ScenarioPostCard
          planId="B"
          title="Plan B (Alternative Scenario)"
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
          className="btn-primary px-10 py-4 text-base font-bold shadow-lg disabled:opacity-50 transition-transform active:scale-95"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Evaluating Model Estimates...
            </span>
          ) : (
            <span className="flex items-center gap-2.5">
              <GitCompare className="w-5 h-5 text-white" />
              Compare Scenarios →
            </span>
          )}
        </button>

        <p className="text-[11px] text-slate-400 font-mono text-center">
          Evaluates learned model associations for both publishing plans.
        </p>
      </div>

      {/* SECTION: What Changed? & Unchanged Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* What Changed? */}
        <div className="glass-card p-6 rounded-3xl border border-border/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-orange" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">What Changed?</h2>
            </div>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-primary-orange/20 text-primary-orange border border-primary-orange/30">
              {differences.changed.length === 0
                ? "No scenario differences detected"
                : `${differences.changed.length} parameter${differences.changed.length > 1 ? "s" : ""} modified`}
            </span>
          </div>

          {differences.changed.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">
              Plan A and Plan B currently have identical inputs. Modify a field in Plan B to compare scenarios.
            </p>
          ) : (
            <div className="space-y-3">
              {differences.changed.map((param) => (
                <div key={param.field} className="p-3 rounded-2xl bg-[#040810]/70 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">{param.label}</span>
                    <span className="text-[10px] text-primary-orange font-mono">Modified</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-surface border border-white/10 text-slate-400 font-mono truncate max-w-[140px]">
                      {param.value_a}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="px-2 py-0.5 rounded bg-primary-orange/20 border border-primary-orange/30 text-primary-orange font-mono truncate max-w-[140px]">
                      {param.value_b}
                    </span>
                  </div>
                  {param.impact_note && (
                    <p className="text-[11px] text-slate-400 mt-1">{param.impact_note}</p>
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
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Unchanged Parameters</h2>
            </div>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {differences.unchanged.length} constant
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {differences.unchanged.map((item) => (
              <div key={item.field} className="p-2.5 rounded-xl bg-[#040810]/60 border border-white/5">
                <span className="text-slate-400 text-[10px] block">{item.label}</span>
                <span className="font-mono text-slate-200 truncate block mt-0.5">{item.value}</span>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 italic pt-1">
            Controlled factors ensure model predictions evaluate the intended parameter modifications.
          </p>
        </div>
      </div>

      {/* SECTION: Dedicated Media Content Comparison (if media uploaded) */}
      {(planA.media || planB.media) && (
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-border/80 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <ImageIcon className="w-5 h-5 text-primary-orange" />
              <div>
                <h2 className="text-base font-bold text-white">Content Comparison</h2>
                <p className="text-xs text-slate-400">Side-by-side technical media profile</p>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Uploaded files</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Plan A Media Profile */}
            <div className="p-4 rounded-2xl bg-[#040810]/70 border border-white/10 space-y-3">
              <span className="text-xs font-bold text-slate-300 block pb-1 border-b border-white/5">
                Plan A Content
              </span>
              {planA.media ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Format & Type</span>
                    <span className="text-white font-mono">{planA.media.format} ({planA.mediaType.toUpperCase()})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Aspect Ratio</span>
                    <span className="text-white font-mono">{planA.media.aspectRatio}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Dimensions</span>
                    <span className="text-white font-mono">{planA.media.width} × {planA.media.height} px</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Playback Duration</span>
                    <span className="text-white font-mono">
                      {planA.media.durationSec ? `${planA.media.durationSec}s` : "Static (Image)"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Audio Stream</span>
                    <span className="text-white font-mono">
                      {planA.mediaType === "reel" ? (planA.media.audioDetected ? "Detected in Video" : "No Audio Track") : "Not applicable (Image)"}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No media file uploaded for Plan A.</p>
              )}
            </div>

            {/* Plan B Media Profile */}
            <div className="p-4 rounded-2xl bg-[#040810]/70 border border-white/10 space-y-3">
              <span className="text-xs font-bold text-slate-300 block pb-1 border-b border-white/5">
                Plan B Content
              </span>
              {planB.media ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Format & Type</span>
                    <span className="text-white font-mono">{planB.media.format} ({planB.mediaType.toUpperCase()})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Aspect Ratio</span>
                    <span className="text-white font-mono">{planB.media.aspectRatio}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Dimensions</span>
                    <span className="text-white font-mono">{planB.media.width} × {planB.media.height} px</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Playback Duration</span>
                    <span className="text-white font-mono">
                      {planB.media.durationSec ? `${planB.media.durationSec}s` : "Static (Image)"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Audio Stream</span>
                    <span className="text-white font-mono">
                      {planB.mediaType === "reel" ? (planB.media.audioDetected ? "Detected in Video" : "No Audio Track") : "Not applicable (Image)"}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No media file uploaded for Plan B.</p>
              )}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 italic">
            Media characteristics are shown from the uploaded files.
          </p>
        </div>
      )}

      {/* SECTION: Model Results & Comparison Card */}
      {delta !== null && resA && resB && (
        <div className="glass-card-accent p-6 md:p-10 rounded-3xl animate-fade-in space-y-8">
          {/* Main Delta Result Header */}
          <div className="text-center space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-300">
              Model-Estimated Engagement Difference
            </span>

            <div className="flex items-center justify-center gap-3">
              {delta > 0 ? (
                <div className="p-2 rounded-2xl bg-emerald-500/20 text-emerald-400">
                  <TrendingUp className="w-8 h-8" />
                </div>
              ) : delta < 0 ? (
                <div className="p-2 rounded-2xl bg-rose-500/20 text-rose-400">
                  <TrendingDown className="w-8 h-8" />
                </div>
              ) : (
                <div className="p-2 rounded-2xl bg-slate-500/20 text-slate-300">
                  <Sliders className="w-8 h-8" />
                </div>
              )}

              <div
                className={`text-4xl sm:text-6xl font-black font-mono ${
                  delta > 0 ? "text-emerald-400" : delta < 0 ? "text-rose-400" : "text-slate-300"
                }`}
              >
                {delta > 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)} pp
              </div>
            </div>

            <p className="text-sm text-slate-300 font-medium">
              Current (Plan A): <strong className="text-white">{resA.prediction.toFixed(2)}%</strong> → Alternative (Plan B):{" "}
              <strong className="text-white">{resB.prediction.toFixed(2)}%</strong>
            </p>

            <p className="text-xs text-slate-400 max-w-xl mx-auto">
              {delta > 0
                ? `Plan B is estimated at ${delta.toFixed(2)} percentage points higher by the current model.`
                : delta < 0
                ? `Plan B is estimated at ${Math.abs(delta).toFixed(2)} percentage points lower by the current model.`
                : "The model estimate is identical between Plan A and Plan B under current inputs."}
            </p>
          </div>

          {/* Uncertainty Intervals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-center space-y-1">
              <span className="text-slate-400 block font-medium">Plan A Uncertainty Interval</span>
              <strong className="text-white font-mono text-base block">
                {resA.lower.toFixed(2)}% — {resA.upper.toFixed(2)}%
              </strong>
              <span className="text-[11px] text-slate-400">Band: {resA.band}</span>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-center space-y-1">
              <span className="text-slate-400 block font-medium">Plan B Uncertainty Interval</span>
              <strong className="text-white font-mono text-base block">
                {resB.lower.toFixed(2)}% — {resB.upper.toFixed(2)}%
              </strong>
              <span className="text-[11px] text-slate-400">Band: {resB.band}</span>
            </div>
          </div>

          {/* Overlap Caution & Disclaimer */}
          <div className="space-y-2">
            {intervalsOverlap && (
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-center gap-2 text-center">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  The scenario intervals overlap; the estimated difference should therefore be interpreted cautiously.
                </span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-[#040810]/70 border border-white/10 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Info className="w-4 h-4 text-primary-orange shrink-0" />
              <span>
                The intervals represent model uncertainty and are not guarantees of future performance.
              </span>
            </div>
          </div>

          {/* THREE-TIER SEPARATION: Extracted Signals vs Model Inputs vs Model Estimate */}
          <div className="p-6 rounded-2xl bg-black/40 border border-white/10 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary-orange" />
                Layer Separation: Signals vs Model Inputs vs Estimate
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Scientific distinction</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tier 1: Extracted Media Signals */}
              <div className="p-3.5 rounded-xl bg-[#040810]/60 border border-white/5 space-y-2">
                <div className="flex items-center gap-1.5 text-primary-orange font-bold uppercase text-[11px]">
                  <Video className="w-3.5 h-3.5" />
                  <span>1. Media Signals (Extracted)</span>
                </div>
                <ul className="text-slate-300 text-[11px] space-y-1 list-disc list-inside">
                  <li>Plan A: {planA.media ? `${planA.media.aspectRatio}, ${planA.media.width}×${planA.media.height}` : "No file (Text only)"}</li>
                  <li>Plan B: {planB.media ? `${planB.media.aspectRatio}, ${planB.media.width}×${planB.media.height}` : "No file (Text only)"}</li>
                  <li>Audio: {planA.mediaType === "reel" ? planA.audioName || planA.audioType : "Not applicable"} → {planB.mediaType === "reel" ? planB.audioName || planB.audioType : "Not applicable"}</li>
                </ul>
                <p className="text-[10px] text-slate-500 italic pt-1">Extracted for pre-publication validation.</p>
              </div>

              {/* Tier 2: Model Inputs */}
              <div className="p-3.5 rounded-xl bg-[#040810]/60 border border-white/5 space-y-2">
                <div className="flex items-center gap-1.5 text-primary-coral font-bold uppercase text-[11px]">
                  <FileText className="w-3.5 h-3.5" />
                  <span>2. Model Inputs (Trained)</span>
                </div>
                <ul className="text-slate-300 text-[11px] space-y-1 list-disc list-inside">
                  <li>Media Type: {planA.mediaType.toUpperCase()} → {planB.mediaType.toUpperCase()}</li>
                  <li>Caption Length: {planA.caption.length} → {planB.caption.length} chars</li>
                  <li>Posting Hour: {planA.time} → {planB.time} UTC</li>
                  <li>Followers: {planA.followers.toLocaleString()} → {planB.followers.toLocaleString()}</li>
                </ul>
                <p className="text-[10px] text-slate-500 italic pt-1">Used by trained regression model.</p>
              </div>

              {/* Tier 3: Model Estimate */}
              <div className="p-3.5 rounded-xl bg-[#040810]/60 border border-white/5 space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase text-[11px]">
                  <Zap className="w-3.5 h-3.5" />
                  <span>3. Model Estimate (Output)</span>
                </div>
                <ul className="text-slate-300 text-[11px] space-y-1 list-disc list-inside">
                  <li>Plan A Rate: {resA.prediction.toFixed(2)}%</li>
                  <li>Plan B Rate: {resB.prediction.toFixed(2)}%</li>
                  <li>Delta: {delta >= 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)} pp</li>
                </ul>
                <p className="text-[10px] text-slate-500 italic pt-1">Observational prediction from trained data.</p>
              </div>
            </div>
          </div>

          {/* SECTION: Model Sensitivity Analysis */}
          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary-orange" />
                Scenario Sensitivity
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Input impact</span>
            </div>

            <p className="text-slate-300">
              The model estimate changed by{" "}
              <strong className={delta >= 0 ? "text-emerald-400" : "text-rose-400"}>
                {delta >= 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)} percentage points
              </strong>{" "}
              after the selected scenario changes.
            </p>

            <div className="space-y-1.5 pt-1">
              <span className="text-slate-400 text-[11px] block font-semibold">Changed inputs:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
                {differences.changed.map((param) => (
                  <li key={param.field}>
                    <strong>{param.label}:</strong> {param.value_a} → {param.value_b}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* SECTION: Model Capability & Scientific Integrity */}
          <div className="p-5 rounded-2xl bg-[#040810]/80 border border-white/10 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-primary-coral" />
              <span>Model Limitation & Scientific Integrity</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              <strong>Prediction status:</strong> The current model prediction reflects the trained structured and text features available to it (caption properties, media type, timing, followers). Uploaded visual and audio characteristics are analyzed separately for content verification and are not treated as predictive inputs unless the model was trained on those features.
            </p>
          </div>

          {/* SECTION: Interpretation / What You Could Test Next */}
          <div className="p-5 rounded-2xl bg-surface/50 border border-white/10 space-y-3 text-xs">
            <span className="font-bold text-white uppercase tracking-wider block">What You Could Test Next</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                onClick={() => handleApplyPreset("time")}
                className="p-3 rounded-xl bg-[#040810]/60 border border-white/10 hover:border-primary-orange/50 cursor-pointer transition-colors"
              >
                <Clock className="w-4 h-4 text-primary-orange mb-1.5" />
                <strong className="text-white block mb-1">Posting Time</strong>
                <p className="text-[11px] text-slate-400">Test publishing during peak evening hours (19:00 UTC).</p>
              </div>

              <div
                onClick={() => handleApplyPreset("caption")}
                className="p-3 rounded-xl bg-[#040810]/60 border border-white/10 hover:border-primary-orange/50 cursor-pointer transition-colors"
              >
                <Type className="w-4 h-4 text-primary-coral mb-1.5" />
                <strong className="text-white block mb-1">Caption Structure</strong>
                <p className="text-[11px] text-slate-400">Test adding an interactive question or concise call-to-action.</p>
              </div>

              <div
                onClick={() => handleApplyPreset("mediaType")}
                className="p-3 rounded-xl bg-[#040810]/60 border border-white/10 hover:border-primary-orange/50 cursor-pointer transition-colors"
              >
                <Video className="w-4 h-4 text-primary-pink mb-1.5" />
                <strong className="text-white block mb-1">Media Format</strong>
                <p className="text-[11px] text-slate-400">Test format sensitivity by switching between Image and Reel.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="text-center text-xs text-slate-400 pt-4">
        <p>Uploaded media is used for scenario analysis and is not automatically added to model training data.</p>
      </div>
    </div>
  );
}
