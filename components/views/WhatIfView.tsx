"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
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
  Copy,
  Check,
  Download,
  Layers,
  Sparkles,
  RotateCcw,
  Target,
  BarChart3,
  Eye,
  CheckSquare,
} from "lucide-react";
import { compareScenarios, compareScenariosMultipart } from "@/lib/api";
import {
  ModelStatusResponse,
  CompareScenariosResponse,
  ScenarioTemplateItem,
  QualityPillarComparison,
  SmartRecommendationItem,
} from "@/types";
import ScenarioPostCard, { StudioScenarioFormState } from "@/components/studio/ScenarioPostCard";
import WhatIfUncertaintyChart from "@/components/studio/WhatIfUncertaintyChart";

interface WhatIfViewProps {
  modelStatus: ModelStatusResponse | null;
}

export default function WhatIfView({ modelStatus }: WhatIfViewProps) {
  const isTrained = Boolean(modelStatus?.trained);
  const today = new Date().toISOString().split("T")[0];

  // Comparison Mode: "single" (isolate one variable) | "multiple" (full alternate scenario)
  const [comparisonMode, setComparisonMode] = useState<"single" | "multiple">("single");

  // Selected Active Template ID (optional highlight)
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>("hook_split_test");

  // Scenario A Form State (Original / Baseline)
  const [scenarioA, setScenarioA] = useState<StudioScenarioFormState>({
    name: "Scenario A — Original",
    caption:
      "We are releasing our new creator analytics dashboard today. Link in bio to try it out. #analytics #creators #marketing #socialmedia",
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
    rawFile: null,
    carouselItems: [],
    carouselFiles: [],
  });

  // Scenario B Form State (Alternative Variation)
  const [scenarioB, setScenarioB] = useState<StudioScenarioFormState>({
    name: "Scenario B — Alternative",
    caption:
      "Which metric actually predicts your post reach? We rebuilt our analytics engine to find out—and the answer surprised us. Which stat do you watch closest? Drop a comment below! 🔥 #analytics #creators #datascience #socialmedia",
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
    rawFile: null,
    carouselItems: [],
    carouselFiles: [],
  });

  // API Interaction State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparisonResponse, setComparisonResponse] = useState<CompareScenariosResponse | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedRecId, setCopiedRecId] = useState<string | null>(null);
  const [appliedRecId, setAppliedRecId] = useState<string | null>(null);

  const resultRef = useRef<HTMLDivElement | null>(null);

  // Smooth scroll ONLY after user explicitly clicks Compare and results arrive
  const hasTriggeredCompare = useRef(false);
  useEffect(() => {
    if (comparisonResponse && hasTriggeredCompare.current && resultRef.current) {
      hasTriggeredCompare.current = false;
      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });
      });
    }
  }, [comparisonResponse]);

  // Compute live changed fields between Scenario A and Scenario B
  const changedFieldsSet = useMemo(() => {
    const set = new Set<string>();
    if (scenarioA.mediaType !== scenarioB.mediaType) set.add("media_type");
    if (scenarioA.caption.trim() !== scenarioB.caption.trim()) set.add("caption");
    if (scenarioA.followers !== scenarioB.followers) set.add("followers");
    if (scenarioA.time !== scenarioB.time) set.add("time");
    if (scenarioA.date !== scenarioB.date) set.add("date");
    if (scenarioA.category !== scenarioB.category) set.add("category");
    if (scenarioA.goal !== scenarioB.goal) set.add("goal");
    if (scenarioA.audioName !== scenarioB.audioName) set.add("audio");
    return set;
  }, [scenarioA, scenarioB]);

  // Built-in Templates
  const templates: ScenarioTemplateItem[] = useMemo(
    () => [
      {
        id: "hook_split_test",
        name: "Hook Split Test",
        tagline: "Question Hook vs Announcement",
        category: "Copywriting",
        description: "Tests an intriguing question hook against a standard passive announcement.",
        scenario_a: {
          name: "Original Announcement",
          caption:
            "We are releasing our new creator analytics dashboard today. Link in bio to try it out. #analytics #creators #marketing #socialmedia",
          media_type: "image",
          followers: 2500,
          date: today,
          time: "19:00",
          category: "Technology",
          goal: "Engagement",
        },
        scenario_b: {
          name: "Curiosity Question Hook",
          caption:
            "Which metric actually predicts your post reach? We rebuilt our analytics engine to find out—and the answer surprised us. Which stat do you watch closest? Drop a comment below! 🔥 #analytics #creators #datascience #socialmedia",
          media_type: "image",
          followers: 2500,
          date: today,
          time: "19:00",
          category: "Technology",
          goal: "Engagement",
        },
      },
      {
        id: "cta_clarity",
        name: "CTA Clarity Test",
        tagline: "Conversational CTA vs Passive Link",
        category: "Engagement",
        description: "Examines whether an explicit conversation question prompts more comments.",
        scenario_a: {
          name: "Passive Link CTA",
          caption:
            "Here are 3 tips to streamline your content creation process: 1. Batch produce 2. Schedule ahead 3. Repurpose top performing posts. Check the link in our bio for details. #tips #creators #productivity",
          media_type: "image",
          followers: 3000,
          date: today,
          time: "18:00",
          category: "Education",
          goal: "Engagement",
        },
        scenario_b: {
          name: "Actionable Question CTA",
          caption:
            "Here are 3 tips to streamline your content creation process:\n\n1. Batch produce\n2. Schedule ahead\n3. Repurpose top performing posts\n\nWhich of these 3 habits made the biggest difference in your routine this month? Save this for your next planning session! 📌 #productivity #creators #contentstrategy",
          media_type: "image",
          followers: 3000,
          date: today,
          time: "18:00",
          category: "Education",
          goal: "Engagement",
        },
      },
      {
        id: "storytelling_vs_short",
        name: "Storytelling vs Short",
        tagline: "Detailed Narrative vs Quick Note",
        category: "Length",
        description: "Compares an in-depth behind-the-scenes narrative against a punchy note.",
        scenario_a: {
          name: "Short Punchy Note",
          caption:
            "Late nights in the studio paying off. Big update dropping Friday! Stay tuned. ✨ #buildinpublic #behindthescenes",
          media_type: "image",
          followers: 4500,
          date: today,
          time: "18:30",
          category: "Lifestyle",
          goal: "Awareness",
        },
        scenario_b: {
          name: "Detailed Behind-The-Scenes",
          caption:
            "Three weeks ago, our entire design system looked completely different.\n\nWe scraped 40 mockups and started fresh because the user experience didn't feel seamless enough. After 120 user tests, we finally unlocked a flow that cuts publishing time in half.\n\nWhat is one project you had to restart from scratch before getting it right? Tell us your story below! 💬 #buildinpublic #founders #productdesign #learning",
          media_type: "image",
          followers: 4500,
          date: today,
          time: "18:30",
          category: "Lifestyle",
          goal: "Engagement",
        },
      },
      {
        id: "format_image_vs_reel",
        name: "Format: Photo vs Reel",
        tagline: "Static Feed Image vs Video Reel",
        category: "Media Format",
        description: "Isolates media format under identical copy and timing.",
        scenario_a: {
          name: "Static Feed Image",
          caption:
            "Visual breakdown of the 2026 content distribution landscape. Save this framework to reference before your next campaign launch! 📊 #contentmarketing #digitalstrategy #trends",
          media_type: "image",
          followers: 5000,
          date: today,
          time: "19:00",
          category: "Business",
          goal: "Engagement",
        },
        scenario_b: {
          name: "Reel Video with Audio",
          caption:
            "Visual breakdown of the 2026 content distribution landscape. Save this framework to reference before your next campaign launch! 📊 #contentmarketing #digitalstrategy #trends",
          media_type: "reel",
          followers: 5000,
          date: today,
          time: "19:00",
          category: "Business",
          goal: "Reach",
          audio_name: "Trending Audio Sound",
          audio_type: "custom",
        },
      },
      {
        id: "timing_peak_vs_offpeak",
        name: "Publishing Time Test",
        tagline: "Morning Off-Peak vs Evening Peak",
        category: "Scheduling",
        description: "Compares morning timing (10:30 UTC) with prime evening hours (19:00 UTC).",
        scenario_a: {
          name: "Morning Schedule (10:30 UTC)",
          caption:
            "Quick morning thought: Consistency beats intensity every single time. What is one habit you never skip on weekdays? Let's discuss below! ☕ #morningroutine #discipline #growthmindset",
          media_type: "image",
          followers: 3200,
          date: today,
          time: "10:30",
          category: "Personal Development",
          goal: "Engagement",
        },
        scenario_b: {
          name: "Evening Schedule (19:00 UTC)",
          caption:
            "Quick morning thought: Consistency beats intensity every single time. What is one habit you never skip on weekdays? Let's discuss below! ☕ #morningroutine #discipline #growthmindset",
          media_type: "image",
          followers: 3200,
          date: today,
          time: "19:00",
          category: "Personal Development",
          goal: "Engagement",
        },
      },
      {
        id: "hashtag_consolidation",
        name: "Hashtag Allocation",
        tagline: "Targeted (3–5 tags) vs Dense Block",
        category: "Hashtags",
        description: "Tests whether focused tags outperform a cluster of 15+ broad hashtags.",
        scenario_a: {
          name: "High-Density Block",
          caption:
            "Mastering the fundamentals of natural light photography. Which setup is your go-to? #photo #photographer #photography #art #instaphoto #nature #love #camera #sony #canon #lighting #nikon #picoftheday #visuals #frame",
          media_type: "image",
          followers: 2000,
          date: today,
          time: "17:00",
          category: "Photography",
          goal: "Engagement",
        },
        scenario_b: {
          name: "Curated 4 Niche Tags",
          caption:
            "Mastering the fundamentals of natural light photography. Which setup is your go-to for outdoor golden hour shots? 📸 #naturallightphotography #portraitlighting #cameragear #phototips",
          media_type: "image",
          followers: 2000,
          date: today,
          time: "17:00",
          category: "Photography",
          goal: "Engagement",
        },
      },
    ],
    [today]
  );

  // Apply a template to the scenario editors
  const handleApplyTemplate = (tpl: ScenarioTemplateItem) => {
    setError(null);
    setActiveTemplateId(tpl.id);
    setScenarioA((prev) => ({
      ...prev,
      name: tpl.scenario_a.name,
      caption: tpl.scenario_a.caption,
      mediaType: tpl.scenario_a.media_type,
      followers: tpl.scenario_a.followers,
      date: tpl.scenario_a.date,
      time: tpl.scenario_a.time,
      category: tpl.scenario_a.category,
      goal: tpl.scenario_a.goal,
      media: null,
      rawFile: null,
      carouselItems: [],
      carouselFiles: [],
    }));
    setScenarioB((prev) => ({
      ...prev,
      name: tpl.scenario_b.name,
      caption: tpl.scenario_b.caption,
      mediaType: tpl.scenario_b.media_type,
      followers: tpl.scenario_b.followers,
      date: tpl.scenario_b.date,
      time: tpl.scenario_b.time,
      category: tpl.scenario_b.category,
      goal: tpl.scenario_b.goal,
      audioName: tpl.scenario_b.audio_name || "Original Audio",
      audioType: (tpl.scenario_b.audio_type as any) || "original",
      media: null,
      rawFile: null,
      carouselItems: [],
      carouselFiles: [],
    }));
  };

  // Duplicate Scenario A into Scenario B as an editable starting point
  const handleDuplicateA = () => {
    setScenarioB({
      ...scenarioA,
      name: `${scenarioA.name || "Scenario A"} (Copy)`,
      carouselItems: [...scenarioA.carouselItems],
      carouselFiles: scenarioA.carouselFiles ? [...scenarioA.carouselFiles] : [],
    });
  };

  // Reset Scenario B independently
  const handleResetB = () => {
    setScenarioB({
      name: "Scenario B — Alternative",
      caption: "",
      mediaType: "image",
      followers: scenarioA.followers,
      date: scenarioA.date,
      time: scenarioA.time,
      category: scenarioA.category,
      goal: scenarioA.goal,
      audioName: "Original Audio",
      audioType: "original",
      audioId: "",
      media: null,
      rawFile: null,
      carouselItems: [],
      carouselFiles: [],
    });
  };

  // Reset Scenario A independently
  const handleResetA = () => {
    setScenarioA({
      name: "Scenario A — Original",
      caption: "",
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
      rawFile: null,
      carouselItems: [],
      carouselFiles: [],
    });
  };

  // Run Comparison Prediction Pipeline
  const handleCompare = async () => {
    if (!isTrained) {
      setError("The prediction model is not trained yet. Train it on the Dataset page first.");
      return;
    }

    if (!scenarioA.caption.trim()) {
      setError("Please add a caption to Scenario A before comparing.");
      return;
    }
    if (!scenarioB.caption.trim()) {
      setError("Please add a caption to Scenario B before comparing.");
      return;
    }

    setLoading(true);
    setError(null);
    hasTriggeredCompare.current = true;

    try {
      const payloadData = {
        scenario_a: {
          name: scenarioA.name || "Scenario A",
          caption: scenarioA.caption,
          media_type: scenarioA.mediaType,
          followers: scenarioA.followers,
          date: scenarioA.date,
          time: scenarioA.time,
          category: scenarioA.category,
          goal: scenarioA.goal,
          audio_name: scenarioA.audioName,
          audio_type: scenarioA.audioType,
        },
        scenario_b: {
          name: scenarioB.name || "Scenario B",
          caption: scenarioB.caption,
          media_type: scenarioB.mediaType,
          followers: scenarioB.followers,
          date: scenarioB.date,
          time: scenarioB.time,
          category: scenarioB.category,
          goal: scenarioB.goal,
          audio_name: scenarioB.audioName,
          audio_type: scenarioB.audioType,
        },
        comparison_mode: comparisonMode,
      };

      let response: CompareScenariosResponse;

      // If user provided files for either scenario, use multipart endpoint
      if (scenarioA.rawFile || scenarioB.rawFile) {
        const formData = new FormData();
        formData.append("data", JSON.stringify(payloadData));
        if (scenarioA.rawFile) formData.append("file_a", scenarioA.rawFile);
        if (scenarioB.rawFile) formData.append("file_b", scenarioB.rawFile);
        response = await compareScenariosMultipart(formData);
      } else {
        // Standard JSON comparison
        response = await compareScenarios(payloadData);
      }

      if (response && response.success) {
        setComparisonResponse(response);
      } else {
        throw new Error("Comparison did not return valid result data.");
      }
    } catch (err: any) {
      setError(err.message || "Scenario comparison failed. Please check the backend connection.");
    } finally {
      setLoading(false);
    }
  };

  // Apply a smart recommendation directly to Scenario B
  const handleApplyRecommendation = (rec: SmartRecommendationItem) => {
    setAppliedRecId(rec.id);
    setScenarioB((prev) => {
      const updated = { ...prev };
      if (rec.action_payload?.caption) {
        updated.caption = rec.action_payload.caption;
      }
      if (rec.action_payload?.time) {
        updated.time = rec.action_payload.time;
      }
      if (rec.action_payload?.media_type) {
        updated.mediaType = rec.action_payload.media_type;
      }
      return updated;
    });

    setTimeout(() => setAppliedRecId(null), 2500);
  };

  // Copy suggested caption to clipboard
  const handleCopyCaption = (recId: string, captionText: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(captionText);
      setCopiedRecId(recId);
      setTimeout(() => setCopiedRecId(null), 2200);
    }
  };

  // Copy full Markdown comparison summary to clipboard
  const handleCopySummary = () => {
    if (!comparisonResponse || !navigator?.clipboard) return;

    const comp = comparisonResponse.comparison;
    const metrics = comparisonResponse.comparison_metrics;
    const whatChanged = comparisonResponse.what_changed;

    const summaryText = `# TrendSkope Content Comparison Studio Report
Generated: ${new Date().toUTCString()}

## 1. Executive Summary
- Scenario A Point Estimate: ${comp.prediction_a.prediction.toFixed(2)}% (${comp.prediction_a.band} Band, 90% CI: ${comp.prediction_a.lower.toFixed(2)}% - ${comp.prediction_a.upper.toFixed(2)}%)
- Scenario B Point Estimate: ${comp.prediction_b.prediction.toFixed(2)}% (${comp.prediction_b.band} Band, 90% CI: ${comp.prediction_b.lower.toFixed(2)}% - ${comp.prediction_b.upper.toFixed(2)}%)
- Absolute Difference: ${metrics?.delta_absolute !== undefined ? (metrics.delta_absolute > 0 ? `+${metrics.delta_absolute.toFixed(2)}` : metrics.delta_absolute.toFixed(2)) : comp.delta_pp} percentage points
- Relative Difference: ${metrics?.delta_relative_pct !== null && metrics?.delta_relative_pct !== undefined ? `${metrics.delta_relative_pct > 0 ? "+" : ""}${metrics.delta_relative_pct.toFixed(1)}%` : "N/A"}
- Uncertainty Bands Overlap: ${comp.intervals_overlap ? "Yes (High Overlap)" : "No (Distinct Intervals)"}
${metrics?.is_inconclusive ? "\n*Note: The model does not provide strong evidence that one scenario will outperform the other.*" : ""}

## 2. Parameter Differences (What Changed)
${whatChanged?.changed_parameters.map((p) => `- ${p.label}: "${p.value_a}" → "${p.value_b}"`).join("\n") || "No model-consumed inputs modified"}

## 3. Controlled Variables (What Stayed The Same)
${whatChanged?.unchanged_parameters.map((p) => `- ${p.label}: "${p.value}"`).join("\n") || "None"}

## 4. Craft Quality Scores
${comp.quality_a ? `- Scenario A Overall Quality: ${comp.quality_a.score}/100 (${comp.quality_a.band})` : ""}
${comp.quality_b ? `- Scenario B Overall Quality: ${comp.quality_b.score}/100 (${comp.quality_b.band})` : ""}
`;

    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2400);
  };

  // Download Report as JSON
  const handleDownloadReport = () => {
    if (!comparisonResponse) return;
    const blob = new Blob([JSON.stringify(comparisonResponse, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trendskope_comparison_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const comp = comparisonResponse?.comparison;
  const metrics = comparisonResponse?.comparison_metrics;
  const whatChanged = comparisonResponse?.what_changed;
  const qualityPillars = comp?.content_quality_comparison?.pillars || [];
  const smartRecs = comp?.smart_recommendations || [];
  const experimentProtocol = comp?.experiment_protocol;

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-16 text-[#242137]">
      {/* =========================================================================
          SECTION 1: STUDIO HEADER & INTRO
          ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E7E3F0] shadow-card relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0EBFF] border border-[#6C4DFF]/30 text-[#6C4DFF] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Content Comparison Studio
              </span>
              <span className="px-3 py-1 rounded-full bg-[#F8F7FC] border border-[#E7E3F0] text-[#68677D] text-xs font-mono">
                Model: Gradient Booster
              </span>
              <span className="px-3 py-1 rounded-full bg-[#F8F7FC] border border-[#E7E3F0] text-[#68677D] text-xs font-mono">
                90% Empirical CI
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#242137] tracking-tight flex items-center gap-3">
              Content Comparison Studio
            </h1>

            <p className="text-sm text-[#68677D] max-w-2xl leading-relaxed">
              Compare two content variations, understand what changes, and identify which improvements
              are worth testing in a controlled experiment.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-[#F8F7FC] p-1.5 rounded-xl border border-[#E7E3F0] self-start lg:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setComparisonMode("single")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                comparisonMode === "single"
                  ? "bg-[#6C4DFF] text-white shadow-sm"
                  : "text-[#68677D] hover:text-[#242137]"
              }`}
            >
              Isolate 1 Variable
            </button>
            <button
              type="button"
              onClick={() => setComparisonMode("multiple")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                comparisonMode === "multiple"
                  ? "bg-[#6C4DFF] text-white shadow-sm"
                  : "text-[#68677D] hover:text-[#242137]"
              }`}
            >
              Multi-Variable Alternative
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: SCENARIO TEMPLATES (PRESETS)
          ========================================================================= */}
      <div className="p-6 rounded-2xl bg-white border border-[#E7E3F0] shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E3F0]">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#6C4DFF]" />
            <h2 className="text-xs font-mono font-bold text-[#68677D] tracking-wide uppercase">
              Scenario Templates
            </h2>
          </div>
          <span className="text-xs text-[#68677D]">
            Click any template to populate editable starting values
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => handleApplyTemplate(tpl)}
              className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden group ${
                activeTemplateId === tpl.id
                  ? "bg-[#F0EBFF] border-[#6C4DFF] ring-1 ring-[#6C4DFF]/30"
                  : "bg-[#F8F7FC] hover:bg-white border-[#E7E3F0] hover:border-[#6C4DFF]/40 shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#68677D]">
                  {tpl.category}
                </span>
                {activeTemplateId === tpl.id && (
                  <span className="w-2 h-2 rounded-full bg-[#6C4DFF]" />
                )}
              </div>
              <strong className="text-xs font-bold text-[#242137] block mb-0.5 group-hover:text-[#6C4DFF] transition-colors">
                {tpl.name}
              </strong>
              <p className="text-[11px] text-[#68677D] line-clamp-1">{tpl.tagline}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Untrained Model Alert */}
      {!isTrained && (
        <div className="p-4 rounded-xl bg-[#FDF5EA] border border-[#E9A23B]/30 text-[#E9A23B] text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">The prediction model is not ready yet</p>
            <p className="mt-0.5 text-[#68677D] leading-relaxed">
              Train the model from the Dataset page before comparing scenario outcomes.
            </p>
          </div>
        </div>
      )}

      {/* Validation / Execution Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-[#FEEFF0] border border-[#F06F73]/30 text-[#F06F73] text-xs flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* =========================================================================
          SECTION 3: TWO COMPLETE SCENARIO EDITORS (SIDE-BY-SIDE)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Scenario A Card */}
        <ScenarioPostCard
          planId="A"
          title={scenarioA.name || "Scenario A — Original"}
          subtitle="Baseline post reference"
          state={scenarioA}
          onChange={setScenarioA}
          changedFields={changedFieldsSet}
          singleVariableMode={comparisonMode === "single"}
          onReset={handleResetA}
        />

        {/* Scenario B Card */}
        <ScenarioPostCard
          planId="B"
          title={scenarioB.name || "Scenario B — Alternative"}
          subtitle="Alternative variation being tested"
          state={scenarioB}
          onChange={setScenarioB}
          changedFields={changedFieldsSet}
          singleVariableMode={comparisonMode === "single"}
          onCopyFromA={handleDuplicateA}
          onReset={handleResetB}
        />
      </div>

      {/* =========================================================================
          SECTION 4: COMPARE ACTION BUTTON
          ========================================================================= */}
      <div className="flex flex-col items-center justify-center gap-3 pt-3">
        <button
          onClick={handleCompare}
          disabled={loading || !isTrained}
          className="px-9 py-3.5 rounded-xl bg-[#6C4DFF] hover:bg-[#5B3FE6] text-white font-bold text-sm shadow-purple-md disabled:opacity-50 transition-all active:scale-95 flex items-center gap-2.5"
        >
          {loading ? (
            <span className="flex items-center gap-2.5">
              <span className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin" />
              Running Multi-Pipeline Comparison...
            </span>
          ) : (
            <span className="flex items-center gap-2.5">
              <GitCompare className="w-4 h-4" />
              Compare Scenarios
            </span>
          )}
        </button>

        <p className="text-xs text-[#68677D] text-center">
          Both scenarios require a caption. Media upload is optional.
        </p>
      </div>

      {/* =========================================================================
          SECTION 5: DETAILED COMPARISON RESULTS DASHBOARD
          ========================================================================= */}
      {comp && metrics && (
        <div id="comparison-results" ref={resultRef} className="space-y-8 scroll-mt-20">
          {/* A. EXECUTIVE COMPARISON SUMMARY CARD */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E7E3F0] shadow-card space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-[#E7E3F0] gap-4">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#6C4DFF]">
                  Prediction Comparison Results
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#242137] tracking-tight mt-0.5">
                  Outcome & Uncertainty Evaluation
                </h2>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8F7FC] hover:bg-[#F0EBFF] border border-[#E7E3F0] text-xs font-semibold text-[#242137] hover:text-[#6C4DFF] transition-colors shadow-sm"
                >
                  {copiedSummary ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#0F9D8A]" />
                      <span>Copied Summary</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#6C4DFF]" />
                      <span>Copy Summary</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadReport}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8F7FC] hover:bg-[#F0EBFF] border border-[#E7E3F0] text-xs font-semibold text-[#242137] hover:text-[#6C4DFF] transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-[#4285F4]" />
                  <span>Export JSON</span>
                </button>
              </div>
            </div>

            {/* Inconclusive Result Banner (Section 9) */}
            {metrics.is_inconclusive && (
              <div className="p-4 rounded-xl bg-[#FDF5EA] border border-[#E9A23B]/30 text-xs text-[#E9A23B] flex items-start gap-3">
                <Info className="w-5 h-5 shrink-0 mt-0.5 text-[#E9A23B]" />
                <div className="space-y-1">
                  <strong className="text-sm font-bold block text-[#B45309]">
                    Result Inconclusive (Honest Uncertainty)
                  </strong>
                  <p className="text-[#68677D] leading-relaxed">
                    {metrics.inconclusive_reason ||
                      "The model does not provide strong statistical evidence that one scenario will outperform the other. Both estimates fall within overlapping uncertainty bands."}
                  </p>
                  <p className="text-[11px] text-[#B45309]">
                    You can decide based on content quality, copywriting clarity, brand fit, or run a controlled A/B test.
                  </p>
                </div>
              </div>
            )}

            {/* Confounding Variables Warning (Section 3) */}
            {metrics.is_confounded && (
              <div className="p-4 rounded-xl bg-[#FEEFF0] border border-[#F06F73]/30 text-xs text-[#F06F73] flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-[#F06F73]" />
                <div className="space-y-1">
                  <strong className="text-sm font-bold block text-[#BE123C]">
                    Confounding Variables Detected
                  </strong>
                  <p className="text-[#68677D] leading-relaxed">
                    {metrics.confounding_warning}
                  </p>
                </div>
              </div>
            )}

            {/* Main Absolute & Relative Delta Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center pt-2">
              {/* Scenario A Metric */}
              <div className="p-5 rounded-2xl bg-[#F8F7FC] border border-[#E7E3F0] text-center space-y-1">
                <span className="text-xs font-mono font-bold text-[#68677D] uppercase tracking-wider block">
                  Scenario A Estimate
                </span>
                <strong className="text-3xl sm:text-4xl font-black font-mono text-[#242137] block">
                  {comp.prediction_a.prediction.toFixed(2)}%
                </strong>
                <span className="text-[11px] text-[#68677D] block">
                  Range: {comp.prediction_a.lower.toFixed(2)}% — {comp.prediction_a.upper.toFixed(2)}%
                </span>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#242137] border border-[#E7E3F0] mt-1 shadow-sm">
                  Band: {comp.prediction_a.band}
                </span>
              </div>

              {/* Center Delta Badge */}
              <div className="p-5 rounded-2xl bg-white border border-[#E7E3F0] text-center space-y-2 shadow-sm">
                <span className="text-xs font-mono font-bold text-[#68677D] uppercase tracking-wider block">
                  Predicted Variance (B vs A)
                </span>

                <div className="flex items-center justify-center gap-2">
                  {metrics.delta_absolute > 0 ? (
                    <TrendingUp className="w-6 h-6 text-[#0F9D8A] shrink-0" />
                  ) : metrics.delta_absolute < 0 ? (
                    <TrendingDown className="w-6 h-6 text-[#F06F73] shrink-0" />
                  ) : (
                    <Sliders className="w-6 h-6 text-[#68677D] shrink-0" />
                  )}
                  <span
                    className={`text-3xl sm:text-4xl font-black font-mono ${
                      metrics.delta_absolute > 0
                        ? "text-[#0F9D8A]"
                        : metrics.delta_absolute < 0
                        ? "text-[#F06F73]"
                        : "text-[#242137]"
                    }`}
                  >
                    {metrics.delta_absolute > 0
                      ? `+${metrics.delta_absolute.toFixed(2)}`
                      : metrics.delta_absolute.toFixed(2)}{" "}
                    <span className="text-lg">pp</span>
                  </span>
                </div>

                <div className="text-xs font-mono font-bold text-[#242137]">
                  Relative:{" "}
                  {metrics.delta_relative_pct !== null && metrics.delta_relative_pct !== undefined ? (
                    <span
                      className={
                        metrics.delta_relative_pct > 0
                          ? "text-[#0F9D8A]"
                          : metrics.delta_relative_pct < 0
                          ? "text-[#F06F73]"
                          : "text-[#68677D]"
                      }
                    >
                      {metrics.delta_relative_pct > 0 ? "+" : ""}
                      {metrics.delta_relative_pct.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-[#8B89A3]">N/A</span>
                  )}
                </div>

                <p className="text-[11px] text-[#68677D] leading-tight">
                  Model statistical estimate, not a guaranteed outcome.
                </p>
              </div>

              {/* Scenario B Metric */}
              <div className="p-5 rounded-2xl bg-[#F0EBFF]/40 border border-[#6C4DFF]/30 text-center space-y-1">
                <span className="text-xs font-mono font-bold text-[#6C4DFF] uppercase tracking-wider block">
                  Scenario B Estimate
                </span>
                <strong className="text-3xl sm:text-4xl font-black font-mono text-[#242137] block">
                  {comp.prediction_b.prediction.toFixed(2)}%
                </strong>
                <span className="text-[11px] text-[#68677D] block">
                  Range: {comp.prediction_b.lower.toFixed(2)}% — {comp.prediction_b.upper.toFixed(2)}%
                </span>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#6C4DFF] border border-[#6C4DFF]/30 mt-1 shadow-sm">
                  Band: {comp.prediction_b.band}
                </span>
              </div>
            </div>

            {/* Overlap Explanation */}
            <div className="p-3.5 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0] text-xs text-[#68677D] flex items-center justify-between gap-4">
              <span className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#6C4DFF] shrink-0" />
                <span>{comp.overlap_explanation}</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-[#E7E3F0] font-mono text-[11px] text-[#242137] shrink-0 shadow-sm">
                {comp.intervals_overlap ? "Overlapping CIs" : "Distinct CIs"}
              </span>
            </div>
          </div>

          {/* B. "WHAT CHANGED?" PARAMETER MATRIX (SECTION 3) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Changed Parameters */}
            <div className="p-6 rounded-2xl bg-white border border-[#E7E3F0] shadow-card space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E3F0]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6C4DFF]" />
                  <h3 className="text-xs font-mono font-bold text-[#242137] tracking-wide uppercase">
                    What Changed?
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#F0EBFF] text-[#6C4DFF] border border-[#6C4DFF]/30">
                  {whatChanged?.count_changed || 0} parameter
                  {(whatChanged?.count_changed || 0) !== 1 ? "s" : ""} modified
                </span>
              </div>

              {!whatChanged || whatChanged.changed_parameters.length === 0 ? (
                <p className="text-xs text-[#68677D] py-3">
                  Scenario A and Scenario B are identical. Modify a variable in Scenario B to test sensitivity.
                </p>
              ) : (
                <div className="space-y-3">
                  {whatChanged.changed_parameters.map((param) => (
                    <div
                      key={param.field}
                      className="p-3.5 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0] space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#242137]">{param.label}</span>
                        <span className="text-[10px] font-mono text-[#6C4DFF] font-bold">Changed</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#68677D]">
                        <span className="px-2 py-0.5 rounded bg-white border border-[#E7E3F0] font-mono truncate max-w-[150px] shadow-sm">
                          {param.value_a}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#68677D] shrink-0" />
                        <span className="px-2 py-0.5 rounded bg-[#F0EBFF] border border-[#6C4DFF]/30 text-[#6C4DFF] font-mono truncate max-w-[150px] font-semibold">
                          {param.value_b}
                        </span>
                      </div>
                      {param.impact_note && (
                        <p className="text-[11px] text-[#68677D] leading-tight">
                          {param.impact_note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Unchanged Parameters (What Stays The Same) */}
            <div className="p-6 rounded-2xl bg-white border border-[#E7E3F0] shadow-card space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E3F0]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0F9D8A]" />
                  <h3 className="text-xs font-mono font-bold text-[#242137] tracking-wide uppercase">
                    What Stays The Same
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#E6F6F4] text-[#0F9D8A] border border-[#0F9D8A]/20">
                  {whatChanged?.count_unchanged || 0} controlled
                </span>
              </div>

              {!whatChanged || whatChanged.unchanged_parameters.length === 0 ? (
                <p className="text-xs text-[#68677D] py-3">
                  All inputs are currently differing between Scenario A and B.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {whatChanged.unchanged_parameters.map((param) => (
                    <div
                      key={param.field}
                      className="p-3 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0]"
                    >
                      <span className="text-[10px] font-mono text-[#68677D] block">
                        {param.label}
                      </span>
                      <span className="font-mono text-[#242137] truncate block mt-0.5 font-semibold">
                        {param.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[11px] text-[#68677D] pt-2">
                Keeping these variables identical isolates what caused any model differences.
              </p>
            </div>
          </div>

          {/* C. VISUAL & CAPTION CREATIVE SIDE-BY-SIDE (SECTION 5B) */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E7E3F0] shadow-card space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E3F0]">
              <div className="flex items-center gap-2.5">
                <Eye className="w-4 h-4 text-[#6C4DFF]" />
                <h3 className="text-base font-bold text-[#242137] tracking-wide">
                  Creative Side-by-Side Comparison
                </h3>
              </div>
              <span className="text-xs text-[#68677D]">Media & Copy Verification</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Creative A */}
              <div className="p-4 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#242137]">Scenario A</span>
                  <span className="text-[11px] font-mono text-[#68677D]">
                    {scenarioA.mediaType.toUpperCase()}
                  </span>
                </div>

                {scenarioA.media?.url ? (
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-white border border-[#E7E3F0] flex items-center justify-center">
                    <img
                      src={scenarioA.media.url}
                      alt="Scenario A creative"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-white border border-[#E7E3F0] text-xs text-[#68677D] text-center">
                    Text / Metadata Mode (No media file attached)
                  </div>
                )}

                <div className="p-3 rounded-xl bg-white border border-[#E7E3F0] text-xs text-[#242137] whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto shadow-sm">
                  {scenarioA.caption}
                </div>
              </div>

              {/* Creative B */}
              <div className="p-4 rounded-xl bg-[#F0EBFF]/30 border border-[#6C4DFF]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#6C4DFF]">Scenario B</span>
                  <span className="text-[11px] font-mono text-[#6C4DFF]">
                    {scenarioB.mediaType.toUpperCase()}
                  </span>
                </div>

                {scenarioB.media?.url ? (
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-white border border-[#E7E3F0] flex items-center justify-center">
                    <img
                      src={scenarioB.media.url}
                      alt="Scenario B creative"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-white border border-[#E7E3F0] text-xs text-[#68677D] text-center">
                    Text / Metadata Mode (No media file attached)
                  </div>
                )}

                <div className="p-3 rounded-xl bg-white border border-[#E7E3F0] text-xs text-[#242137] whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto shadow-sm">
                  {scenarioB.caption}
                </div>
              </div>
            </div>
          </div>

          {/* D. STATISTICAL FOREST-PLOT PREDICTION & UNCERTAINTY INTERVAL CHART */}
          <WhatIfUncertaintyChart
            predictionA={comp.prediction_a}
            predictionB={comp.prediction_b}
            scenarioALabel="Scenario A — Original"
            scenarioBLabel="Scenario B — Alternative"
            scenarioAFormat={scenarioA.mediaType.toUpperCase()}
            scenarioBFormat={scenarioB.mediaType.toUpperCase()}
            deltaPp={metrics.delta_absolute}
            deltaRelativePct={metrics.delta_relative_pct}
            intervalsOverlap={comp.intervals_overlap}
            overlapExplanation={comp.overlap_explanation}
          />

          {/* E. CONTENT QUALITY COMPARISON (SECTION 6) */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E7E3F0] shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E7E3F0] gap-2">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6C4DFF]">
                  Craft Quality Assessment
                </span>
                <h3 className="text-lg font-black text-[#242137]">
                  Content Quality Comparison
                </h3>
              </div>
              <span className="text-xs text-[#68677D]">
                Independent of offline engagement predictions
              </span>
            </div>

            {/* Overall Craft Quality Comparison Header */}
            {comp.quality_a && comp.quality_b && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0]">
                <div className="text-center">
                  <span className="text-[11px] font-mono text-[#68677D] uppercase">Scenario A Craft</span>
                  <div className="text-2xl font-black text-[#242137] font-mono mt-1">
                    {comp.quality_a.score}/100
                  </div>
                  <span className="text-xs text-[#68677D]">({comp.quality_a.band})</span>
                </div>

                <div className="text-center flex flex-col justify-center">
                  <span className="text-[11px] font-mono text-[#68677D] uppercase">Quality Delta</span>
                  <div
                    className={`text-2xl font-black font-mono mt-1 ${
                      (comp.quality_delta || 0) > 0
                        ? "text-[#0F9D8A]"
                        : (comp.quality_delta || 0) < 0
                        ? "text-[#F06F73]"
                        : "text-[#242137]"
                    }`}
                  >
                    {(comp.quality_delta || 0) > 0 ? `+${comp.quality_delta}` : comp.quality_delta} pts
                  </div>
                </div>

                <div className="text-center">
                  <span className="text-[11px] font-mono text-[#6C4DFF] uppercase font-bold">Scenario B Craft</span>
                  <div className="text-2xl font-black text-[#6C4DFF] font-mono mt-1">
                    {comp.quality_b.score}/100
                  </div>
                  <span className="text-xs text-[#68677D]">({comp.quality_b.band})</span>
                </div>
              </div>
            )}

            {/* Quality Pillars Table */}
            <div className="space-y-3">
              {qualityPillars.map((pillar) => (
                <div
                  key={pillar.key}
                  className="p-4 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0] space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#242137] flex items-center gap-2">
                      <span>{pillar.pillar}</span>
                      {!pillar.applicable && (
                        <span className="text-[10px] font-mono text-[#8B89A3] bg-white border border-[#E7E3F0] px-2 py-0.5 rounded">
                          Not Applicable
                        </span>
                      )}
                    </span>

                    {pillar.applicable && pillar.score_a !== null && pillar.score_b !== null && (
                      <div className="flex items-center gap-3 text-xs font-mono">
                        <span className="text-[#68677D]">A: {pillar.score_a}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#8B89A3]" />
                        <span className="text-[#6C4DFF] font-bold">B: {pillar.score_b}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            (pillar.delta || 0) > 0
                              ? "bg-[#E6F6F4] text-[#0F9D8A]"
                              : (pillar.delta || 0) < 0
                              ? "bg-[#FEEFF0] text-[#F06F73]"
                              : "bg-white text-[#68677D] border border-[#E7E3F0]"
                          }`}
                        >
                          {(pillar.delta || 0) > 0 ? `+${pillar.delta}` : pillar.delta}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-[#242137] leading-relaxed">
                    {pillar.observation}
                  </p>

                  <p className="text-[11px] text-[#68677D] italic">
                    💡 Recommendation: {pillar.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* F. SMART RECOMMENDATION PANEL ("WHAT SHOULD YOU IMPROVE?") (SECTION 7) */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E7E3F0] shadow-card space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E3F0]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#6C4DFF]" />
                <h3 className="text-base font-bold text-[#242137] tracking-wide">
                  What Should You Improve?
                </h3>
              </div>
              <span className="text-xs text-[#68677D]">
                Actionable Next Steps for Scenario B
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {smartRecs.map((rec) => (
                <div
                  key={rec.id}
                  className="p-5 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0] flex flex-col justify-between space-y-3 hover:border-[#6C4DFF]/40 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#6C4DFF] font-bold">
                        {rec.evidence_type}
                      </span>
                      <span className="text-[10px] text-[#8B89A3]">
                        Confidence: {rec.confidence}
                      </span>
                    </div>

                    <strong className="text-sm font-bold text-[#242137] block">
                      {rec.title}
                    </strong>

                    <p className="text-xs text-[#68677D] leading-relaxed">
                      {rec.observation}
                    </p>

                    <p className="text-[11px] text-[#8B89A3] leading-relaxed">
                      {rec.rationale}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#E7E3F0]">
                    {rec.action_payload && Object.keys(rec.action_payload).length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleApplyRecommendation(rec)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F0EBFF] hover:bg-[#E2D8FF] border border-[#6C4DFF]/30 text-xs font-bold text-[#6C4DFF] transition-colors"
                      >
                        {appliedRecId === rec.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#0F9D8A]" />
                            <span>Applied to B</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Apply to Scenario B</span>
                          </>
                        )}
                      </button>
                    )}

                    {rec.action_payload?.caption && (
                      <button
                        type="button"
                        onClick={() => handleCopyCaption(rec.id, rec.action_payload.caption)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F8F7FC] border border-[#E7E3F0] text-xs font-semibold text-[#242137] transition-colors"
                      >
                        {copiedRecId === rec.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#0F9D8A]" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Caption</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* G. PRACTICAL CONTROLLED EXPERIMENT PROTOCOL (SECTION 10) */}
          {experimentProtocol && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E7E3F0] shadow-card space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E3F0]">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#0F9D8A]" />
                  <h3 className="text-base font-bold text-[#242137] tracking-wide">
                    Controlled Experiment Protocol
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-[#0F9D8A]">
                  {experimentProtocol.experiment_name}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0] space-y-1">
                  <span className="text-[10px] font-mono text-[#8B89A3] uppercase block">
                    Isolated Test Variable
                  </span>
                  <strong className="text-sm text-[#242137] block">
                    {experimentProtocol.test_variable}
                  </strong>
                  <p className="text-[#68677D] mt-1 leading-relaxed">
                    {experimentProtocol.hypothesis}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0] space-y-1">
                  <span className="text-[10px] font-mono text-[#8B89A3] uppercase block">
                    Controlled Variables
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {experimentProtocol.control_variables.map((cv) => (
                      <span
                        key={cv}
                        className="px-2 py-0.5 rounded bg-white border border-[#E7E3F0] text-[11px] text-[#242137] font-mono shadow-sm"
                      >
                        ✓ {cv}
                      </span>
                    ))}
                  </div>
                  <span className="text-[11px] text-[#68677D] block pt-1">
                    Measurement Window: {experimentProtocol.measurement_window}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#68677D] leading-relaxed pt-1">
                {experimentProtocol.guidance}
              </p>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          PRIVACY & SCIENTIFIC INTEGRITY FOOTER
          ========================================================================= */}
      <div className="p-6 rounded-2xl bg-white border border-[#E7E3F0] text-center text-xs text-[#8B89A3] space-y-1 shadow-sm">
        <p>
          Uploaded media and scenario configurations are evaluated in-memory and are never modified
          in or appended to the canonical 15,000-record master dataset.
        </p>
        <p>
          Model predictions are statistical estimates calibrated against historical post patterns,
          not guaranteed commercial results.
        </p>
      </div>
    </div>
  );
}
