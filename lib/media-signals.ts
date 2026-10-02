import {
  CaptionAnalysisData,
  CaptionMetrics,
  ChangedParameter,
  StudioMediaItem,
  UnchangedParameter,
  VisualMetrics,
} from "@/types";

export function computeAspectRatioLabel(width: number, height: number): string {
  if (width <= 0 || height <= 0) return "Unknown";
  const ratio = width / height;

  if (Math.abs(ratio - 1.0) <= 0.06) return "1:1 (Square)";
  if (Math.abs(ratio - 4 / 5) <= 0.06) return "4:5 (Portrait Feed)";
  if (Math.abs(ratio - 9 / 16) <= 0.06) return "9:16 (Story / Reel)";
  if (Math.abs(ratio - 1.91 / 1) <= 0.1) return "1.91:1 (Landscape Feed)";
  if (Math.abs(ratio - 16 / 9) <= 0.08) return "16:9 (Widescreen)";
  if (ratio < 0.8) return `${ratio.toFixed(2)}:1 (Tall Vertical)`;
  if (ratio > 1.2) return `${ratio.toFixed(2)}:1 (Wide Landscape)`;
  return `${ratio.toFixed(2)}:1`;
}

/**
 * Client-side visual analysis of image using HTML5 Canvas & pixel data
 */
export async function analyzeImageFile(file: File): Promise<StudioMediaItem> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        const sizeKb = Math.round(file.size / 1024);
        const format = file.type.split("/")[1]?.toUpperCase() || "IMAGE";
        const aspectRatio = computeAspectRatioLabel(width, height);

        // Offscreen canvas for fast photometric statistics
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        
        // Downscale for instant calculation
        const sampleW = 200;
        const sampleH = Math.max(50, Math.round(200 * (height / Math.max(width, 1))));
        canvas.width = sampleW;
        canvas.height = sampleH;

        let visualMetrics: VisualMetrics = {
          brightness_pct: 50,
          brightness_label: "Balanced",
          contrast_label: "Moderate",
          rms_contrast: 40,
          saturation_pct: 45,
          saturation_label: "Balanced",
          color_tone: "Neutral Tone",
          visual_complexity: "Moderate",
          text_presence: "Low / Minimal",
        };

        if (ctx) {
          ctx.drawImage(img, 0, 0, sampleW, sampleH);
          const imageData = ctx.getImageData(0, 0, sampleW, sampleH);
          const data = imageData.data;
          const pixelCount = sampleW * sampleH;

          let totalLum = 0;
          let totalR = 0;
          let totalG = 0;
          let totalB = 0;
          let totalSat = 0;
          const lumValues = new Float32Array(pixelCount);

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            totalR += r;
            totalG += g;
            totalB += b;

            // Luminance ITU-R BT.601
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            lumValues[i / 4] = lum;
            totalLum += lum;

            // Fast saturation proxy max(r,g,b) - min(r,g,b) / max
            const maxVal = Math.max(r, g, b);
            const minVal = Math.min(r, g, b);
            const sat = maxVal === 0 ? 0 : ((maxVal - minVal) / maxVal) * 100;
            totalSat += sat;
          }

          const meanLum = totalLum / pixelCount;
          const brightnessPct = Math.round((meanLum / 255) * 100);

          // RMS Contrast (Std Dev of Luminance)
          let varianceSum = 0;
          for (let i = 0; i < pixelCount; i++) {
            varianceSum += Math.pow(lumValues[i] - meanLum, 2);
          }
          const rmsContrast = Math.round(Math.sqrt(varianceSum / pixelCount));

          const meanSat = Math.round(totalSat / pixelCount);

          // Labels
          let brightnessLabel = "Balanced";
          if (brightnessPct < 30) brightnessLabel = "Low / Moody";
          else if (brightnessPct > 70) brightnessLabel = "High / Bright";

          let contrastLabel = "Moderate";
          if (rmsContrast < 30) contrastLabel = "Low / Soft";
          else if (rmsContrast > 65) contrastLabel = "High / Punchy";

          let satLabel = "Balanced";
          if (meanSat < 20) satLabel = "Muted / Neutral";
          else if (meanSat > 60) satLabel = "Vibrant / Saturated";

          const meanR = totalR / pixelCount;
          const meanB = totalB / pixelCount;
          let toneLabel = "Neutral Tone";
          if (meanR > meanB + 15) toneLabel = "Warm Tone";
          else if (meanB > meanR + 15) toneLabel = "Cool Tone";

          let complexityLabel = "Moderate";
          if (rmsContrast < 30) complexityLabel = "Clean / Minimalist";
          else if (rmsContrast > 65) complexityLabel = "High / Detailed";

          const textPresence = rmsContrast > 50 && meanLum > 80 && meanLum < 220 ? "Likely Present" : "Low / Minimal";

          visualMetrics = {
            brightness_pct: brightnessPct,
            brightness_label: brightnessLabel,
            contrast_label: contrastLabel,
            rms_contrast: rmsContrast,
            saturation_pct: meanSat,
            saturation_label: satLabel,
            color_tone: toneLabel,
            visual_complexity: complexityLabel,
            text_presence: textPresence,
          };
        }

        resolve({
          id: Math.random().toString(36).substring(2, 9),
          url: objectUrl,
          name: file.name,
          sizeKb,
          width,
          height,
          aspectRatio,
          format,
          visualMetrics,
          audioDetected: false,
        });
      } catch (err) {
        resolve({
          id: Math.random().toString(36).substring(2, 9),
          url: objectUrl,
          name: file.name,
          sizeKb: Math.round(file.size / 1024),
          width: img.naturalWidth || 1080,
          height: img.naturalHeight || 1080,
          aspectRatio: "1:1 (Square)",
          format: "IMAGE",
        });
      }
    };

    img.onerror = () => {
      reject(new Error("Failed to load and decode image file."));
    };

    img.src = objectUrl;
  });
}

/**
 * Client-side video metadata extraction using HTML5 Video element
 */
export async function analyzeVideoFile(file: File): Promise<StudioMediaItem> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = objectUrl;
    video.muted = true;

    // Timeout safety
    const timer = setTimeout(() => {
      resolve({
        id: Math.random().toString(36).substring(2, 9),
        url: objectUrl,
        name: file.name,
        sizeKb: Math.round(file.size / 1024),
        width: 1080,
        height: 1920,
        aspectRatio: "9:16 (Story / Reel)",
        durationSec: 15,
        format: file.type.split("/")[1]?.toUpperCase() || "MP4",
        audioDetected: true,
      });
    }, 4000);

    video.onloadedmetadata = () => {
      clearTimeout(timer);
      const width = video.videoWidth || 1080;
      const height = video.videoHeight || 1920;
      const durationSec = Math.round((video.duration || 0) * 10) / 10;
      const sizeKb = Math.round(file.size / 1024);
      const aspectRatio = computeAspectRatioLabel(width, height);
      const format = file.type.split("/")[1]?.toUpperCase() || "MP4";

      // Detect audio track presence if available in browser
      let hasAudio = true;
      const anyVideo = video as any;
      if (typeof anyVideo.mozHasAudio !== "undefined") {
        hasAudio = Boolean(anyVideo.mozHasAudio);
      } else if (typeof anyVideo.webkitAudioDecodedByteCount !== "undefined") {
        hasAudio = anyVideo.webkitAudioDecodedByteCount > 0;
      }

      resolve({
        id: Math.random().toString(36).substring(2, 9),
        url: objectUrl,
        name: file.name,
        sizeKb,
        width,
        height,
        aspectRatio,
        durationSec: durationSec > 0 ? durationSec : 15,
        format,
        audioDetected: hasAudio,
      });
    };

    video.onerror = () => {
      clearTimeout(timer);
      reject(new Error("Failed to load and decode video metadata."));
    };
  });
}

/**
 * Real-time linguistic & syntactic analysis of caption text
 */
export function analyzeLiveCaption(caption: string): CaptionAnalysisData {
  const text = (caption || "").trim();
  const charCount = text.length;
  const words = text.match(/\b\w+\b/g) || [];
  const wordCount = words.length;

  const hashtags = text.match(/(?<!\w)#\w+/g) || [];
  const mentions = text.match(/(?<!\w)@\w+/g) || [];
  const urls = text.match(/https?:\/\/\S+|www\.\S+/g) || [];
  const emojis = text.match(/[^\x00-\x7F]/g) || [];
  const questions = text.match(/\?/g) || [];
  const exclamations = text.match(/!/g) || [];
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const sentenceCount = sentences.length || 1;

  const alphas = text.replace(/[^a-zA-Z]/g, "");
  const uppers = text.replace(/[^A-Z]/g, "");
  const uppercaseRatio = alphas.length > 0 ? Math.round((uppers.length / alphas.length) * 100) / 100 : 0;

  const avgWordLen =
    words.length > 0
      ? Math.round((words.reduce((sum, w) => sum + w.length, 0) / words.length) * 10) / 10
      : 0;

  // Hashtag density label
  let htLabel = "No Hashtags";
  if (hashtags.length === 0) htLabel = "No Hashtags";
  else if (hashtags.length <= 4) htLabel = "Focused (1–4)";
  else if (hashtags.length <= 10) htLabel = "Moderate (5–10)";
  else htLabel = "Dense (11+)";

  // Length category
  let lengthLabel = "Empty";
  if (wordCount === 0) lengthLabel = "Empty";
  else if (wordCount <= 25) lengthLabel = "Short & Punchy (<25 words)";
  else if (wordCount <= 80) lengthLabel = "Medium Length (25–80 words)";
  else if (wordCount <= 180) lengthLabel = "Detailed Storytelling (80–180 words)";
  else lengthLabel = "Long-form (>180 words)";

  // Call to action regex patterns
  const ctaPatterns = [
    /\b(comment|drop a comment|let us know|tell us|thoughts|what do you think)\b/i,
    /\b(save this|bookmark|save for later)\b/i,
    /\b(share with|send to|tag a friend|tag someone)\b/i,
    /\b(link in bio|link in description|tap the link|check out)\b/i,
    /\b(follow for more|follow us|subscribe)\b/i,
  ];

  const detectedCtas: string[] = [];
  for (const pat of ctaPatterns) {
    const m = text.match(pat);
    if (m) detectedCtas.push(m[0]);
  }

  const hasCta = detectedCtas.length > 0;
  const hasQuestion = questions.length > 0;

  const metrics: CaptionMetrics = {
    characters: charCount,
    words: wordCount,
    hashtags: hashtags.length,
    mentions: mentions.length,
    emojis: emojis.length,
    urls: urls.length,
    questions: questions.length,
    exclamations: exclamations.length,
    uppercase_ratio: uppercaseRatio,
    avg_word_length: avgWordLen,
    sentences: sentenceCount,
  };

  const signals: string[] = [];
  if (lengthLabel !== "Empty") {
    signals.push(`${lengthLabel} caption (${charCount} chars, ${wordCount} words)`);
  }
  signals.push(`Hashtags: ${htLabel} (${hashtags.length} tags)`);
  if (emojis.length > 0) {
    signals.push(`${emojis.length} emoji${emojis.length > 1 ? "s" : ""}`);
  }
  if (hasQuestion) {
    signals.push(`${questions.length} question prompt${questions.length > 1 ? "s" : ""}`);
  }
  if (hasCta) {
    signals.push(`${detectedCtas.length} CTA detected`);
  }

  return {
    available: true,
    raw_text: text,
    metrics,
    structure: {
      length_label: lengthLabel,
      hashtag_density: htLabel,
      has_cta: hasCta,
      detected_ctas: detectedCtas,
      has_question: hasQuestion,
    },
    signals,
  };
}

export interface ScenarioComparisonDiff {
  changed: ChangedParameter[];
  unchanged: UnchangedParameter[];
  changedCount: number;
}

/**
 * Compare two planned scenarios and detect exact differences
 */
export function detectScenarioDifferences(
  planA: {
    caption: string;
    mediaType: string;
    followers: number;
    date: string;
    time: string;
    category?: string;
    goal?: string;
    audioName?: string;
    audioType?: string;
    media?: StudioMediaItem | null;
  },
  planB: {
    caption: string;
    mediaType: string;
    followers: number;
    date: string;
    time: string;
    category?: string;
    goal?: string;
    audioName?: string;
    audioType?: string;
    media?: StudioMediaItem | null;
  }
): ScenarioComparisonDiff {
  const changed: ChangedParameter[] = [];
  const unchanged: UnchangedParameter[] = [];

  // 1. Media Type
  if (planA.mediaType !== planB.mediaType) {
    changed.push({
      field: "media_type",
      label: "Media Type",
      value_a: planA.mediaType.toUpperCase(),
      value_b: planB.mediaType.toUpperCase(),
      impact_note: "Model evaluates learned historical response by media format.",
    });
  } else {
    unchanged.push({
      field: "media_type",
      label: "Media Type",
      value: planA.mediaType.toUpperCase(),
    });
  }

  // 2. Media Content / File
  const mediaNameA = planA.media?.name || "(Default placeholder)";
  const mediaNameB = planB.media?.name || "(Default placeholder)";
  if (planA.media?.id !== planB.media?.id && (planA.media || planB.media)) {
    changed.push({
      field: "content",
      label: "Planned Media",
      value_a: mediaNameA,
      value_b: mediaNameB,
      impact_note: "Visual and frame characteristics analyzed for pre-publication validation.",
    });
  } else if (planA.media && planB.media) {
    unchanged.push({
      field: "content",
      label: "Planned Media",
      value: mediaNameA,
    });
  }

  // 3. Caption
  if (planA.caption.trim() !== planB.caption.trim()) {
    changed.push({
      field: "caption",
      label: "Caption",
      value_a: `${planA.caption.length} chars (${(planA.caption.match(/\b\w+\b/g) || []).length} words)`,
      value_b: `${planB.caption.length} chars (${(planB.caption.match(/\b\w+\b/g) || []).length} words)`,
      impact_note: "Length, hashtag counts, and linguistic features affect model prediction.",
    });
  } else {
    unchanged.push({
      field: "caption",
      label: "Caption Content",
      value: `${planA.caption.length} chars`,
    });
  }

  // 4. Followers
  if (planA.followers !== planB.followers) {
    changed.push({
      field: "followers",
      label: "Followers",
      value_a: planA.followers.toLocaleString(),
      value_b: planB.followers.toLocaleString(),
      impact_note: "Audience scale normalizes calculated expected engagement.",
    });
  } else {
    unchanged.push({
      field: "followers",
      label: "Followers",
      value: planA.followers.toLocaleString(),
    });
  }

  // 5. Date
  if (planA.date !== planB.date) {
    changed.push({
      field: "date",
      label: "Publication Date",
      value_a: planA.date,
      value_b: planB.date,
      impact_note: "Day of week and weekend patterns evaluated by model.",
    });
  } else {
    unchanged.push({
      field: "date",
      label: "Publication Date",
      value: planA.date,
    });
  }

  // 6. Time
  if (planA.time !== planB.time) {
    changed.push({
      field: "time",
      label: "Posting Time (UTC)",
      value_a: planA.time,
      value_b: planB.time,
      impact_note: "Posting hour sensitivity evaluated against historical trends.",
    });
  } else {
    unchanged.push({
      field: "time",
      label: "Posting Time (UTC)",
      value: planA.time,
    });
  }

  // 7. Audio (Only applicable when at least one scenario is a Reel)
  const isReelA = planA.mediaType === "reel";
  const isReelB = planB.mediaType === "reel";

  if (isReelA || isReelB) {
    const audioA = isReelA ? (planA.audioName || (planA.audioType === "none" ? "No Audio (Muted)" : planA.audioType === "uploaded" ? "Uploaded Audio" : planA.audioType === "custom" ? "Custom Audio Track" : "Original Audio")) : "Not applicable (Image/Carousel)";
    const audioB = isReelB ? (planB.audioName || (planB.audioType === "none" ? "No Audio (Muted)" : planB.audioType === "uploaded" ? "Uploaded Audio" : planB.audioType === "custom" ? "Custom Audio Track" : "Original Audio")) : "Not applicable (Image/Carousel)";

    if (audioA !== audioB) {
      changed.push({
        field: "audio",
        label: "Planned Audio",
        value_a: audioA,
        value_b: audioB,
        impact_note: "Audio metadata logged for Reel creative planning (not a trained predictive input).",
      });
    } else {
      unchanged.push({
        field: "audio",
        label: "Planned Audio",
        value: audioA,
      });
    }
  }


  // 8. Category & Goal
  if (planA.category && planB.category) {
    if (planA.category !== planB.category) {
      changed.push({
        field: "category",
        label: "Content Category",
        value_a: planA.category,
        value_b: planB.category,
      });
    } else {
      unchanged.push({
        field: "category",
        label: "Content Category",
        value: planA.category,
      });
    }
  }

  if (planA.goal && planB.goal) {
    if (planA.goal !== planB.goal) {
      changed.push({
        field: "goal",
        label: "Publishing Goal",
        value_a: planA.goal,
        value_b: planB.goal,
      });
    } else {
      unchanged.push({
        field: "goal",
        label: "Publishing Goal",
        value: planA.goal,
      });
    }
  }

  return {
    changed,
    unchanged,
    changedCount: changed.length,
  };
}
