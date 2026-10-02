"use client";

import React, { useRef, useState } from "react";
import {
  Upload,
  Image as ImageIcon,
  Video,
  Layers,
  Music,
  Trash2,
  RefreshCw,
  Copy,
  Info,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Plus,
  Volume2,
  VolumeX,
} from "lucide-react";
import { StudioMediaItem } from "@/types";
import { analyzeImageFile, analyzeVideoFile, analyzeLiveCaption } from "@/lib/media-signals";

export interface StudioScenarioFormState {
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
  carouselItems: StudioMediaItem[];
}

interface ScenarioPostCardProps {
  planId: "A" | "B";
  title: string;
  state: StudioScenarioFormState;
  onChange: (updater: (prev: StudioScenarioFormState) => StudioScenarioFormState) => void;
  changedFields: Set<string>;
  singleVariableMode: boolean;
  onCopyFromA?: () => void;
}

export default function ScenarioPostCard({
  planId,
  title,
  state,
  onChange,
  changedFields,
  singleVariableMode,
  onCopyFromA,
}: ScenarioPostCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const carouselInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
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
        // Auto-switch to reel
        try {
          const analyzed = await analyzeVideoFile(file);
          onChange((prev) => ({
            ...prev,
            mediaType: "reel",
            media: analyzed,
            carouselItems: [],
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
          carouselItems: [],
        }));
      } else {
        const analyzed = await analyzeImageFile(file);
        onChange((prev) => ({
          ...prev,
          media: analyzed,
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
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith("image/") || /\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
          const analyzed = await analyzeImageFile(file);
          items.push(analyzed);
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
        carouselItems: items,
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
      carouselItems: [],
    }));

    if (fileInputRef.current) fileInputRef.current.value = "";
    if (carouselInputRef.current) carouselInputRef.current.value = "";
  };

  const handleRemoveCarouselItem = (idxToRemove: number) => {
    const updated = state.carouselItems.filter((_, idx) => idx !== idxToRemove);
    onChange((prev) => ({
      ...prev,
      carouselItems: updated,
      media: updated.length > 0 ? updated[0] : null,
    }));
  };

  const isFieldChanged = (field: string) => singleVariableMode && planId === "B" && changedFields.has(field);

  return (
    <div
      className={`glass-card p-6 md:p-8 rounded-3xl space-y-6 transition-all duration-300 relative border ${
        planId === "B" && changedFields.size > 0
          ? "border-transparent "
          : "border-border/80"
      }`}
    >
      {/* Scenario Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/80">
        <div className="flex items-center gap-3">
          <span
            className={`w-3 h-3 rounded-full ${
              planId === "A" ? "bg-[#A3B1C6]" : "bg-[#6C63FF] animate-pulse"
            }`}
          />
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#3D4852] flex items-center gap-2">
              <span>{title}</span>
            </h2>
            <p className="text-xs text-[#6B7280]">
              {planId === "A" ? "The version you start with" : "The version you want to compare"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {planId === "B" && onCopyFromA && (
            <button
              onClick={onCopyFromA}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border text-xs text-[#6B7280] hover:text-[#3D4852] hover:border-[#6C63FF] transition-colors"
              title="Copy Option A into Option B"
            >
              <Copy className="w-3.5 h-3.5 text-[#6C63FF]" />
              <span className="hidden sm:inline">Match option A</span>
            </button>
          )}
          <span
            className={`px-2.5 py-1 rounded-2xl text-xs font-mono font-bold ${
              planId === "A"
                ? "bg-[#E0E5EC] text-[#3D4852] shadow-[inset_3px_3px_6px_rgb(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.5)]"
                : "bg-primary-orange/15 text-[#6C63FF] border border-transparent"
            }`}
          >
            {planId === "A" ? "A" : "B"}
          </span>
        </div>
      </div>

      {/* SECTION: Media Type Selector (Controls UI Structure) */}
      <div
        className={`p-4 rounded-2xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] border transition-all ${
          isFieldChanged("media_type") ? "border-primary-orange " : "border-border/80"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <label htmlFor={`media-type-${planId}`} className="font-bold text-[#6B7280] uppercase tracking-wider text-xs flex items-center gap-2">
            <span>Format</span>
            {isFieldChanged("media_type") && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-orange/20 text-[#6C63FF] border border-transparent animate-pulse">
                ● Changed
              </span>
            )}
          </label>
          <span className="text-[11px] text-[#6B7280]">Photo, carousel, or Reel</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() =>
              onChange((prev) => ({
                ...prev,
                mediaType: "image",
                // Reset carousel if switching
                carouselItems: [],
              }))
            }
            className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
              state.mediaType === "image"
                ? "bg-[#6C63FF] border-transparent text-white shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)]"
                : "bg-surface/50 border-border text-[#6B7280] hover:text-[#3D4852]"
            }`}
          >
            <ImageIcon className="w-4 h-4 shrink-0" />
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
            className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
              state.mediaType === "carousel"
                ? "bg-[#6C63FF] border-transparent text-white shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)]"
                : "bg-surface/50 border-border text-[#6B7280] hover:text-[#3D4852]"
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span>Carousel</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onChange((prev) => ({
                ...prev,
                mediaType: "reel",
                audioType: prev.audioType === "none" ? "none" : prev.audioType || "original",
              }))
            }
            className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
              state.mediaType === "reel"
                ? "bg-[#6C63FF] border-transparent text-white shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)]"
                : "bg-surface/50 border-border text-[#6B7280] hover:text-[#3D4852]"
            }`}
          >
            <Video className="w-4 h-4 shrink-0" />
            <span>Reel</span>
          </button>
        </div>
      </div>

      {/* SECTION: Planned Content Upload & Preview */}
      <div
        className={`p-5 rounded-2xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] border transition-all ${
          isFieldChanged("content") ? "border-primary-orange " : "border-border/80"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
              File <span className="normal-case tracking-normal font-medium text-[#6B7280]">optional</span>
            </span>
            {isFieldChanged("content") && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-orange/20 text-[#6C63FF] border border-transparent animate-pulse">
                ● Changed
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#6B7280] font-medium">
            {state.mediaType === "image"
              ? "JPG, PNG, WEBP"
              : state.mediaType === "carousel"
              ? "Multiple Images"
              : "MP4, MOV, WEBM"}
          </span>
        </div>

        {/* Hidden inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept={state.mediaType === "reel" ? "video/mp4,video/quicktime,video/webm" : "image/jpeg,image/png,image/webp"}
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
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleCarouselFiles(e.target.files);
            }
          }}
          className="hidden"
        />

        {/* Empty Upload State */}
        {!state.media && state.carouselItems.length === 0 ? (
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
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? "border-primary-orange bg-primary-orange/10 scale-[0.99]"
                : "border-[#A3B1C6] bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)]"
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-surface border border-transparent flex items-center justify-center mx-auto mb-3 text-[#6B7280]">
              {state.mediaType === "reel" ? (
                <Video className="w-6 h-6 text-[#6C63FF]" />
              ) : state.mediaType === "carousel" ? (
                <Layers className="w-6 h-6 text-[#6C63FF]" />
              ) : (
                <Upload className="w-6 h-6 text-[#6C63FF]" />
              )}
            </div>

            <p className="text-sm font-bold text-[#3D4852] mb-1">
              {state.mediaType === "carousel"
                ? "Add carousel photos"
                : state.mediaType === "reel"
                ? "Add a Reel"
                : "Add a photo"}
            </p>
            <p className="text-xs text-[#6B7280] mb-3">
              Optional. Drop a file here, or choose one. The estimate still uses the format you picked.
            </p>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-semibold text-[#3D4852] hover:bg-[#E0E5EC] transition-colors">
              <Upload className="w-3.5 h-3.5 text-[#6C63FF]" />
              Choose a file
            </span>
          </div>
        ) : (
          /* Uploaded Media Preview */
          <div className="space-y-4">
            {/* Reel Video Player Preview */}
            {state.mediaType === "reel" && state.media && (
              <div className="relative rounded-2xl overflow-hidden border border-border/80 bg-[#3D4852]/30 aspect-video flex items-center justify-center group">
                <video
                  src={state.media.url}
                  controls
                  className="w-full h-full object-contain max-h-64"
                  playsInline
                />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-2 pointer-events-none">
                  <span className="px-2 py-0.5 rounded-2xl bg-[#3D4852]/30 backdrop-blur-md text-[10px] font-mono text-[#3D4852] border border-transparent">
                    {state.media.aspectRatio || "9:16 (Story / Reel)"}
                  </span>
                  {state.media.durationSec && (
                    <span className="px-2 py-0.5 rounded-2xl bg-[#3D4852]/30 backdrop-blur-md text-[10px] font-mono text-[#6C63FF] border border-transparent">
                      {state.media.durationSec}s
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Single Image Preview */}
            {state.mediaType === "image" && state.media && (
              <div className="relative rounded-2xl overflow-hidden border border-border/80 bg-[#3D4852]/30 aspect-video flex items-center justify-center">
                <img
                  src={state.media.url}
                  alt={state.media.name}
                  className="w-full h-full object-contain max-h-64"
                />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-2 pointer-events-none">
                  <span className="px-2 py-0.5 rounded-2xl bg-[#3D4852]/30 backdrop-blur-md text-[10px] font-mono text-[#3D4852] border border-transparent">
                    {state.media.aspectRatio || "Image"}
                  </span>
                </div>
              </div>
            )}

            {/* Carousel Multi-Image Strip & Preview */}
            {state.mediaType === "carousel" && (
              <div className="space-y-3">
                {state.media && (
                  <div className="relative rounded-2xl overflow-hidden border border-border/80 bg-[#3D4852]/30 aspect-video flex items-center justify-center">
                    <img
                      src={state.media.url}
                      alt={state.media.name}
                      className="w-full h-full object-contain max-h-64"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-2 pointer-events-none">
                      <span className="px-2 py-0.5 rounded-2xl bg-[#3D4852]/30 backdrop-blur-md text-[10px] font-mono text-[#3D4852] border border-transparent">
                        Slide Preview ({state.carouselItems.findIndex((i) => i.url === state.media?.url) + 1}/{state.carouselItems.length})
                      </span>
                    </div>
                  </div>
                )}

                {/* Slides Row */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {state.carouselItems.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className={`relative w-16 h-16 shrink-0 rounded-xl overflow-hidden border group transition-all ${
                        state.media?.url === item.url
                          ? "border-primary-orange ring-2 ring-primary-orange/30"
                          : "border-border/80 opacity-75 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={item.url}
                        alt={`Slide ${idx + 1}`}
                        onClick={() => onChange((prev) => ({ ...prev, media: item }))}
                        className="w-full h-full object-cover cursor-pointer"
                      />
                      <span className="absolute bottom-0.5 right-0.5 px-1 rounded bg-black/80 text-[8px] font-mono text-[#3D4852] pointer-events-none">
                        #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCarouselItem(idx)}
                        className="absolute top-0.5 right-0.5 p-0.5 rounded bg-rose-950/90 text-rose-300 hover:text-[#3D4852] opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove slide"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => carouselInputRef.current?.click()}
                    className="w-16 h-16 shrink-0 rounded-2xl border-2 border-dashed border-[#A3B1C6] bg-[#E0E5EC] shadow-[inset_3px_3px_6px_rgb(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.5)] flex flex-col items-center justify-center text-[#6B7280] hover:text-[#6C63FF] transition-colors"
                    title="Add slide"
                  >
                    <Plus className="w-4 h-4 text-[#6C63FF]" />
                    <span className="text-[9px] font-bold mt-0.5">Add</span>
                  </button>
                </div>
              </div>
            )}

            {/* Media Metadata Pill & Actions */}
            {state.media && (
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-surface/60 border border-border text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-2xl bg-surface border border-transparent text-[#6C63FF] shrink-0">
                    {state.mediaType === "reel" ? <Video className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#3D4852] truncate max-w-[180px]" title={state.media.name}>
                      {state.media.name}
                    </p>
                    <p className="text-[11px] text-[#6B7280]">
                      {state.media.sizeKb} KB · {state.media.width}×{state.media.height}px · {state.media.format || "MEDIA"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (state.mediaType === "carousel") {
                        carouselInputRef.current?.click();
                      } else {
                        fileInputRef.current?.click();
                      }
                    }}
                    className="px-2.5 py-1 rounded-2xl bg-surface border border-border text-[#6B7280] hover:text-[#3D4852] text-xs inline-flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3 text-[#6C63FF]" />
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveMedia}
                    className="p-1.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:text-rose-100 transition-colors"
                    title="Remove media"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Visual Signals Card (Image / Carousel) */}
            {state.media?.visualMetrics && state.mediaType !== "reel" && (
              <div className="p-4 rounded-xl bg-surface/40 border border-transparent space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                    <Sliders className="w-3.5 h-3.5 text-[#6C63FF]" />
                    <span>Visual Signals (Plan {planId})</span>
                  </div>
                  <span className="text-[10px] text-[#6B7280] font-mono">Calculated properties</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-2xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] border border-transparent">
                    <span className="text-[#6B7280] text-[10px] block mb-0.5">Aspect Ratio</span>
                    <strong className="text-[#3D4852] font-medium text-xs">{state.media.aspectRatio}</strong>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] border border-transparent">
                    <span className="text-[#6B7280] text-[10px] block mb-0.5">Brightness</span>
                    <strong className="text-[#3D4852] font-medium text-xs">
                      {state.media.visualMetrics.brightness_label} ({state.media.visualMetrics.brightness_pct}%)
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] border border-transparent">
                    <span className="text-[#6B7280] text-[10px] block mb-0.5">Contrast</span>
                    <strong className="text-[#3D4852] font-medium text-xs">
                      {state.media.visualMetrics.contrast_label}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] border border-transparent">
                    <span className="text-[#6B7280] text-[10px] block mb-0.5">Text Pattern</span>
                    <strong className="text-[#3D4852] font-medium text-xs">
                      {state.media.visualMetrics.text_presence}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* Reel Signals Card (Reel) */}
            {state.mediaType === "reel" && state.media && (
              <div className="p-4 rounded-xl bg-surface/40 border border-transparent space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                    <Video className="w-3.5 h-3.5 text-[#6C63FF]" />
                    <span>Reel Signals (Plan {planId})</span>
                  </div>
                  <span className="text-[10px] text-[#6B7280] font-mono">Detected media signals</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-2xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] border border-transparent">
                    <span className="text-[#6B7280] text-[10px] block mb-0.5">Duration</span>
                    <strong className="text-[#3D4852] font-medium text-xs">{state.media.durationSec || 15} sec</strong>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] border border-transparent">
                    <span className="text-[#6B7280] text-[10px] block mb-0.5">Resolution</span>
                    <strong className="text-[#3D4852] font-medium text-xs">
                      {state.media.width} × {state.media.height}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] border border-transparent">
                    <span className="text-[#6B7280] text-[10px] block mb-0.5">Audio Stream</span>
                    <strong className="text-[#3D4852] font-medium text-xs">
                      {state.media.audioDetected ? "Detected in Video" : "No Audio Track"}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {uploadError && (
          <div className="mt-3 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#BE123C] shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* SECTION: Planned Audio (CONDITIONAL: ONLY FOR REELS!) */}
      {state.mediaType === "reel" ? (
        <div
          className={`p-4 rounded-2xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] border transition-all space-y-3 ${
            isFieldChanged("audio") ? "border-primary-orange " : "border-border/80"
          }`}
        >
          <div className="flex items-center justify-between">
            <label className="font-bold text-[#6B7280] uppercase tracking-wider text-xs flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-[#6C63FF]" />
              <span>Planned Audio</span>
              {isFieldChanged("audio") && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-orange/20 text-[#6C63FF] border border-transparent animate-pulse">
                  ● Changed
                </span>
              )}
            </label>
            <span className="text-[11px] text-[#6B7280] font-mono">Reel sound configuration</span>
          </div>

          {/* Audio Source Options */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <button
              type="button"
              onClick={() =>
                onChange((prev) => ({
                  ...prev,
                  audioType: "original",
                  audioName: "Original Audio",
                }))
              }
              className={`p-2.5 rounded-xl border text-center transition-all ${
                state.audioType === "original"
                  ? "bg-[#6C63FF] border-transparent text-white font-bold shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)]"
                  : "bg-surface/40 border-border text-[#6B7280] hover:text-[#3D4852]"
              }`}
            >
              Original Audio
            </button>

            <button
              type="button"
              onClick={() =>
                onChange((prev) => ({
                  ...prev,
                  audioType: "custom",
                  audioName: prev.audioName && prev.audioName !== "Original Audio" ? prev.audioName : "Selected Instagram Audio",
                }))
              }
              className={`p-2.5 rounded-xl border text-center transition-all ${
                state.audioType === "custom"
                  ? "bg-[#6C63FF] border-transparent text-white font-bold shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)]"
                  : "bg-surface/40 border-border text-[#6B7280] hover:text-[#3D4852]"
              }`}
            >
              Instagram Audio
            </button>

            <button
              type="button"
              onClick={() =>
                onChange((prev) => ({
                  ...prev,
                  audioType: "uploaded",
                  audioName: "Uploaded Audio Track",
                }))
              }
              className={`p-2.5 rounded-xl border text-center transition-all ${
                state.audioType === "uploaded"
                  ? "bg-[#6C63FF] border-transparent text-white font-bold shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)]"
                  : "bg-surface/40 border-border text-[#6B7280] hover:text-[#3D4852]"
              }`}
            >
              Uploaded Audio
            </button>

            <button
              type="button"
              onClick={() =>
                onChange((prev) => ({
                  ...prev,
                  audioType: "none",
                  audioName: "No Audio (Muted)",
                }))
              }
              className={`p-2.5 rounded-xl border text-center transition-all ${
                state.audioType === "none"
                  ? "bg-[#E0E5EC] border-transparent text-[#3D4852] font-bold shadow-[inset_3px_3px_6px_rgb(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.5)]"
                  : "bg-surface/40 border-border text-[#6B7280] hover:text-[#3D4852]"
              }`}
            >
              No Audio
            </button>
          </div>

          {/* Audio Inputs if not muted */}
          {state.audioType !== "none" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[10px] uppercase font-bold text-[#6B7280] block mb-1">
                  Audio Track Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. CyberPulse Intro / Track Name"
                  value={state.audioName}
                  onChange={(e) => onChange((prev) => ({ ...prev, audioName: e.target.value }))}
                  className="w-full rounded-xl bg-[#E0E5EC] border border-border px-3 py-2 text-[#3D4852] text-xs placeholder-[#A0AEC0] focus:border-transparent"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-[#6B7280] block mb-1">
                  Audio ID / Reference (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. audio_18293740"
                  value={state.audioId}
                  onChange={(e) => onChange((prev) => ({ ...prev, audioId: e.target.value }))}
                  className="w-full rounded-xl bg-[#E0E5EC] border border-border px-3 py-2 text-[#3D4852] text-xs placeholder-[#A0AEC0] focus:border-transparent"
                />
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-surface/30 border border-transparent text-xs text-[#6B7280] flex items-center gap-2">
              <VolumeX className="w-4 h-4 text-[#6B7280] shrink-0" />
              <span>No audio stream selected (silent Reel).</span>
            </div>
          )}

          <p className="text-[10px] text-[#6B7280] font-mono">
            Trend status: Unknown / Telemetry not indexed · Analyzed for creative planning
          </p>
        </div>
      ) : (
        /* Subtle informational note for Image & Carousel */
        <div className="p-3 rounded-xl bg-surface/30 border border-transparent flex items-center justify-between text-xs text-[#6B7280]">
          <div className="flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>Planned Audio:</span>
          </div>
          <span className="font-mono text-[#6B7280] text-[11px]">
            Audio applies to Reels only
          </span>
        </div>
      )}

      {/* SECTION: Caption */}
      <div
        className={`space-y-2 p-4 rounded-2xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] border transition-all ${
          isFieldChanged("caption") ? "border-primary-orange " : "border-border/80"
        }`}
      >
        <div className="flex items-center justify-between">
          <label htmlFor={`caption-${planId}`} className="flex items-center gap-2 font-bold text-[#6B7280] uppercase tracking-wider text-xs">
            <span>Caption</span>
            {isFieldChanged("caption") && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-orange/20 text-[#6C63FF] border border-transparent animate-pulse">
                ● Changed
              </span>
            )}
          </label>
          <span className="text-[11px] text-[#6B7280]">
            {captionData.metrics.words} words
          </span>
        </div>

        <textarea
          id={`caption-${planId}`}
          rows={4}
          value={state.caption}
          onChange={(e) => onChange((prev) => ({ ...prev, caption: e.target.value }))}
          placeholder="Write the caption for this version..."
          className="w-full rounded-xl bg-[#E0E5EC] border border-border p-3 text-[#3D4852] text-xs placeholder-[#A0AEC0] focus:border-transparent leading-relaxed"
        />

        {state.caption.trim() ? (
          <div className="flex flex-wrap gap-1.5 text-[11px] text-[#6B7280]">
            <span className="px-2 py-0.5 rounded-full bg-[#E0E5EC] shadow-[inset_2px_2px_4px_rgb(163,177,198,0.45),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]">
              {captionData.metrics.hashtags} hashtags
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#E0E5EC] shadow-[inset_2px_2px_4px_rgb(163,177,198,0.45),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]">
              {captionData.metrics.emojis} emoji
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#E0E5EC] shadow-[inset_2px_2px_4px_rgb(163,177,198,0.45),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]">
              {captionData.metrics.questions} questions
            </span>
            {captionData.structure.has_cta && (
              <span className="px-2 py-0.5 rounded-full text-[#0F766E]">
                Asks people to respond
              </span>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-[#6B7280]">A caption is required before you can compare.</p>
        )}
      </div>

      {/* SECTION: Publishing Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Followers */}
        <div
          className={`p-3.5 rounded-xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] border transition-all ${
            isFieldChanged("followers") ? "border-primary-orange " : "border-border/80"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor={`followers-${planId}`} className="font-bold text-[#6B7280] uppercase tracking-wider text-[11px]">
              Account followers
            </label>
            {isFieldChanged("followers") && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-primary-orange/20 text-[#6C63FF]">
                ● Changed
              </span>
            )}
          </div>
          <input
            id={`followers-${planId}`}
            type="number"
            min={1}
            value={state.followers}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                followers: Math.max(1, parseInt(e.target.value) || 1),
              }))
            }
            className="w-full rounded-xl bg-[#E0E5EC] border border-border p-2.5 text-[#3D4852] focus:border-transparent"
          />
        </div>

        {/* Date & Time */}
        <div
          className={`p-3.5 rounded-xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] border transition-all ${
            isFieldChanged("time") || isFieldChanged("date")
              ? "border-primary-orange "
              : "border-border/80"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-bold text-[#6B7280] uppercase tracking-wider text-[11px]">
              Posting date and time (UTC)
            </label>
            {(isFieldChanged("time") || isFieldChanged("date")) && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-primary-orange/20 text-[#6C63FF]">
                ● Changed
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={state.date}
              onChange={(e) => onChange((prev) => ({ ...prev, date: e.target.value }))}
              className="w-full rounded-xl bg-[#E0E5EC] border border-border p-2 text-[#3D4852] text-xs focus:border-transparent"
            />
            <input
              type="time"
              value={state.time}
              onChange={(e) => onChange((prev) => ({ ...prev, time: e.target.value }))}
              className="w-full rounded-xl bg-[#E0E5EC] border border-border p-2 text-[#3D4852] text-xs focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
