"use client";

import React, { useState } from "react";
import {
  Sparkles,
  AlertTriangle,
  Info,
  Calendar,
  Clock,
  Users,
  Film,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { predictPost } from "@/lib/api";
import { ModelStatusResponse, PredictionResultData } from "@/types";

interface PredictViewProps {
  modelStatus: ModelStatusResponse | null;
}

export default function PredictView({ modelStatus }: PredictViewProps) {
  const isTrained = Boolean(modelStatus?.trained);

  // Form state
  const [caption, setCaption] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "carousel" | "reel">("image");
  const [followers, setFollowers] = useState<number>(1000);
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState<string>("19:00");

  // Submission state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResultData | null>(null);

  // Live text calculations
  const charCount = caption.length;
  const wordCount = caption.trim() ? caption.trim().split(/\s+/).length : 0;
  const hashtagCount = (caption.match(/(?<!\w)#\w+/g) || []).length;
  const mentionCount = (caption.match(/(?<!\w)@\w+/g) || []).length;
  const emojiCount = (caption.match(/[^\x00-\x7F]/g) || []).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTrained) {
      setError("The model is not trained yet. Train the model using a validated dataset before requesting predictions.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await predictPost({
        caption,
        media_type: mediaType,
        followers_at_or_near_collection: followers,
        published_at: `${date}T${time}:00Z`,
        date,
        time,
      });

      if (response.success && response.result) {
        setResult(response.result);
      } else {
        throw new Error("Invalid response received from prediction API.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to calculate prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getBandBadge = (band: "Low" | "Medium" | "High") => {
    switch (band) {
      case "High":
        return "bg-emerald-950/60 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(52,211,153,0.2)]";
      case "Medium":
        return "bg-amber-950/60 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(251,191,36,0.2)]";
      case "Low":
      default:
        return "bg-rose-950/60 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.2)]";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Page Title & Guidelines */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Predict Post Performance
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Only pre-publication information known prior to publishing is used.
            Likes, comments, reach, and views are strictly excluded.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-border text-xs text-slate-300">
          <Info className="w-4 h-4 text-primary-orange shrink-0" />
          <span>No Instagram login or API required</span>
        </div>
      </div>

      {/* Untrained model alert */}
      {!isTrained && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-300">Model Not Trained</p>
            <p className="text-xs text-amber-200/80 mt-0.5">
              Predictions require an offline trained model artifact (`models/final_model.joblib`).
              You can explore the form inputs, or run the training pipeline with a validated CSV dataset.
            </p>
          </div>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-rose-300">Prediction Error</p>
            <p className="text-xs text-rose-200/90 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Prediction Form & Result Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 rounded-3xl space-y-6 border-border/80">
            {/* Caption Area */}
            <div>
              <label htmlFor="caption-input" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Planned Post Caption
              </label>
              <textarea
                id="caption-input"
                rows={5}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write the caption you plan to publish with your post..."
                className="w-full rounded-2xl bg-[#040810]/70 border border-border focus:border-primary-orange focus:ring-1 focus:ring-primary-orange p-4 text-sm text-white placeholder-slate-500 transition-all resize-y"
              />

              {/* Caption Stats Bar */}
              <div className="flex flex-wrap gap-2 mt-2.5 text-[11px] text-slate-400">
                <span className="px-2.5 py-1 rounded-lg bg-surface border border-border">
                  {charCount} characters
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-surface border border-border">
                  {wordCount} words
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-surface border border-border">
                  {hashtagCount} hashtags
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-surface border border-border">
                  {mentionCount} mentions
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-surface border border-border">
                  {emojiCount} emojis
                </span>
              </div>
            </div>

            {/* Media Type & Followers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="media-select" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  <Film className="w-3.5 h-3.5 inline mr-1 text-primary-orange" />
                  Media Type
                </label>
                <select
                  id="media-select"
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value as any)}
                  className="w-full rounded-xl bg-[#040810]/70 border border-border focus:border-primary-orange focus:ring-1 focus:ring-primary-orange p-3 text-sm text-white transition-all"
                >
                  <option value="image">Image Post</option>
                  <option value="carousel">Carousel (Multi-Slide)</option>
                  <option value="reel">Reel / Video</option>
                </select>
              </div>

              <div>
                <label htmlFor="follower-input" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  <Users className="w-3.5 h-3.5 inline mr-1 text-primary-orange" />
                  Follower Count
                </label>
                <input
                  id="follower-input"
                  type="number"
                  min={1}
                  value={followers}
                  onChange={(e) => setFollowers(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full rounded-xl bg-[#040810]/70 border border-border focus:border-primary-orange focus:ring-1 focus:ring-primary-orange p-3 text-sm text-white transition-all"
                />
              </div>
            </div>

            {/* Publication Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date-input" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  <Calendar className="w-3.5 h-3.5 inline mr-1 text-primary-orange" />
                  Publication Date
                </label>
                <input
                  id="date-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl bg-[#040810]/70 border border-border focus:border-primary-orange focus:ring-1 focus:ring-primary-orange p-3 text-sm text-white transition-all"
                />
              </div>

              <div>
                <label htmlFor="time-input" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  <Clock className="w-3.5 h-3.5 inline mr-1 text-primary-orange" />
                  Publication Time (UTC)
                </label>
                <input
                  id="time-input"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-xl bg-[#040810]/70 border border-border focus:border-primary-orange focus:ring-1 focus:ring-primary-orange p-3 text-sm text-white transition-all"
                />
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3.5 text-base disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Calculating Model Prediction...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Analyze Performance →
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Prediction Output */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <div className="space-y-6 animate-fade-in">
              {/* Main Result Card */}
              <div className="glass-card-accent p-8 text-center space-y-4 shadow-[0_12px_30px_rgba(0,0,0,0.4)]">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">
                  Expected Engagement Rate
                </span>

                <div className="text-5xl sm:text-6xl font-black text-white tracking-tight">
                  {result.prediction.toFixed(2)}%
                </div>

                {/* Interval & Band */}
                <div className="pt-2 flex flex-col items-center gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border border-white/10 bg-black/30 text-slate-200">
                    <span>90% Uncertainty Interval:</span>
                    <strong className="text-white font-mono">
                      {result.lower.toFixed(2)}% – {result.upper.toFixed(2)}%
                    </strong>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Performance Band:</span>
                    <span
                      className={`px-3 py-0.5 rounded-full text-xs font-bold border ${getBandBadge(
                        result.band
                      )}`}
                    >
                      {result.band} Engagement
                    </span>
                  </div>
                </div>
              </div>

              {/* Extracted Feature Signals */}
              <div className="glass-card p-6 rounded-3xl border-border/80 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-ready" />
                    Pre-Publication Features Extracted
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">Leakage-Safe</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-surface border border-border">
                    <span className="text-slate-400 block text-[10px]">Posting Hour</span>
                    <span className="font-mono font-semibold text-white">
                      {result.features.posting_hour !== undefined ? `${result.features.posting_hour}:00` : "--"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface border border-border">
                    <span className="text-slate-400 block text-[10px]">Day of Week</span>
                    <span className="font-mono font-semibold text-white">
                      {result.features.is_weekend ? "Weekend" : "Weekday"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface border border-border">
                    <span className="text-slate-400 block text-[10px]">Hashtags</span>
                    <span className="font-mono font-semibold text-white">
                      {result.features.hashtag_count ?? 0}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface border border-border">
                    <span className="text-slate-400 block text-[10px]">Follower Base</span>
                    <span className="font-mono font-semibold text-white">
                      {followers.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#040810]/60 border border-white/5 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-primary-orange shrink-0 mt-0.5" />
                  <span>
                    Feature contributions describe empirical model-learned associations in historical data,
                    not causal claims. Outcomes are subject to natural variance.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-8 rounded-3xl border-border/80 text-center flex flex-col items-center justify-center min-h-[350px] space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-primary-orange/10 border border-primary-orange/20 flex items-center justify-center text-primary-orange">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Ready for Analysis
              </h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Fill out the post publishing parameters on the left and click
                &quot;Analyze Performance&quot; to compute the model&apos;s engagement forecast.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
