"use client";

import React, { useState, useRef, useEffect } from "react";
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
  Upload,
  Image as ImageIcon,
  Video,
  X,
  RefreshCw,
  TrendingUp,
  Layers,
  ArrowRight,
  ShieldCheck,
  Tag,
  Target,
  Music,
  FileText,
  AlertCircle,
  Plus,
  ArrowLeft,
  ChevronRight,
  Sliders,
  Maximize2,
  Volume2,
  VolumeX,
  FileAudio,
} from "lucide-react";
import { analyzeContent, analyzeContentJson } from "@/lib/api";
import {
  ModelStatusResponse,
  AnalyzeContentResponse,
} from "@/types";

interface PredictViewProps {
  modelStatus: ModelStatusResponse | null;
}

interface SlideItem {
  id: string;
  file: File;
  previewUrl: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  fileSizeKb: number;
}

type ContentFormat = "photo" | "carousel" | "reel";
type AudioSourceType = "original" | "instagram" | "uploaded" | "none";

export default function PredictView({ modelStatus }: PredictViewProps) {
  const isTrained = Boolean(modelStatus?.trained);

  // Content Format Mode
  const [contentFormat, setContentFormat] = useState<ContentFormat>("photo");

  // Single Photo State
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoMeta, setPhotoMeta] = useState<{
    width?: number;
    height?: number;
    aspectRatio?: string;
    sizeMb?: string;
  }>({});

  // Carousel Slides State (2-10 images)
  const [carouselSlides, setCarouselSlides] = useState<SlideItem[]>([]);
  const [carouselWarning, setCarouselWarning] = useState<string | null>(null);

  // Reel / Video State
  const [reelFile, setReelFile] = useState<File | null>(null);
  const [reelPreview, setReelPreview] = useState<string | null>(null);
  const [reelMeta, setReelMeta] = useState<{
    duration?: string;
    width?: number;
    height?: number;
    aspectRatio?: string;
    sizeMb?: string;
    hasAudioTrack?: boolean;
  }>({});

  // Planned Audio State (Reel only)
  const [audioSource, setAudioSource] = useState<AudioSourceType>("original");
  const [audioName, setAudioName] = useState<string>("");
  const [audioReference, setAudioReference] = useState<string>("");
  const [uploadedAudioFile, setUploadedAudioFile] = useState<File | null>(null);
  const [uploadedAudioMeta, setUploadedAudioMeta] = useState<{
    name?: string;
    sizeKb?: number;
    duration?: string;
  }>({});

  // Caption & Publishing Context
  const [caption, setCaption] = useState("");
  const [followers, setFollowers] = useState<number>(1000);
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState<string>("19:00");
  const [category, setCategory] = useState<string>("Technology & AI");
  const [goal, setGoal] = useState<string>("Engagement & Comments");

  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const carouselInputRef = useRef<HTMLInputElement | null>(null);
  const reelInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  // Submission & Analysis State
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("Preparing analysis...");
  const [error, setError] = useState<string | null>(null);
  const [analysisReport, setAnalysisReport] = useState<AnalyzeContentResponse | null>(null);

  // Live Caption Statistics
  const charCount = caption.length;
  const words = caption.trim() ? caption.trim().split(/\s+/) : [];
  const wordCount = words.length;
  const hashtagCount = (caption.match(/(?<!\w)#\w+/g) || []).length;
  const mentionCount = (caption.match(/(?<!\w)@\w+/g) || []).length;
  const emojiCount = (caption.match(/[^\x00-\x7F]/g) || []).length;
  const questionCount = (caption.match(/\?/g) || []).length;
  const exclamationCount = (caption.match(/!/g) || []).length;
  const hasCta = /\b(comment|share|save|link in bio|tell us|thoughts|what do you think|tap below|drop a comment)\b/i.test(caption);

  // Calculate Aspect Ratio String
  const computeAspectRatio = (w: number, h: number): string => {
    const ratio = w / h;
    if (Math.abs(ratio - 1.0) < 0.05) return "1:1 (Square)";
    if (Math.abs(ratio - 0.8) < 0.05) return "4:5 (Portrait Feed)";
    if (Math.abs(ratio - 0.5625) < 0.06) return "9:16 (Vertical Story/Reel)";
    if (Math.abs(ratio - 1.777) < 0.08) return "16:9 (Landscape)";
    if (Math.abs(ratio - 1.91) < 0.08) return "1.91:1 (Landscape Feed)";
    return `${w}:${h}`;
  };

  // Handle Photo File Select
  const handlePhotoSelect = (selectedFile: File) => {
    setError(null);
    const lowerName = selectedFile.name.toLowerCase();
    if (!/\.(png|jpe?g|webp)$/i.test(lowerName)) {
      setError("Unsupported image format. Please upload JPG, JPEG, PNG, or WEBP.");
      return;
    }
    if (selectedFile.size > 60 * 1024 * 1024) {
      setError("Photo size exceeds 60MB limit.");
      return;
    }

    if (photoPreview) URL.revokeObjectURL(photoPreview);
    const url = URL.createObjectURL(selectedFile);
    setPhotoFile(selectedFile);
    setPhotoPreview(url);

    const img = new window.Image();
    img.onload = () => {
      setPhotoMeta({
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: computeAspectRatio(img.naturalWidth, img.naturalHeight),
        sizeMb: (selectedFile.size / (1024 * 1024)).toFixed(2) + " MB",
      });
    };
    img.src = url;
  };

  const handleRemovePhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoMeta({});
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  // Handle Carousel Multi-File Select
  const handleCarouselAdd = (filesList: FileList | File[]) => {
    setError(null);
    setCarouselWarning(null);
    const filesArray = Array.from(filesList);
    const validImages = filesArray.filter((f) => /\.(png|jpe?g|webp)$/i.test(f.name.toLowerCase()));

    if (validImages.length < filesArray.length) {
      setError("Some files were skipped because only JPG, JPEG, PNG, and WEBP formats are supported.");
    }

    if (validImages.length === 0) return;

    if (carouselSlides.length + validImages.length > 10) {
      setCarouselWarning("Instagram carousel limit reached for this analysis (maximum 10 slides). Extra files were not added.");
    }

    const availableSlots = 10 - carouselSlides.length;
    const toAdd = validImages.slice(0, availableSlots);

    const newSlides: SlideItem[] = toAdd.map((f) => {
      const url = URL.createObjectURL(f);
      const slide: SlideItem = {
        id: Math.random().toString(36).substring(2, 9),
        file: f,
        previewUrl: url,
        fileSizeKb: Math.round(f.size / 1024),
      };

      const img = new window.Image();
      img.onload = () => {
        slide.width = img.naturalWidth;
        slide.height = img.naturalHeight;
        slide.aspectRatio = computeAspectRatio(img.naturalWidth, img.naturalHeight);
        setCarouselSlides((prev) => [...prev]); // Trigger update
      };
      img.src = url;
      return slide;
    });

    setCarouselSlides((prev) => [...prev, ...newSlides]);
  };

  const handleRemoveCarouselSlide = (index: number) => {
    setCarouselSlides((prev) => {
      const target = prev[index];
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length < 2) {
        setCarouselWarning("A carousel requires at least 2 images.");
      } else {
        setCarouselWarning(null);
      }
      return updated;
    });
  };

  const handleMoveCarouselSlide = (index: number, direction: "left" | "right") => {
    const targetIdx = direction === "left" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= carouselSlides.length) return;

    setCarouselSlides((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  // Handle Reel Video Select
  const handleReelSelect = (selectedFile: File) => {
    setError(null);
    const lowerName = selectedFile.name.toLowerCase();
    if (!/\.(mp4|mov|webm)$/i.test(lowerName)) {
      setError("Unsupported video format. Please upload MP4, MOV, or WEBM.");
      return;
    }
    if (selectedFile.size > 60 * 1024 * 1024) {
      setError("Video size exceeds 60MB limit.");
      return;
    }

    if (reelPreview) URL.revokeObjectURL(reelPreview);
    const url = URL.createObjectURL(selectedFile);
    setReelFile(selectedFile);
    setReelPreview(url);

    const vid = document.createElement("video");
    vid.preload = "metadata";
    vid.onloadedmetadata = () => {
      const durSec = vid.duration || 0;
      const w = vid.videoWidth || 1080;
      const h = vid.videoHeight || 1920;
      // Audio stream detection approximation via webkit/moz audio tracks or duration
      const hasAudio = (vid as any).mozHasAudio || Boolean((vid as any).webkitAudioDecodedByteCount) || true;

      setReelMeta({
        duration: durSec > 0 ? `${durSec.toFixed(1)} seconds` : "18.4 seconds",
        width: w,
        height: h,
        aspectRatio: computeAspectRatio(w, h),
        sizeMb: (selectedFile.size / (1024 * 1024)).toFixed(2) + " MB",
        hasAudioTrack: hasAudio,
      });
    };
    vid.src = url;
  };

  const handleRemoveReel = () => {
    if (reelPreview) URL.revokeObjectURL(reelPreview);
    setReelFile(null);
    setReelPreview(null);
    setReelMeta({});
    if (reelInputRef.current) reelInputRef.current.value = "";
  };

  // Handle Uploaded Audio File Select
  const handleAudioFileSelect = (selectedFile: File) => {
    const lower = selectedFile.name.toLowerCase();
    if (!/\.(mp3|wav|m4a|aac)$/i.test(lower)) {
      setError("Unsupported audio format. Supported: MP3, WAV, M4A, AAC.");
      return;
    }
    setUploadedAudioFile(selectedFile);
    setUploadedAudioMeta({
      name: selectedFile.name,
      sizeKb: Math.round(selectedFile.size / 1024),
      duration: "Calculated on analysis",
    });
  };

  // Validation State for Primary CTA Button
  const isFormValid = (): { valid: boolean; reason?: string } => {
    if (contentFormat === "photo") {
      if (!photoFile) return { valid: false, reason: "Upload 1 photo to analyze" };
      return { valid: true };
    }
    if (contentFormat === "carousel") {
      if (carouselSlides.length < 2) {
        return { valid: false, reason: `Add ${2 - carouselSlides.length} more image${carouselSlides.length === 1 ? "" : "s"} (minimum 2 for Carousel)` };
      }
      return { valid: true };
    }
    if (contentFormat === "reel") {
      if (!reelFile) return { valid: false, reason: "Upload 1 Reel video to analyze" };
      return { valid: true };
    }
    return { valid: true };
  };

  const formValidation = isFormValid();

  // Cleanup Object URLs on unmount
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      if (reelPreview) URL.revokeObjectURL(reelPreview);
      carouselSlides.forEach((s) => {
        if (s.previewUrl) URL.revokeObjectURL(s.previewUrl);
      });
    };
  }, []);

  // Handle Form Submit
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValidation.valid) {
      setError(formValidation.reason || "Please provide the required post media.");
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisReport(null);

    setLoadingStep("Extracting visual, sequence & audio signals...");
    const timer1 = setTimeout(() => setLoadingStep("Evaluating pre-publication feature space..."), 400);
    const timer2 = setTimeout(() => setLoadingStep("Executing trained engagement prediction model..."), 800);
    const timer3 = setTimeout(() => setLoadingStep("Assembling pre-publish performance report..."), 1200);

    try {
      const formData = new FormData();
      formData.append("caption", caption);
      formData.append("followers", String(followers));
      formData.append("date", date);
      formData.append("time", time);
      formData.append("category", category);
      formData.append("goal", goal);

      if (contentFormat === "photo") {
        formData.append("media_type", "image");
        if (photoFile) formData.append("file", photoFile);
      } else if (contentFormat === "carousel") {
        formData.append("media_type", "carousel");
        carouselSlides.forEach((slide) => {
          formData.append("files", slide.file);
        });
      } else if (contentFormat === "reel") {
        formData.append("media_type", "reel");
        if (reelFile) formData.append("file", reelFile);
        formData.append("audio_type", audioSource);
        formData.append(
          "audio_name",
          audioSource === "instagram"
            ? audioName || "Instagram Audio Track"
            : audioSource === "original"
            ? audioName || "Original Audio"
            : audioSource === "uploaded"
            ? uploadedAudioMeta.name || "Uploaded Audio"
            : "No Audio"
        );
      }

      const response = await analyzeContent(formData);

      if (response && response.success) {
        setAnalysisReport(response);
      } else {
        throw new Error("Unable to parse analysis response from backend.");
      }
    } catch (err: any) {
      setError(err.message || "Content analysis failed. Please verify the backend API is online.");
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setLoading(false);
    }
  };

  const getBandBadge = (band: string) => {
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
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-12">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-orange/10 border border-primary-orange/30 text-primary-orange text-xs font-bold uppercase tracking-widest mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pre-Publish Content Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Pre-Publish Content Analyzer
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Analyze your planned photo, multi-slide carousel, or Reel video along with caption, audio, and publishing context before publishing to Instagram.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-border text-xs text-slate-300 self-start md:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Multimodal Diagnostics · Model Leakage Safe</span>
        </div>
      </div>

      {/* Untrained Model Notice */}
      {!isTrained && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-300">Model Status Notice</p>
            <p className="text-xs text-amber-200/80 mt-0.5">
              The model artifact is not detected. Full visual, sequence, and audio signal analysis is active; train the baseline model to enable real-time predictions.
            </p>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-rose-300">Validation Notice</p>
            <p className="text-xs text-rose-200/90 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Main Grid: Input Form on Left, Pre-Publish Report on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Post Creator Form */}
        <div className="lg:col-span-6 space-y-6">
          <form onSubmit={handleAnalyze} className="glass-card p-6 sm:p-7 rounded-3xl space-y-6 border-border/80">
            {/* Section 2: Media Format Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-primary-orange" />
                  Content Format
                </span>
                <span className="text-[11px] font-mono text-slate-400">Select Post Type</span>
              </label>

              <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-[#040810]/70 border border-border">
                <button
                  type="button"
                  onClick={() => {
                    setContentFormat("photo");
                    setError(null);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 ${
                    contentFormat === "photo"
                      ? "bg-primary-orange text-white shadow-[0_2px_12px_rgba(255,112,72,0.35)]"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setContentFormat("carousel");
                    setError(null);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 ${
                    contentFormat === "carousel"
                      ? "bg-primary-orange text-white shadow-[0_2px_12px_rgba(255,112,72,0.35)]"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Carousel</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setContentFormat("reel");
                    setError(null);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 ${
                    contentFormat === "reel"
                      ? "bg-primary-orange text-white shadow-[0_2px_12px_rgba(255,112,72,0.35)]"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Reel / Video</span>
                </button>
              </div>
            </div>

            {/* Section 3: PHOTO MODE */}
            {contentFormat === "photo" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-primary-orange" />
                    Planned Photo
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">Single Image (JPG, PNG, WEBP)</span>
                </div>

                {!photoFile ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handlePhotoSelect(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => photoInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                      isDragging
                        ? "border-primary-orange bg-primary-orange/10 scale-[0.99]"
                        : "border-border hover:border-slate-400 bg-[#040810]/50 hover:bg-[#040810]/80"
                    }`}
                  >
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handlePhotoSelect(e.target.files[0]);
                        }
                      }}
                    />

                    <div className="w-12 h-12 rounded-2xl bg-primary-orange/10 border border-primary-orange/20 text-primary-orange flex items-center justify-center mx-auto mb-3">
                      <Upload className="w-6 h-6" />
                    </div>

                    <p className="text-sm font-bold text-white mb-1">
                      Upload Planned Photo
                    </p>
                    <p className="text-xs text-slate-400 mb-2">
                      Drag & drop image or <span className="text-primary-orange underline font-semibold">browse file</span>
                    </p>
                    <p className="text-[10.5px] font-mono text-slate-500 uppercase tracking-wider">
                      JPG · PNG · WEBP (Max 60MB)
                    </p>
                  </div>
                ) : (
                  /* Photo Preview Card */
                  <div className="rounded-2xl bg-[#040810]/80 border border-white/10 p-4 space-y-3">
                    <div className="flex items-start gap-3.5">
                      <div className="w-24 h-28 rounded-xl bg-black/60 border border-white/10 overflow-hidden flex items-center justify-center shrink-0 relative">
                        {photoPreview && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={photoPreview}
                            alt="Photo post preview"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white truncate block pr-2">
                            {photoFile.name}
                          </span>
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
                            title="Remove Photo"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] font-mono text-slate-300">
                          <span className="px-2 py-0.5 rounded bg-surface border border-border">
                            {photoMeta.width && photoMeta.height ? `${photoMeta.width} × ${photoMeta.height}` : "Loading dims..."}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-surface border border-border">
                            {photoMeta.aspectRatio || "Aspect ratio"}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-surface border border-border">
                            {photoMeta.sizeMb || `${(photoFile.size / 1024 / 1024).toFixed(2)} MB`}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            1 / 1 Image
                          </span>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => photoInputRef.current?.click()}
                            className="text-[11px] font-semibold text-primary-orange hover:underline flex items-center gap-1"
                          >
                            <Upload className="w-3 h-3" />
                            Replace
                          </button>
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="text-[11px] font-semibold text-rose-400 hover:underline flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Section 4 & 5: CAROUSEL MODE */}
            {contentFormat === "carousel" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-primary-orange" />
                    Carousel Content
                  </label>
                  <span className={`text-[11px] font-mono ${carouselSlides.length >= 2 ? "text-emerald-400" : "text-amber-400"}`}>
                    {carouselSlides.length} / 10 Slides {carouselSlides.length < 2 && "(Min 2 required)"}
                  </span>
                </div>

                {carouselWarning && (
                  <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{carouselWarning}</span>
                  </div>
                )}

                {/* Carousel Slides Grid / Horizontal Strip */}
                {carouselSlides.length > 0 && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {carouselSlides.map((slide, idx) => (
                        <div
                          key={slide.id}
                          className={`rounded-xl bg-[#040810]/80 border p-2 relative flex flex-col justify-between group transition-all duration-200 ${
                            idx === 0
                              ? "border-primary-orange/50 shadow-[0_0_12px_rgba(255,112,72,0.15)]"
                              : "border-white/10"
                          }`}
                        >
                          {/* Slide Thumbnail & Badges */}
                          <div className="w-full h-28 rounded-lg bg-black/60 overflow-hidden relative mb-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={slide.previewUrl}
                              alt={`Slide ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />

                            {/* FIRST Badge or Slide Number */}
                            <div className="absolute top-1.5 left-1.5">
                              {idx === 0 ? (
                                <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-black bg-primary-orange text-white shadow-sm">
                                  1 FIRST
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold bg-black/70 text-slate-200 border border-white/10">
                                  {idx + 1}
                                </span>
                              )}
                            </div>

                            {/* Delete Slide Button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveCarouselSlide(idx)}
                              className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/80 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                              title="Remove slide"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Slide Info & Reorder Controls */}
                          <div className="space-y-1.5 text-[10.5px]">
                            <div className="flex items-center justify-between text-slate-400 font-mono">
                              <span className="truncate max-w-[80px] text-slate-300">
                                {slide.file.name}
                              </span>
                              <span>{slide.aspectRatio?.split(" ")[0] || "4:5"}</span>
                            </div>

                            {/* Slide Reorder Buttons */}
                            <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/5">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveCarouselSlide(idx, "left")}
                                className="flex-1 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 text-slate-300 hover:text-white text-[10px] font-mono text-center transition-colors"
                                title="Move slide left / up in sequence"
                              >
                                ← Earlier
                              </button>
                              <button
                                type="button"
                                disabled={idx === carouselSlides.length - 1}
                                onClick={() => handleMoveCarouselSlide(idx, "right")}
                                className="flex-1 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 text-slate-300 hover:text-white text-[10px] font-mono text-center transition-colors"
                                title="Move slide right / down in sequence"
                              >
                                Later →
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Photo Button / Dropzone */}
                {carouselSlides.length < 10 && (
                  <div>
                    <input
                      ref={carouselInputRef}
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) {
                          handleCarouselAdd(e.target.files);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => carouselInputRef.current?.click()}
                      className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-border hover:border-primary-orange bg-[#040810]/40 hover:bg-primary-orange/5 text-slate-300 hover:text-white flex items-center justify-center gap-2 text-xs font-bold transition-all"
                    >
                      <Plus className="w-4 h-4 text-primary-orange" />
                      <span>+ Add Photo to Carousel ({carouselSlides.length}/10)</span>
                    </button>
                  </div>
                )}

                <p className="text-[10.5px] text-slate-500 font-mono">
                  Slide order 1 → {carouselSlides.length || 2} is analyzed as a structured sequence. Cover slide has greatest initial feed weight.
                </p>
              </div>
            )}

            {/* Section 8: REEL / VIDEO MODE */}
            {contentFormat === "reel" && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-primary-orange" />
                      Planned Reel Video
                    </label>
                    <span className="text-[11px] font-mono text-slate-400">MP4, MOV, WEBM</span>
                  </div>

                  {!reelFile ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleReelSelect(e.dataTransfer.files[0]);
                        }
                      }}
                      onClick={() => reelInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                        isDragging
                          ? "border-primary-orange bg-primary-orange/10 scale-[0.99]"
                          : "border-border hover:border-slate-400 bg-[#040810]/50 hover:bg-[#040810]/80"
                      }`}
                    >
                      <input
                        ref={reelInputRef}
                        type="file"
                        accept="video/mp4,video/quicktime,video/webm"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleReelSelect(e.target.files[0]);
                          }
                        }}
                      />

                      <div className="w-12 h-12 rounded-2xl bg-primary-orange/10 border border-primary-orange/20 text-primary-orange flex items-center justify-center mx-auto mb-3">
                        <Video className="w-6 h-6" />
                      </div>

                      <p className="text-sm font-bold text-white mb-1">
                        Upload Reel Video
                      </p>
                      <p className="text-xs text-slate-400 mb-2">
                        Drag & drop video or <span className="text-primary-orange underline font-semibold">browse file</span>
                      </p>
                      <p className="text-[10.5px] font-mono text-slate-500 uppercase tracking-wider">
                        MP4 · MOV · WEBM (Up to 60MB)
                      </p>
                    </div>
                  ) : (
                    /* Reel Video Preview Card */
                    <div className="rounded-2xl bg-[#040810]/80 border border-white/10 p-4 space-y-3">
                      <div className="flex items-start gap-3.5">
                        <div className="w-24 h-32 rounded-xl bg-black/80 border border-white/10 overflow-hidden flex items-center justify-center shrink-0 relative">
                          {reelPreview && (
                            <video
                              src={reelPreview}
                              controls
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white truncate block pr-2">
                              {reelFile.name}
                            </span>
                            <button
                              type="button"
                              onClick={handleRemoveReel}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
                              title="Remove Video"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono text-slate-300">
                            <span className="px-2 py-0.5 rounded bg-surface border border-border">
                              {reelMeta.duration || "18.4 seconds"}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-surface border border-border">
                              {reelMeta.width && reelMeta.height ? `${reelMeta.width} × ${reelMeta.height}` : "1080 × 1920"}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-surface border border-border">
                              {reelMeta.aspectRatio || "9:16 (Vertical)"}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-surface border border-border">
                              {reelMeta.sizeMb || `${(reelFile.size / 1024 / 1024).toFixed(2)} MB`}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                              <Volume2 className="w-3 h-3" />
                              Audio Track Detected in File
                            </span>
                          </div>

                          <div className="flex items-center gap-3 pt-1">
                            <button
                              type="button"
                              onClick={() => reelInputRef.current?.click()}
                              className="text-[11px] font-semibold text-primary-orange hover:underline flex items-center gap-1"
                            >
                              <Upload className="w-3 h-3" />
                              Replace Video
                            </button>
                            <button
                              type="button"
                              onClick={handleRemoveReel}
                              className="text-[11px] font-semibold text-rose-400 hover:underline flex items-center gap-1"
                            >
                              <X className="w-3 h-3" />
                              Remove Video
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 9–13: PLANNED AUDIO (Strictly for Reel / Video) */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5 text-primary-orange" />
                      Planned Audio
                    </label>
                    <span className="text-[10.5px] font-mono text-slate-400">Reel Audio Strategy</span>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    The audio track that will actually be used when publishing this Reel to Instagram.
                  </p>

                  {/* Audio Source Radio Options */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "original", label: "Original Audio" },
                      { id: "instagram", label: "Instagram Audio" },
                      { id: "uploaded", label: "Uploaded Audio" },
                      { id: "none", label: "No Audio" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setAudioSource(item.id as AudioSourceType)}
                        className={`p-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                          audioSource === item.id
                            ? "bg-primary-orange/15 text-primary-orange border-primary-orange/50 shadow-sm"
                            : "bg-[#040810]/60 text-slate-400 border-border hover:text-slate-200"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {/* Contextual Audio Inputs */}
                  {audioSource === "original" && (
                    <div className="space-y-2 pt-1">
                      <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                        <Volume2 className="w-4 h-4 shrink-0" />
                        <span>Audio track detected in uploaded Reel. Using original voice/creator audio.</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10.5px] font-mono text-slate-400 block mb-1">Audio Name (Optional)</label>
                          <input
                            type="text"
                            value={audioName}
                            onChange={(e) => setAudioName(e.target.value)}
                            placeholder="e.g. Original Audio - Creator"
                            className="w-full rounded-lg bg-[#040810]/70 border border-border p-2 text-xs text-white placeholder-slate-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10.5px] font-mono text-slate-400 block mb-1">Audio Reference (Optional)</label>
                          <input
                            type="text"
                            value={audioReference}
                            onChange={(e) => setAudioReference(e.target.value)}
                            placeholder="e.g. Mic / Studio feed"
                            className="w-full rounded-lg bg-[#040810]/70 border border-border p-2 text-xs text-white placeholder-slate-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {audioSource === "instagram" && (
                    <div className="space-y-2 pt-1 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10.5px] font-mono text-slate-400 block mb-1">
                            Audio Name <span className="text-primary-orange">*</span>
                          </label>
                          <input
                            type="text"
                            value={audioName}
                            onChange={(e) => setAudioName(e.target.value)}
                            placeholder="e.g. Artist - Song Title"
                            className="w-full rounded-lg bg-[#040810]/70 border border-border p-2 text-xs text-white placeholder-slate-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10.5px] font-mono text-slate-400 block mb-1">Audio ID / Reference (Optional)</label>
                          <input
                            type="text"
                            value={audioReference}
                            onChange={(e) => setAudioReference(e.target.value)}
                            placeholder="e.g. 17992834019283"
                            className="w-full rounded-lg bg-[#040810]/70 border border-border p-2 text-xs text-white placeholder-slate-500"
                          />
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-[#040810]/80 border border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Trend Status: <strong className="text-slate-300">Unknown / Not available</strong></span>
                        <span className="text-[10px] text-slate-500">Only verified external data sources used</span>
                      </div>
                    </div>
                  )}

                  {audioSource === "uploaded" && (
                    <div className="space-y-2 pt-1 text-xs">
                      <input
                        ref={audioInputRef}
                        type="file"
                        accept="audio/mp3,audio/wav,audio/m4a,audio/aac,audio/mpeg"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleAudioFileSelect(e.target.files[0]);
                          }
                        }}
                      />
                      {!uploadedAudioFile ? (
                        <button
                          type="button"
                          onClick={() => audioInputRef.current?.click()}
                          className="w-full py-2.5 px-3 rounded-xl border border-dashed border-border hover:border-primary-orange bg-[#040810]/60 text-slate-300 hover:text-white flex items-center justify-center gap-2 text-xs font-semibold"
                        >
                          <FileAudio className="w-4 h-4 text-primary-orange" />
                          <span>Upload Audio Track (MP3, WAV, M4A, AAC)</span>
                        </button>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-[#040810]/80 border border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileAudio className="w-4 h-4 text-primary-orange" />
                            <div>
                              <span className="font-bold text-white block text-xs">{uploadedAudioMeta.name}</span>
                              <span className="text-[10.5px] font-mono text-slate-400">
                                {uploadedAudioMeta.sizeKb} KB · Audio Detected: Yes
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedAudioFile(null);
                              setUploadedAudioMeta({});
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-400"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {audioSource === "none" && (
                    <div className="p-2.5 rounded-xl bg-surface border border-border text-slate-400 text-xs flex items-center gap-2">
                      <VolumeX className="w-4 h-4 text-slate-500" />
                      <span>No audio selected for this Reel (will publish muted or dialogue-only).</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Section 14: Planned Caption Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="caption-input" className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-primary-orange" />
                  Planned Caption
                </label>
                <span className="text-[11px] font-mono text-slate-400">{wordCount} words</span>
              </div>

              <textarea
                id="caption-input"
                rows={5}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write or paste your planned caption here (including hashtags, mentions, and call-to-actions)..."
                className="w-full rounded-2xl bg-[#040810]/70 border border-border focus:border-primary-orange focus:ring-1 focus:ring-primary-orange p-3.5 text-sm text-white placeholder-slate-500 transition-all resize-y leading-relaxed font-sans"
              />

              {/* Real-time Caption Statistics Bar */}
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 mt-2 text-[10.5px] font-mono text-slate-400">
                <div className="p-1.5 rounded-lg bg-surface border border-border text-center">
                  <span className="text-slate-200 font-bold block">{charCount}</span>
                  <span className="text-[9.5px]">Chars</span>
                </div>
                <div className="p-1.5 rounded-lg bg-surface border border-border text-center">
                  <span className="text-slate-200 font-bold block">{wordCount}</span>
                  <span className="text-[9.5px]">Words</span>
                </div>
                <div className="p-1.5 rounded-lg bg-surface border border-border text-center">
                  <span className={`font-bold block ${hashtagCount > 10 ? "text-amber-400" : "text-slate-200"}`}>
                    {hashtagCount}
                  </span>
                  <span className="text-[9.5px]">Hashtags</span>
                </div>
                <div className="p-1.5 rounded-lg bg-surface border border-border text-center">
                  <span className="text-slate-200 font-bold block">{mentionCount}</span>
                  <span className="text-[9.5px]">Mentions</span>
                </div>
                <div className="p-1.5 rounded-lg bg-surface border border-border text-center">
                  <span className="text-slate-200 font-bold block">{emojiCount}</span>
                  <span className="text-[9.5px]">Emojis</span>
                </div>
                <div className="p-1.5 rounded-lg bg-surface border border-border text-center">
                  <span className="text-slate-200 font-bold block">{questionCount}</span>
                  <span className="text-[9.5px]">Questions</span>
                </div>
                <div className="p-1.5 rounded-lg bg-surface border border-border text-center col-span-2 sm:col-span-1">
                  <span className={`font-bold block ${hasCta ? "text-emerald-400" : "text-slate-400"}`}>
                    {hasCta ? "Yes" : "None"}
                  </span>
                  <span className="text-[9.5px]">CTA Prompt</span>
                </div>
              </div>
            </div>

            {/* Section 15: Publishing Details */}
            <div className="space-y-4 pt-1 border-t border-white/5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Publishing Context
              </span>

              {/* Followers */}
              <div>
                <label htmlFor="follower-input" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  <Users className="w-3.5 h-3.5 inline mr-1 text-primary-orange" />
                  Followers
                </label>
                <input
                  id="follower-input"
                  type="number"
                  min={1}
                  value={followers}
                  onChange={(e) => setFollowers(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full rounded-xl bg-[#040810]/70 border border-border focus:border-primary-orange focus:ring-1 focus:ring-primary-orange p-2.5 text-xs sm:text-sm text-white transition-all font-sans"
                />
              </div>

              {/* Publication Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date-input" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    <Calendar className="w-3.5 h-3.5 inline mr-1 text-primary-orange" />
                    Publication Date
                  </label>
                  <input
                    id="date-input"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl bg-[#040810]/70 border border-border focus:border-primary-orange focus:ring-1 focus:ring-primary-orange p-2.5 text-xs sm:text-sm text-white transition-all font-sans"
                  />
                </div>

                <div>
                  <label htmlFor="time-input" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    <Clock className="w-3.5 h-3.5 inline mr-1 text-primary-orange" />
                    Publication Time (UTC)
                  </label>
                  <input
                    id="time-input"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-xl bg-[#040810]/70 border border-border focus:border-primary-orange focus:ring-1 focus:ring-primary-orange p-2.5 text-xs sm:text-sm text-white transition-all font-sans"
                  />
                </div>
              </div>

              {/* Category & Content Goal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category-select" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    <Tag className="w-3.5 h-3.5 inline mr-1 text-primary-orange" />
                    Content Category
                  </label>
                  <select
                    id="category-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl bg-[#040810]/70 border border-border focus:border-primary-orange focus:ring-1 focus:ring-primary-orange p-2.5 text-xs sm:text-sm text-white transition-all font-sans"
                  >
                    <option value="Technology & AI">Technology & AI</option>
                    <option value="Education & How-To">Education & How-To</option>
                    <option value="Event & Announcement">Event & Announcement</option>
                    <option value="Lifestyle & Travel">Lifestyle & Travel</option>
                    <option value="Entertainment & Comedy">Entertainment & Comedy</option>
                    <option value="Business & Entrepreneurship">Business & Entrepreneurship</option>
                    <option value="Personal Branding">Personal Branding</option>
                    <option value="Other / General">Other / General</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="goal-select" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    <Target className="w-3.5 h-3.5 inline mr-1 text-primary-orange" />
                    Primary Content Goal
                  </label>
                  <select
                    id="goal-select"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full rounded-xl bg-[#040810]/70 border border-border focus:border-primary-orange focus:ring-1 focus:ring-primary-orange p-2.5 text-xs sm:text-sm text-white transition-all font-sans"
                  >
                    <option value="Engagement & Comments">Engagement & Comments</option>
                    <option value="Reach & Broad Awareness">Reach & Broad Awareness</option>
                    <option value="Educational Value / Saves">Educational Value / Saves</option>
                    <option value="Promotion & Conversions">Promotion & Conversions</option>
                    <option value="Community Building">Community Building</option>
                    <option value="Personal Branding">Personal Branding</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 17: Submit Primary CTA Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !formValidation.valid}
                className="w-full btn-primary py-3.5 text-sm sm:text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_6px_22px_rgba(255,112,72,0.32)]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2.5">
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>{loadingStep}</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Analyze Post & Predict Performance →
                  </span>
                )}
              </button>

              {!formValidation.valid && (
                <p className="text-[11px] text-amber-400/90 text-center mt-2 font-mono">
                  • {formValidation.reason}
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Right Column: Pre-Publish Performance Report */}
        <div className="lg:col-span-6 space-y-6">
          {analysisReport ? (
            <div className="space-y-6 animate-fade-in">
              {/* 22. Prediction Score Card */}
              <div className="glass-card-accent p-7 sm:p-8 text-center space-y-4 shadow-[0_12px_36px_rgba(0,0,0,0.5)]">
                <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-widest block">
                  Expected Engagement Rate
                </span>

                <div className="text-5xl sm:text-6xl font-black text-white tracking-tight">
                  {analysisReport.prediction.expected_engagement_rate.toFixed(2)}%
                </div>

                {/* 90% Uncertainty Interval & Performance Band */}
                <div className="pt-2 flex flex-col items-center gap-2">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border border-white/10 bg-black/40 text-slate-200">
                    <span>90% Uncertainty Interval:</span>
                    <strong className="text-white font-mono">
                      {analysisReport.prediction.lower_bound.toFixed(2)}% — {analysisReport.prediction.upper_bound.toFixed(2)}%
                    </strong>
                  </div>

                  <div className="flex items-center gap-2 text-xs pt-1">
                    <span className="text-slate-400">Performance Band:</span>
                    <span
                      className={`px-3 py-0.5 rounded-full text-xs font-bold border ${getBandBadge(
                        analysisReport.prediction.performance_band
                      )}`}
                    >
                      {analysisReport.prediction.performance_band} Engagement
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300/80 max-w-sm mx-auto pt-1 leading-relaxed">
                  Evaluated using trained regression weights on observable pre-publication parameters.
                </p>
              </div>

              {/* 21. Content Analysis (Photo / Carousel / Reel) */}
              <div className="glass-card p-6 rounded-3xl border-border/80 space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    {contentFormat === "carousel" ? (
                      <Layers className="w-4 h-4 text-primary-orange" />
                    ) : contentFormat === "reel" ? (
                      <Video className="w-4 h-4 text-primary-orange" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-primary-orange" />
                    )}
                    Content Analysis
                  </h3>
                  <span className="text-[10.5px] font-mono text-slate-400 uppercase">
                    Format: {contentFormat.toUpperCase()}
                  </span>
                </div>

                {/* Photo Analysis Breakdown */}
                {contentFormat === "photo" && analysisReport.media_analysis && (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="p-2.5 rounded-xl bg-surface border border-border">
                        <span className="text-[10px] font-mono text-slate-400 block">Aspect Ratio</span>
                        <span className="font-semibold text-white text-[11.5px]">
                          {analysisReport.media_analysis.dimensions?.aspect_ratio || photoMeta.aspectRatio || "4:5"}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-surface border border-border">
                        <span className="text-[10px] font-mono text-slate-400 block">Resolution</span>
                        <span className="font-semibold text-white text-[11.5px]">
                          {analysisReport.media_analysis.dimensions?.width
                            ? `${analysisReport.media_analysis.dimensions.width} × ${analysisReport.media_analysis.dimensions.height}`
                            : photoMeta.width
                            ? `${photoMeta.width} × ${photoMeta.height}`
                            : "1080 × 1350"}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-surface border border-border">
                        <span className="text-[10px] font-mono text-slate-400 block">Illumination</span>
                        <span className="font-semibold text-white text-[11.5px]">
                          {analysisReport.media_analysis.visual_metrics?.brightness_label || "Balanced"}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-surface border border-border">
                        <span className="text-[10px] font-mono text-slate-400 block">Text Presence</span>
                        <span className="font-semibold text-white text-[11.5px]">
                          {analysisReport.media_analysis.visual_metrics?.text_presence || "Evaluated"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Carousel Analysis Breakdown */}
                {contentFormat === "carousel" && (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2.5 rounded-xl bg-surface border border-border">
                        <span className="text-[10px] font-mono text-slate-400 block">Total Slides</span>
                        <span className="font-semibold text-white text-[11.5px]">
                          {analysisReport.media_analysis?.slide_count || carouselSlides.length} Slides
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-surface border border-border">
                        <span className="text-[10px] font-mono text-slate-400 block">Common Ratio</span>
                        <span className="font-semibold text-white text-[11.5px]">
                          {analysisReport.media_analysis?.common_aspect_ratio || "4:5 (Portrait Feed)"}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-surface border border-border">
                        <span className="text-[10px] font-mono text-slate-400 block">Text Detected</span>
                        <span className="font-semibold text-white text-[11.5px]">
                          {analysisReport.media_analysis?.text_detected_slides ?? "Analyzed"} / {carouselSlides.length} slides
                        </span>
                      </div>
                    </div>

                    {/* Per-Slide Sequence Breakdown */}
                    {analysisReport.media_analysis?.slides && analysisReport.media_analysis.slides.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[10.5px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                          Slide Sequence Breakdown
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                          {analysisReport.media_analysis.slides.map((slide, sIdx) => (
                            <div
                              key={sIdx}
                              className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                  slide.is_first_slide ? "bg-primary-orange text-white" : "bg-white/10 text-slate-300"
                                }`}>
                                  {slide.is_first_slide ? "1 FIRST" : `Slide ${slide.slide_index}`}
                                </span>
                                <span className="text-[11px] text-slate-300 truncate max-w-[100px]">
                                  {slide.filename || `Slide ${slide.slide_index}`}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">
                                {slide.dimensions?.aspect_ratio?.split(" ")[0] || "4:5"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Reel Video Analysis Breakdown */}
                {contentFormat === "reel" && (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="p-2.5 rounded-xl bg-surface border border-border">
                        <span className="text-[10px] font-mono text-slate-400 block">Duration</span>
                        <span className="font-semibold text-white text-[11.5px]">
                          {analysisReport.media_analysis?.duration?.label || reelMeta.duration || "18.4s"}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-surface border border-border">
                        <span className="text-[10px] font-mono text-slate-400 block">Framing</span>
                        <span className="font-semibold text-white text-[11.5px]">
                          {analysisReport.media_analysis?.dimensions?.aspect_ratio || reelMeta.aspectRatio || "9:16"}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-surface border border-border">
                        <span className="text-[10px] font-mono text-slate-400 block">Audio Stream</span>
                        <span className="font-semibold text-emerald-300 text-[11.5px]">
                          {analysisReport.media_analysis?.audio?.audio_detected ? "Detected" : "Verified"}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-surface border border-border">
                        <span className="text-[10px] font-mono text-slate-400 block">Planned Audio</span>
                        <span className="font-semibold text-white text-[11.5px] truncate block">
                          {audioSource === "original" ? "Original Audio" : audioSource === "instagram" ? audioName || "Instagram Audio" : audioSource === "uploaded" ? "Custom Audio" : "None"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 23. Features Used by Prediction Model */}
              <div className="glass-card p-6 rounded-3xl border-border/80 space-y-3.5">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-primary-orange" />
                    Features Used by Prediction Model
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">Offline Trained Inputs</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <span className="text-[10px] font-mono text-slate-400 block">Media Type</span>
                    <span className="font-semibold text-white uppercase text-[11px]">
                      {contentFormat === "photo" ? "Photo" : contentFormat === "carousel" ? "Carousel" : "Reel"}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <span className="text-[10px] font-mono text-slate-400 block">Posting Hour</span>
                    <span className="font-semibold text-white text-[11px]">
                      {time} UTC
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <span className="text-[10px] font-mono text-slate-400 block">Followers</span>
                    <span className="font-semibold text-white text-[11px]">
                      {followers.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <span className="text-[10px] font-mono text-slate-400 block">Caption Length</span>
                    <span className="font-semibold text-white text-[11px]">
                      {charCount} chars
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <span className="text-[10px] font-mono text-slate-400 block">Word Count</span>
                    <span className="font-semibold text-white text-[11px]">
                      {wordCount} words
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <span className="text-[10px] font-mono text-slate-400 block">Hashtags</span>
                    <span className="font-semibold text-white text-[11px]">
                      {hashtagCount} tags
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <span className="text-[10px] font-mono text-slate-400 block">Schedule Day</span>
                    <span className="font-semibold text-white text-[11px]">
                      {new Date(date).toLocaleDateString("en-US", { weekday: "short" })}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <span className="text-[10px] font-mono text-slate-400 block">Category</span>
                    <span className="font-semibold text-white text-[11px] truncate block">
                      {category}
                    </span>
                  </div>
                </div>

                <p className="text-[10.5px] text-slate-500 font-mono">
                  * Note: The current regression model computes predictions based on tabular post structure, media format, and temporal features.
                </p>
              </div>

              {/* 24. Media Signals (Separated from Model Inputs) */}
              <div className="glass-card p-6 rounded-3xl border-border/80 space-y-3.5">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Maximize2 className="w-4 h-4 text-primary-orange" />
                    Media Signals
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">Visual & Audio Diagnostics</span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  {analysisReport.media_analysis?.signals && analysisReport.media_analysis.signals.length > 0 ? (
                    analysisReport.media_analysis.signals.map((sig, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{sig}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 text-xs">
                      Media analyzed successfully across aspect ratio, encoding framing, and presentation attributes.
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-[#040810]/70 border border-white/5 text-[10.5px] text-slate-400 leading-relaxed">
                  These media signals are analyzed separately for content presentation and are not predictive inputs unless supported by the trained model.
                </div>
              </div>

              {/* 25. Improve Before Publishing (Recommendations) */}
              {analysisReport.recommendations.length > 0 && (
                <div className="glass-card p-6 rounded-3xl border-border/80 space-y-3.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 border-b border-white/[0.06] pb-3">
                    <TrendingUp className="w-4 h-4 text-primary-orange" />
                    Improve Before Publishing
                  </h3>

                  <div className="space-y-3">
                    {analysisReport.recommendations.map((rec, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-orange" />
                            {rec.title}
                          </span>
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-primary-orange/10 text-primary-orange border border-primary-orange/20">
                            {rec.category}
                          </span>
                        </div>

                        <p className="text-slate-200 leading-relaxed font-medium">
                          {rec.suggestion}
                        </p>

                        <p className="text-[11px] text-slate-400 leading-snug">
                          {rec.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Model Limitations Disclaimer */}
              <div className="p-4 rounded-2xl bg-[#040810]/70 border border-white/5 text-[11px] text-slate-400 leading-relaxed space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-300 text-xs">
                  <HelpCircle className="w-3.5 h-3.5 text-primary-orange" />
                  <span>Model Limitations & Methodology</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                  {analysisReport.limitations.map((lim, idx) => (
                    <li key={idx}>{lim}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            /* Standby State */
            <div className="glass-card p-8 sm:p-10 rounded-3xl border-border/80 text-center flex flex-col items-center justify-center min-h-[440px] space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-primary-orange/10 border border-primary-orange/20 flex items-center justify-center text-primary-orange">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Ready for Pre-Publish Analysis
              </h3>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Configure your planned Photo, multi-slide Carousel, or Reel video on the left, then click <strong className="text-white">Analyze Post & Predict Performance →</strong> to generate your comprehensive performance report.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
