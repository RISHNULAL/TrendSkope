"use client";

import React, { useState } from "react";
import {
  GitCompare,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  Sliders,
} from "lucide-react";
import { predictPost } from "@/lib/api";
import { ModelStatusResponse, PredictionResultData } from "@/types";

interface WhatIfViewProps {
  modelStatus: ModelStatusResponse | null;
}

interface ScenarioFormState {
  caption: string;
  mediaType: "image" | "carousel" | "reel";
  followers: number;
  date: string;
  time: string;
}

export default function WhatIfView({ modelStatus }: WhatIfViewProps) {
  const isTrained = Boolean(modelStatus?.trained);

  const today = new Date().toISOString().split("T")[0];

  const [currentScenario, setCurrentScenario] = useState<ScenarioFormState>({
    caption: "Excited to share our latest project milestone! Check out the link in bio #launch #tech",
    mediaType: "image",
    followers: 2500,
    date: today,
    time: "14:00",
  });

  const [altScenario, setAltScenario] = useState<ScenarioFormState>({
    caption: "✨ Revealing the full journey behind our newest release. Which feature are you most excited to try? Drop a comment below! 🔥 #innovation #buildinpublic #creative #community",
    mediaType: "carousel",
    followers: 2500,
    date: today,
    time: "19:00",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resA, setResA] = useState<PredictionResultData | null>(null);
  const [resB, setResB] = useState<PredictionResultData | null>(null);

  const handleCompare = async () => {
    if (!isTrained) {
      setError("Model is not trained yet. Train the model using a validated dataset before comparing scenarios.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [respA, respB] = await Promise.all([
        predictPost({
          caption: currentScenario.caption,
          media_type: currentScenario.mediaType,
          followers_at_or_near_collection: currentScenario.followers,
          published_at: `${currentScenario.date}T${currentScenario.time}:00Z`,
        }),
        predictPost({
          caption: altScenario.caption,
          media_type: altScenario.mediaType,
          followers_at_or_near_collection: altScenario.followers,
          published_at: `${altScenario.date}T${altScenario.time}:00Z`,
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

  const delta = resA && resB ? resB.prediction - resA.prediction : null;

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            What-If Scenario Comparison
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Compare a publishing plan with a model-estimated alternative to evaluate predicted response sensitivity.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-border text-xs text-slate-300">
          <Sliders className="w-4 h-4 text-primary-orange shrink-0" />
          <span>Controllable parameters only</span>
        </div>
      </div>

      {/* Untrained model alert */}
      {!isTrained && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-300">Model Not Trained</p>
            <p className="text-xs text-amber-200/80 mt-0.5">
              What-if comparisons require an offline trained model. Train a model with a validated CSV dataset to compare scenarios.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-sm">
          {error}
        </div>
      )}

      {/* Comparison Results Card */}
      {delta !== null && resA && resB && (
        <div className="glass-card-accent p-6 md:p-8 rounded-3xl animate-fade-in space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
              Model-Estimated Engagement Delta
            </span>

            <div className="flex items-center justify-center gap-3">
              {delta >= 0 ? (
                <div className="p-2 rounded-2xl bg-emerald-500/20 text-emerald-400">
                  <TrendingUp className="w-8 h-8" />
                </div>
              ) : (
                <div className="p-2 rounded-2xl bg-rose-500/20 text-rose-400">
                  <TrendingDown className="w-8 h-8" />
                </div>
              )}
              <div
                className={`text-4xl sm:text-5xl font-black ${
                  delta >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {delta >= 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)} pp
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Current: <strong className="text-white">{resA.prediction.toFixed(2)}%</strong> → Alternative:{" "}
              <strong className="text-white">{resB.prediction.toFixed(2)}%</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/10 text-xs">
            <div className="p-4 rounded-2xl bg-black/30 border border-white/10 text-center">
              <span className="text-slate-400 block mb-1">Scenario A Interval</span>
              <strong className="text-white font-mono text-sm">
                {resA.lower.toFixed(2)}% – {resA.upper.toFixed(2)}% ({resA.band})
              </strong>
            </div>
            <div className="p-4 rounded-2xl bg-black/30 border border-white/10 text-center">
              <span className="text-slate-400 block mb-1">Scenario B Interval</span>
              <strong className="text-white font-mono text-sm">
                {resB.lower.toFixed(2)}% – {resB.upper.toFixed(2)}% ({resB.band})
              </strong>
            </div>
          </div>

          {/* Research Disclaimer */}
          <div className="p-3 rounded-xl bg-[#040810]/70 border border-white/10 text-center text-xs text-amber-200/90 flex items-center justify-center gap-2">
            <Info className="w-4 h-4 text-primary-orange shrink-0" />
            <span>
              Model-estimated scenario — not guaranteed real-world improvement. Observational estimates reflect learned associations.
            </span>
          </div>
        </div>
      )}

      {/* Two Column Input Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scenario A: Current */}
        <div className="glass-card p-6 md:p-8 rounded-3xl space-y-5 border-border/80">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              Current Scenario (Plan A)
            </h2>
            <span className="text-xs text-slate-400 font-mono">Baseline</span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label htmlFor="caption-a" className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Caption
              </label>
              <textarea
                id="caption-a"
                rows={4}
                value={currentScenario.caption}
                onChange={(e) =>
                  setCurrentScenario({ ...currentScenario, caption: e.target.value })
                }
                className="w-full rounded-xl bg-[#040810]/70 border border-border p-3 text-white text-xs placeholder-slate-500 focus:border-primary-orange"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                {currentScenario.caption.length} chars ·{" "}
                {(currentScenario.caption.match(/(?<!\w)#\w+/g) || []).length} hashtags
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="media-a" className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Media Type
                </label>
                <select
                  id="media-a"
                  value={currentScenario.mediaType}
                  onChange={(e) =>
                    setCurrentScenario({
                      ...currentScenario,
                      mediaType: e.target.value as any,
                    })
                  }
                  className="w-full rounded-xl bg-[#040810]/70 border border-border p-2.5 text-white"
                >
                  <option value="image">Image</option>
                  <option value="carousel">Carousel</option>
                  <option value="reel">Reel</option>
                </select>
              </div>

              <div>
                <label htmlFor="followers-a" className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Followers
                </label>
                <input
                  id="followers-a"
                  type="number"
                  min={1}
                  value={currentScenario.followers}
                  onChange={(e) =>
                    setCurrentScenario({
                      ...currentScenario,
                      followers: Math.max(1, parseInt(e.target.value) || 1),
                    })
                  }
                  className="w-full rounded-xl bg-[#040810]/70 border border-border p-2.5 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="date-a" className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Date
                </label>
                <input
                  id="date-a"
                  type="date"
                  value={currentScenario.date}
                  onChange={(e) =>
                    setCurrentScenario({ ...currentScenario, date: e.target.value })
                  }
                  className="w-full rounded-xl bg-[#040810]/70 border border-border p-2.5 text-white"
                />
              </div>

              <div>
                <label htmlFor="time-a" className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Time (UTC)
                </label>
                <input
                  id="time-a"
                  type="time"
                  value={currentScenario.time}
                  onChange={(e) =>
                    setCurrentScenario({ ...currentScenario, time: e.target.value })
                  }
                  className="w-full rounded-xl bg-[#040810]/70 border border-border p-2.5 text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scenario B: Alternative */}
        <div className="glass-card p-6 md:p-8 rounded-3xl space-y-5 border-border/80">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-orange animate-pulse" />
              Alternative Scenario (Plan B)
            </h2>
            <span className="text-xs text-primary-orange font-mono">Variation</span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label htmlFor="caption-b" className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Caption
              </label>
              <textarea
                id="caption-b"
                rows={4}
                value={altScenario.caption}
                onChange={(e) =>
                  setAltScenario({ ...altScenario, caption: e.target.value })
                }
                className="w-full rounded-xl bg-[#040810]/70 border border-border p-3 text-white text-xs placeholder-slate-500 focus:border-primary-orange"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                {altScenario.caption.length} chars ·{" "}
                {(altScenario.caption.match(/(?<!\w)#\w+/g) || []).length} hashtags
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="media-b" className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Media Type
                </label>
                <select
                  id="media-b"
                  value={altScenario.mediaType}
                  onChange={(e) =>
                    setAltScenario({
                      ...altScenario,
                      mediaType: e.target.value as any,
                    })
                  }
                  className="w-full rounded-xl bg-[#040810]/70 border border-border p-2.5 text-white"
                >
                  <option value="image">Image</option>
                  <option value="carousel">Carousel</option>
                  <option value="reel">Reel</option>
                </select>
              </div>

              <div>
                <label htmlFor="followers-b" className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Followers
                </label>
                <input
                  id="followers-b"
                  type="number"
                  min={1}
                  value={altScenario.followers}
                  onChange={(e) =>
                    setAltScenario({
                      ...altScenario,
                      followers: Math.max(1, parseInt(e.target.value) || 1),
                    })
                  }
                  className="w-full rounded-xl bg-[#040810]/70 border border-border p-2.5 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="date-b" className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Date
                </label>
                <input
                  id="date-b"
                  type="date"
                  value={altScenario.date}
                  onChange={(e) =>
                    setAltScenario({ ...altScenario, date: e.target.value })
                  }
                  className="w-full rounded-xl bg-[#040810]/70 border border-border p-2.5 text-white"
                />
              </div>

              <div>
                <label htmlFor="time-b" className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Time (UTC)
                </label>
                <input
                  id="time-b"
                  type="time"
                  value={altScenario.time}
                  onChange={(e) =>
                    setAltScenario({ ...altScenario, time: e.target.value })
                  }
                  className="w-full rounded-xl bg-[#040810]/70 border border-border p-2.5 text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compare Action Button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={handleCompare}
          disabled={loading}
          className="btn-primary px-8 py-3.5 text-base"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Comparing Scenarios...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <GitCompare className="w-5 h-5" />
              Compare Scenarios →
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
