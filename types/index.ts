export interface ModelMetrics {
  mae: number;
  rmse: number;
  r2: number;
  median_absolute_error: number;
}

export interface FeatureCoefficient {
  feature: string;
  coefficient: number;
  direction: string;
  abs_coefficient: number;
}

export interface ModelStatusResponse {
  trained: boolean;
  status?: string;
  reason?: string;
  selected_model: string | null;
  metrics: ModelMetrics | null;
  dataset_size: number | null;
  features_used: number | null;
  splits: {
    train: number;
    validation: number;
    test: number;
  } | null;
  feature_coefficients?: FeatureCoefficient[];
}

export interface DashboardSummaryResponse {
  success: boolean;
  system_status?: string;
  model: {
    status: "ready" | "not_ready";
    status_label: string;
    system_status?: string;
    name: string;
    active_model?: string;
    target: string;
    target_formula?: string;
    dataset_size: number;
    features: number;
    last_training: string;
    training_status?: string;
    validation_methodology: string;
    selection_metric?: string;
    splits: {
      train: number;
      validation: number;
      test: number;
    } | null;
    metrics: ModelMetrics | null;
    validation_mae?: number | null;
    coefficients: FeatureCoefficient[];
    comparison?: ModelComparisonRow[];
  };
  dataset: {
    posts: number;
    accounts: number;
    date_start: string;
    date_end: string;
    date_coverage?: string;
    media_types: Record<string, number>;
    missing_values: number;
    duplicate_rows?: number;
    rows?: number;
    columns?: number;
    invalid_records?: number;
    required_fields_status?: string;
    quality_status?: string;
    health: string;
    provenance: string;
    posts_over_time?: { period: string; count: number }[];
    engagement_quartiles?: {
      q25?: number;
      median?: number;
      q75?: number;
      mean?: number;
      min?: number;
      max?: number;
    };
    account_stats?: {
      avg_posts: number;
      min_posts: number;
      max_posts: number;
    };
    provenance_history?: DatasetProvenanceRecord[];
  };
}

export interface PostPredictionInput {
  caption: string;
  media_type: "image" | "carousel" | "reel";
  followers_at_or_near_collection: number;
  published_at?: string;
  date?: string;
  time?: string;
  category?: string;
  goal?: string;
  audio_name?: string;
  audio_type?: string;
}

export interface PredictionResultData {
  prediction: number;
  lower: number;
  upper: number;
  band: "Low" | "Medium" | "High";
  features: Record<string, number | string>;
}

export interface PredictionResponse {
  success: boolean;
  result: PredictionResultData;
  input: Record<string, any>;
}

export interface ModelComparisonRow {
  model: string;
  mae: number;
  rmse: number;
  r2: number;
  median_absolute_error: number;
}

export interface InsightsResponse {
  available: boolean;
  message?: string;
  metrics: {
    test: ModelMetrics;
    dataset_size: number;
    features_used: number;
    selected_model: string;
    splits: {
      train: number;
      validation: number;
      test: number;
    };
    feature_coefficients?: FeatureCoefficient[];
  } | null;
  comparison: ModelComparisonRow[];
}

export interface DatasetProvenanceRecord {
  timestamp: string;
  filename: string;
  rows_uploaded: number;
  rows_accepted: number;
  rows_rejected: number;
  duplicates_skipped: number;
  rows_added: number;
  previous_size: number;
  resulting_size: number;
  selected_model: string;
  previous_mae?: number | null;
  new_mae?: number | null;
  mae_delta?: number | null;
  previous_r2?: number | null;
  new_r2?: number | null;
  r2_delta?: number | null;
  evaluation_note?: string;
  provenance_type?: string;
}

export interface CsvValidationResponse {
  valid: boolean;
  errors: string[];
  post_count: number;
  total_uploaded?: number;
  valid_count?: number;
  invalid_count?: number;
  duplicate_count?: number;
  new_count?: number;
  invalid_details?: string[];
  duplicate_ids?: string[];
  current_master_size?: number;
  projected_master_size?: number;
  preview: Record<string, any>[];
  status_message?: string;
}

export interface RetrainResponse {
  success: boolean;
  status: string;
  message: string;
  rows_added?: number;
  duplicates_skipped?: number;
  previous_size?: number;
  resulting_size?: number;
  selected_model?: string;
  validation_mae?: number;
  test_metrics?: ModelMetrics;
  previous_mae?: number | null;
  new_mae?: number | null;
  mae_delta?: number | null;
  previous_r2?: number | null;
  new_r2?: number | null;
  r2_delta?: number | null;
  evaluation_note?: string;
  provenance?: DatasetProvenanceRecord;
}

// Multimodal Content Analysis Types
export interface VisualMetrics {
  brightness_pct: number;
  brightness_label: string;
  contrast_label: string;
  rms_contrast: number;
  saturation_pct: number;
  saturation_label: string;
  color_tone: string;
  visual_complexity: string;
  text_presence: string;
}

export interface MediaDimensions {
  width: number;
  height: number;
  aspect_ratio: string;
  resolution_label?: string;
  numeric_ratio?: number;
}

export interface CarouselSlideAnalysis {
  slide_index: number;
  is_first_slide: boolean;
  available: boolean;
  filename?: string;
  file_size_kb?: number;
  format?: string;
  dimensions?: MediaDimensions;
  visual_metrics?: VisualMetrics;
  signals?: string[];
}

export interface MediaAnalysisData {
  available: boolean;
  message?: string;
  error?: string;
  media_category?: "image" | "reel" | "carousel";
  filename?: string;
  file_size_kb?: number;
  file_size_mb?: number;
  format?: string;
  dimensions?: MediaDimensions;
  duration?: {
    seconds: number;
    label: string;
  };
  visual_metrics?: VisualMetrics;
  audio?: {
    audio_detected: boolean;
    status: string;
  };
  signals?: string[];
  slide_count?: number;
  common_aspect_ratio?: string;
  text_detected_slides?: number;
  slides?: CarouselSlideAnalysis[];
}

export interface CaptionMetrics {
  characters: number;
  words: number;
  hashtags: number;
  mentions: number;
  emojis: number;
  urls: number;
  questions: number;
  exclamations: number;
  uppercase_ratio: number;
  avg_word_length: number;
  sentences: number;
}

export interface CaptionAnalysisData {
  available: boolean;
  raw_text: string;
  metrics: CaptionMetrics;
  structure: {
    length_label: string;
    hashtag_density: string;
    has_cta: boolean;
    detected_ctas: string[];
    has_question: boolean;
  };
  signals: string[];
}

export interface AudioAnalysisData {
  available: boolean;
  audio_present: boolean;
  audio_type: string;
  audio_name: string;
  audio_id: string;
  trend_status: {
    status: string;
    explanation: string;
  };
  signals: string[];
}

export interface ReadinessGroup {
  name: string;
  status: string;
  detail: string;
  complete: boolean;
}

export interface ContentReadinessData {
  completeness_ratio: string;
  signals_analyzed: number;
  total_signals: number;
  status_label: string;
  groups: ReadinessGroup[];
}

export interface AnalysisSignalsData {
  supportive: string[];
  considerations: string[];
}

export interface RecommendationItem {
  category: string;
  title: string;
  suggestion: string;
  reason: string;
  impact_level: "High" | "Medium" | "Low";
}

export interface WhatIfScenarioPreview {
  name: string;
  modification: string;
  expected_engagement_rate: number;
  diff_pp: number;
  band: "Low" | "Medium" | "High";
}

export interface AnalyzeContentResponse {
  success: boolean;
  prediction: {
    available: boolean;
    expected_engagement_rate: number;
    lower_bound: number;
    upper_bound: number;
    performance_band: "Low" | "Medium" | "High" | "Not Available" | "Not Trained";
    features_extracted?: Record<string, any>;
    message?: string;
    error?: string;
  };
  readiness: ContentReadinessData;
  caption_analysis: CaptionAnalysisData;
  media_analysis: MediaAnalysisData;
  audio_analysis: AudioAnalysisData;
  signals: AnalysisSignalsData;
  recommendations: RecommendationItem[];
  what_if_scenarios: WhatIfScenarioPreview[];
  limitations: string[];
  input: Record<string, any>;
}

// Pre-Publish Scenario Studio Types
export interface ScenarioItemPayload {
  caption: string;
  media_type: "image" | "carousel" | "reel";
  followers: number;
  date?: string;
  time?: string;
  category?: string;
  goal?: string;
  audio_name?: string;
  audio_type?: string;
  audio_id?: string;
}

export interface CompareScenariosRequest {
  scenario_a: ScenarioItemPayload;
  scenario_b: ScenarioItemPayload;
  comparison_mode?: "single" | "multiple";
}

export interface ChangedParameter {
  field: string;
  label: string;
  value_a: string | number;
  value_b: string | number;
  impact_note?: string;
}

export interface UnchangedParameter {
  field: string;
  label: string;
  value: string | number;
}

export interface ScenarioComparisonResult {
  prediction_a: PredictionResultData;
  prediction_b: PredictionResultData;
  delta_pp: number;
  delta_direction: "higher" | "lower" | "neutral";
  intervals_overlap: boolean;
  overlap_explanation: string;
  caption_a: CaptionAnalysisData;
  caption_b: CaptionAnalysisData;
  audio_a: AudioAnalysisData;
  audio_b: AudioAnalysisData;
  changed_parameters: ChangedParameter[];
  unchanged_parameters: UnchangedParameter[];
  model_sensitivity: {
    delta_pp: number;
    changed_inputs: string[];
    explanation: string;
  };
  recommendations: string[];
  multimodal_readiness: {
    status: string;
    message: string;
    is_multimodal_active: boolean;
  };
}

export interface CompareScenariosResponse {
  success: boolean;
  comparison: ScenarioComparisonResult;
  input_a: ScenarioItemPayload;
  input_b: ScenarioItemPayload;
}

export interface StudioMediaItem {
  id: string;
  url: string;
  name: string;
  sizeKb: number;
  width?: number;
  height?: number;
  aspectRatio?: string;
  durationSec?: number;
  format?: string;
  visualMetrics?: VisualMetrics;
  audioDetected?: boolean;
}

