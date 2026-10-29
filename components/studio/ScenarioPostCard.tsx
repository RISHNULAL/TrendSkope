"use client";

import React, { useRef, useState } from "react";
import {
  Upload,
  Image as ImageIcon,
  Video,
  Layers,
  Music,
  Trash2,
  Copy,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Plus,
  Volume2,
  VolumeX,
  FileText,
  Calendar,
  Clock,
  Users,
  Target,
  Sparkles,
  Info,
} from "lucide-react";
import { StudioMediaItem } from "@/types";
import { analyzeImageFile, analyzeVideoFile, analyzeLiveCaption } from "@/lib/media-signals";

export interface StudioScenarioFormState {
  name?: string;
  caption: string;
  mediaType: "image" | "carousel" | "reel";
  followers: number;
  date: string;
  time: string;
  category: string;
  goal: string;
  audioName: string;
  audioType: "original" | "custom" | "uploaded" | "none";
  audioId: string;
  media: StudioMediaItem | null;
  rawFile?: File | null;
  carouselItems: StudioMediaItem[];
  carouselFiles?: File[];
}

interface ScenarioPostCardProps {
  planId: "A" | "B";
  title: string;
  subtitle?: string;
  state: StudioScenarioFormState;
  onChange: (updater: (prev: StudioScenarioFormState) => StudioScenarioFormState) => void;
  changedFields?: Set<string>;
  singleVariableMode?: boolean;
  onCopyFromA?: () => void;
  onReset?: () => void;
}

export default function ScenarioPostCard({
  planId,
  title,
  subtitle,
  state,
  onChange,
  changedFields = new Set(),
  singleVariableMode = false,
  onCopyFromA,
  onReset,
}: ScenarioPostCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const carouselInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [analyzingMedia, setAnalyzingMedia] = useState(false);

  // Live caption analysis
  const captionData = analyzeLiveCaption(state.caption);

  // Handle single file upload (Image or Video)
  const handleSingleFile = async (file: File) => {
    setUploadError(null);
    setAnalyzingMedia(true);

    const isVideo = file.type.startsWith("video/") || /\.(mp4|mov|webm)$/i.test(file.name);
    const isImage = file.type.startsWith("image/") || /\.(jpg|jpeg|png|webp)$/i.test(file.name);

    if (state.mediaType === "reel" && !isVideo) {
      setUploadError("Please upload a video file (MP4, MOV, WEBM) for a Reel post.");
      setAnalyzingMedia(false);
      return;
    }

    if (state.mediaType === "image" && !isImage) {
      if (isVideo) {
        try {
          const analyzed = await analyzeVideoFile(file);
          onChange((prev) => ({
            ...prev,
            mediaType: "reel",
            media: analyzed,
            rawFile: file,
            carouselItems: [],
            carouselFiles: [],
          }));
          setAnalyzingMedia(false);
          return;
        } catch {
          // fallback
        }
      }
      setUploadError("Please upload an image file (JPG, PNG, WEBP) for an Image post.");
      setAnalyzingMedia(false);
      return;
    }

    try {
      if (isVideo) {
        const analyzed = await analyzeVideoFile(file);
        onChange((prev) => ({
          ...prev,
          mediaType: "reel",
          media: analyzed,
          rawFile: file,
          carouselItems: [],
          carouselFiles: [],
        }));
      } else {
        const analyzed = await analyzeImageFile(file);
        onChange((prev) => ({
          ...prev,
          media: analyzed,
          rawFile: file,
        }));
      }
    } catch (err: any) {
      setUploadError(err.message || "Failed to process media file.");
    } finally {
      setAnalyzingMedia(false);
    }
  };

  // Handle Carousel multi-image upload
  const handleCarouselFiles = async (files: FileList | File[]) => {
    setUploadError(null);
    setAnalyzingMedia(true);

    try {
      const items: StudioMediaItem[] = [...state.carouselItems];
      const rawFiles: File[] = state.carouselFiles ? [...state.carouselFiles] : [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith("image/") || /\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
          const analyzed = await analyzeImageFile(file);
          items.push(analyzed);
          rawFiles.push(file);
        }
      }

      if (items.length === 0) {
        setUploadError("Please select valid image files (JPG, PNG, WEBP) for the Carousel.");
        setAnalyzingMedia(false);
        return;
      }

      onChange((prev) => ({
        ...prev,
        mediaType: "carousel",
        media: items[0],
        rawFile: rawFiles[0],
        carouselItems: items,
        carouselFiles: rawFiles,
      }));
    } catch (err: any) {
      setUploadError("Failed to analyze one or more carousel images.");
    } finally {
      setAnalyzingMedia(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (state.mediaType === "carousel") {
        handleCarouselFiles(e.dataTransfer.files);
      } else {
        handleSingleFile(e.dataTransfer.files[0]);
      }
    }
  };

  const handleRemoveMedia = () => {
    if (state.media?.url) URL.revokeObjectURL(state.media.url);
    state.carouselItems.forEach((item) => {
      if (item.url) URL.revokeObjectURL(item.url);
    });

    onChange((prev) => ({
      ...prev,
      media: null,
      rawFile: null,
      carouselItems: [],
      carouselFiles: [],
    }));

    if (fileInputRef.current) fileInputRef.current.value = "";
    if (carouselInputRef.current) carouselInputRef.current.value = "";
  };

  const isFieldChanged = (field: string) => planId === "B" && changedFields.has(field);

  return (
    <div
      className={`p-6 sm:p-7 rounded-2xl bg-white transition-all duration-200 border flex flex-col justify-between ${
        planId === "B" && changedFields.size > 0
          ? "border-[#6C4DFF]/40 shadow-card hover:border-[#6C4DFF]"
          : "border-[#E7E3F0] shadow-card hover:shadow-card-hover"
      }`}
    >
      <div className="space-y-5">
        {/* =========================================================================
            SCENARIO HEADER BAR
            ========================================================================= */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E7E3F0] gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`w-3 h-3 rounded-full shrink-0 ${
                planId === "A"
                  ? "bg-[#68677D]"
                  : "bg-[#6C4DFF] animate-pulse"
              }`}
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-[#242137] tracking-tight">
                  {title}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider ${
                    planId === "A"
                      ? "bg-[#F8F7FC] border border-[#E7E3F0] text-[#68677D]"
                      : "bg-[#F0EBFF] border border-[#6C4DFF]/30 text-[#6C4DFF]"
                  }`}
                >
                  Scenario {planId}
                </span>
              </div>
              <p className="text-xs text-[#68677D] mt-0.5">
                {subtitle ||
                  (planId === "A"
                    ? "Baseline or original reference version"
                    : "Alternative variation being tested")}
              </p>
            </div>
          </div>

          {/* Quick Header Actions (Match Option A or Reset) */}
          <div className="flex items-center gap-2 shrink-0">
            {planId === "B" && onCopyFromA && (
              <button
                type="button"
                onClick={onCopyFromA}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F0EBFF] hover:bg-[#E2D8FF] border border-[#6C4DFF]/20 text-xs font-semibold text-[#6C4DFF] transition-all active:scale-95 shadow-sm"
                title="Duplicate Scenario A as starting point"
              >
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Duplicate A</span>
              </button>
            )}
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#F8F7FC] hover:bg-[#F0EBFF] border border-[#E7E3F0] text-xs text-[#68677D] hover:text-[#6C4DFF] transition-colors"
                title={`Reset Scenario ${planId} independently`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* =========================================================================
            SCENARIO NAME INPUT
            ========================================================================= */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#68677D] flex items-center justify-between">
            <span>Scenario Name</span>
            <span className="text-[10px] text-[#8B89A3]">Optional Label</span>
          </label>
          <input
            type="text"
            value={state.name || ""}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
            placeholder={
              planId === "A" ? "e.g., Original Product Poster" : "e.g., Revised Question Hook"
            }
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E7E3F0] text-sm text-[#242137] placeholder:text-[#9E9DB5] focus:outline-none focus:border-[#6C4DFF] transition-colors"
          />
        </div>

        {/* =========================================================================
            FORMAT SELECTOR
            ========================================================================= */}
        <div
          className={`p-3.5 rounded-xl bg-[#F8F7FC] border transition-all ${
            isFieldChanged("media_type")
              ? "border-[#6C4DFF] ring-2 ring-[#6C4DFF]/15"
              : "border-[#E7E3F0]"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#68677D] flex items-center gap-2">
              <span>Media Format</span>
              {isFieldChanged("media_type") && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0EBFF] text-[#6C4DFF] border border-[#6C4DFF]/30">
                  Different from A
                </span>
              )}
            </span>
            <span className="text-[10px] text-[#8B89A3]">Photo, Carousel, or Reel</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() =>
                onChange((prev) => ({
                  ...prev,
                  mediaType: "image",
                  carouselItems: [],
                  carouselFiles: [],
                }))
              }
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                state.mediaType === "image"
                  ? "bg-[#6C4DFF] text-white shadow-sm"
                  : "bg-white hover:bg-[#F0EBFF] text-[#68677D] hover:text-[#6C4DFF] border border-[#E7E3F0]"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 shrink-0" />
              <span>Photo</span>
            </button>

            <button
              type="button"
              onClick={() =>
                onChange((prev) => ({
                  ...prev,
                  mediaType: "carousel",
                }))
              }
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                state.mediaType === "carousel"
                  ? "bg-[#6C4DFF] text-white shadow-sm"
                  : "bg-white hover:bg-[#F0EBFF] text-[#68677D] hover:text-[#6C4DFF] border border-[#E7E3F0]"
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>Carousel</span>
            </button>

            <button
              type="button"
              onClick={() =>
                onChange((prev) => ({
                  ...prev,
                  mediaType: "reel",
                  carouselItems: [],
                  carouselFiles: [],
                }))
              }
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                state.mediaType === "reel"
                  ? "bg-[#6C4DFF] text-white shadow-sm"
                  : "bg-white hover:bg-[#F0EBFF] text-[#68677D] hover:text-[#6C4DFF] border border-[#E7E3F0]"
              }`}
            >
              <Video className="w-3.5 h-3.5 shrink-0" />
              <span>Reel</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            MEDIA UPLOAD & PREVIEW (OPTIONAL)
            ========================================================================= */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#68677D]">
              Media Creative
            </span>
            <span className="text-[10px] text-[#8B89A3]">Optional · Drag & drop</span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={state.mediaType === "reel" ? "video/*" : "image/*"}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleSingleFile(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          <input
            ref={carouselInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleCarouselFiles(e.target.files);
              }
            }}
            className="hidden"
          />

          {uploadError && (
            <div className="p-3 rounded-xl bg-[#FEEFF0] border border-[#F06F73]/30 text-[#F06F73] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {state.media ? (
            /* Media Uploaded Preview Card */
            <div className="relative rounded-xl bg-[#F8F7FC] border border-[#E7E3F0] overflow-hidden group">
              <div className="aspect-[4/3] w-full bg-[#F0EBFF]/50 flex items-center justify-center relative overflow-hidden">
                {state.mediaType === "reel" ? (
                  <video
                    src={state.media.url}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={state.media.url}
                    alt="Uploaded scenario preview"
                    className="w-full h-full object-contain"
                  />
                )}

                <button
                  type="button"
                  onClick={handleRemoveMedia}
                  className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-white/90 hover:bg-[#F06F73] text-[#68677D] hover:text-white border border-[#E7E3F0] transition-all shadow-sm"
                  title="Remove media file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-lg bg-white/95 border border-[#E7E3F0] text-[11px] font-mono text-[#242137] shadow-sm">
                    {state.media.width && state.media.height
                      ? `${state.media.width}×${state.media.height}`
                      : (state.media.format || "MEDIA").toUpperCase()}
                  </span>
                  {state.media.aspectRatio && (
                    <span className="px-2 py-1 rounded-lg bg-white/95 border border-[#E7E3F0] text-[11px] font-mono text-[#68677D] shadow-sm">
                      {state.media.aspectRatio}
                    </span>
                  )}
                  {state.mediaType === "carousel" && (
                    <span className="px-2 py-1 rounded-lg bg-[#F0EBFF] border border-[#6C4DFF]/30 text-[11px] font-mono text-[#6C4DFF] shadow-sm">
                      {state.carouselItems.length} Slide{state.carouselItems.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Empty Upload Dropzone */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => {
                if (state.mediaType === "carousel") {
                  carouselInputRef.current?.click();
                } else {
                  fileInputRef.current?.click();
                }
              }}
              className={`p-6 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
                dragActive
                  ? "border-[#6C4DFF] bg-[#F0EBFF]/40"
                  : "border-[#D9D4E8] hover:border-[#6C4DFF] bg-[#F8F7FC] hover:bg-[#F0EBFF]/20"
              }`}
            >
              {analyzingMedia ? (
                <div className="flex flex-col items-center justify-center py-3 space-y-2">
                  <div className="w-5 h-5 border-2 border-transparent border-t-[#6C4DFF] rounded-full animate-spin" />
                  <span className="text-xs text-[#68677D]">Analyzing media composition...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#E7E3F0] mx-auto flex items-center justify-center text-[#6C4DFF] shadow-sm">
                    <Upload className="w-4 h-4 text-[#6C4DFF]" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#242137] block">
                      {state.mediaType === "carousel"
                        ? "Upload Carousel Images"
                        : state.mediaType === "reel"
                        ? "Upload Video Reel"
                        : "Upload Post Image"}
                    </span>
                    <span className="text-[11px] text-[#8B89A3]">
                      JPG, PNG, or MP4 · Optional for caption comparisons
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* =========================================================================
            CAPTION EDITOR & LINGUISTIC SIGNALS
            ========================================================================= */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#68677D] flex items-center gap-2">
              <span>Caption & Hashtags</span>
              <span className="text-[#6C4DFF] font-bold">*Required</span>
              {isFieldChanged("caption") && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0EBFF] text-[#6C4DFF] border border-[#6C4DFF]/30">
                  Different from A
                </span>
              )}
            </span>
            <span className="text-[10px] font-mono text-[#8B89A3]">
              {captionData.metrics.characters} chars · {captionData.metrics.words} words
            </span>
          </div>

          <textarea
            rows={5}
            value={state.caption}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                caption: e.target.value,
              }))
            }
            placeholder="Type your caption and hashtags here... Pose a question to prompt discussion! #creators #tips"
            className="w-full p-3.5 rounded-xl bg-white border border-[#E7E3F0] text-sm text-[#242137] placeholder:text-[#9E9DB5] focus:outline-none focus:border-[#6C4DFF] transition-colors resize-y leading-relaxed shadow-sm"
          />

          {/* Quick Caption Quality Indicators */}
          <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px]">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border font-medium ${
                captionData.structure.has_question
                  ? "bg-[#E6F6F4] border-[#0F9D8A]/30 text-[#0F9D8A]"
                  : "bg-[#F8F7FC] border-[#E7E3F0] text-[#68677D]"
              }`}
            >
              {captionData.structure.has_question ? "✓ Question Hook" : "No Question Hook"}
            </span>

            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border font-medium ${
                captionData.structure.has_cta
                  ? "bg-[#ECF3FE] border-[#4285F4]/30 text-[#4285F4]"
                  : "bg-[#F8F7FC] border-[#E7E3F0] text-[#68677D]"
              }`}
            >
              {captionData.structure.has_cta ? "✓ CTA Included" : "No Call to Action"}
            </span>

            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border font-medium ${
                captionData.metrics.hashtags >= 3 && captionData.metrics.hashtags <= 5
                  ? "bg-[#FDF5EA] border-[#E9A23B]/30 text-[#E9A23B]"
                  : "bg-[#F8F7FC] border-[#E7E3F0] text-[#68677D]"
              }`}
            >
              {captionData.metrics.hashtags} Tags ({captionData.metrics.hashtags >= 3 && captionData.metrics.hashtags <= 5 ? "Target: 3-5" : "Target: 3-5"})
            </span>
          </div>
        </div>

        {/* =========================================================================
            SCHEDULING & AUDIENCE PARAMETERS
            ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Followers */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#68677D] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#6C4DFF]" />
                Followers
              </span>
              {isFieldChanged("followers") && (
                <span className="text-[10px] text-[#6C4DFF]">Diff</span>
              )}
            </label>
            <input
              type="number"
              min={1}
              value={state.followers}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  followers: Math.max(1, parseInt(e.target.value) || 1),
                }))
              }
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7E3F0] text-xs font-mono text-[#242137] focus:outline-none focus:border-[#6C4DFF]"
            />
          </div>

          {/* Posting Time */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#68677D] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#6C4DFF]" />
                Time (UTC)
              </span>
              {isFieldChanged("time") && (
                <span className="text-[10px] text-[#6C4DFF]">Diff</span>
              )}
            </label>
            <input
              type="time"
              value={state.time}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  time: e.target.value,
                }))
              }
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7E3F0] text-xs font-mono text-[#242137] focus:outline-none focus:border-[#6C4DFF]"
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#68677D] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#6C4DFF]" />
                Date
              </span>
              {isFieldChanged("date") && (
                <span className="text-[10px] text-[#6C4DFF]">Diff</span>
              )}
            </label>
            <input
              type="date"
              value={state.date}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  date: e.target.value,
                }))
              }
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7E3F0] text-xs font-mono text-[#242137] focus:outline-none focus:border-[#6C4DFF]"
            />
          </div>
        </div>

        {/* Category & Goal Context */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#68677D] flex items-center gap-1.5">
              <span>Category</span>
            </label>
            <select
              value={state.category}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  category: e.target.value,
                }))
              }
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7E3F0] text-xs text-[#242137] focus:outline-none focus:border-[#6C4DFF]"
            >
              <option value="Technology">Technology</option>
              <option value="Business">Business</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Education">Education</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Photography">Photography</option>
              <option value="Personal Development">Personal Development</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#68677D] flex items-center gap-1.5">
              <span>Campaign Goal</span>
            </label>
            <select
              value={state.goal}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  goal: e.target.value,
                }))
              }
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7E3F0] text-xs text-[#242137] focus:outline-none focus:border-[#6C4DFF]"
            >
              <option value="Engagement">Engagement</option>
              <option value="Reach">Reach & Discovery</option>
              <option value="Conversion">Conversion / Clicks</option>
              <option value="Community">Community Building</option>
            </select>
          </div>
        </div>

        {/* Audio Track (for Reels) */}
        {state.mediaType === "reel" && (
          <div className="p-3.5 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0] space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#68677D] flex items-center gap-2">
              <Music className="w-3.5 h-3.5 text-[#6C4DFF]" />
              <span>Reel Audio Track</span>
            </span>
            <input
              type="text"
              value={state.audioName}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  audioName: e.target.value,
                }))
              }
              placeholder="e.g., Original Audio or Trending Sound Title"
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E7E3F0] text-xs text-[#242137] placeholder:text-[#9E9DB5] focus:outline-none focus:border-[#6C4DFF]"
            />
          </div>
        )}
      </div>
    </div>
  );
}
