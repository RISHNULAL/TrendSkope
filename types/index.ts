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
    master_records?: number;
    training_records?: number;
    test_records?: number;
    metrics: ModelMetrics | null;
    validation_mae?: number | null;
    coefficients: FeatureCoefficient[];
    comparison?: ModelComparisonRow[];
  };
  dataset: {
    posts: number;
    unique_post_ids?: number;
    accounts: number;
    date_start: string;
    date_end: string;
    date_coverage?: string;
    media_types: Record<string, number>;
    missing_values: number;
    duplicate_rows?: number;
    duplicate_post_ids?: number;
    records_added?: number;
    last_update?: string;
    rows?: number;
    columns?: number;
    invalid_records?: number;
    required_fields_status?: string;
    quality_status?: string;
    health: string;
    provenance: string;
    provenance_status?: string;
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
    training_records?: number;
    validation_records?: number;
    test_records?: number;
  };
  media_dataset?: MediaDatasetSummary;
}

export interface MediaDatasetSummary {
  available: boolean;
  master_posts: number;
  total_media_assets: number;
  image_assets: number;
  video_assets: number;
  carousel_posts: number;
  carousel_slides: number;
  audio_assets: number;
  analyzed_successfully: number;
  pending: number;
  failed: number;
  missing_references: number;
  license_provenance: string;
  themes_count?: number;
  modality_coverage?: {
    posts_with_media?: number;
    posts_tabular_only?: number;
    text_captions?: number;
    physical_media_assets?: number;
  };
  multimodal_model_ready?: boolean;
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

export interface MultimodalComparisonRow {
  model_type: string;
  selected_model: string;
  features_count: number;
  test_mae: number;
  test_rmse: number;
  test_r2: number;
}

export interface MultimodalMetricsReport {
  model_name: string;
  trained_records: number;
  splits: { train: number; validation: number; test: number };
  features_used: number;
  modality_counts?: Record<string, number>;
  baseline_test_metrics: ModelMetrics;
  multimodal_test_metrics: ModelMetrics;
  delta_mae: number;
  scientific_integrity_note: string;
  top_coefficients?: {
    feature: string;
    coefficient: number;
    abs_coefficient: number;
    modality: string;
  }[];
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
  multimodal?: MultimodalMetricsReport | null;
  multimodal_comparison?: MultimodalComparisonRow[];
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
export interface DominantColorSwatch {
  hex: string;
  rgb: number[];
  percentage: number;
}

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
  sharpness_var?: number;
  sharpness_label?: string;
  overall_quality_score?: number;
  composition_balance?: string;
  dominant_colors?: DominantColorSwatch[];
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
    fps?: number;
    label: string;
  };
  visual_metrics?: VisualMetrics;
  motion?: {
    score: number;
    label: string;
  };
  scene_structure?: {
    count: number;
    label: string;
  };
  hook_analysis?: {
    window_sec: number;
    hook_contrast: number;
    hook_sharpness: number;
    hook_brightness: number;
    clarity_label: string;
  };
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
  estimated_bpm?: number;
  loudness_dbfs?: number;
  tempo_label?: string;
  energy_profile?: string;
  duration_alignment?: {
    status: string;
    detail: string;
  };
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

// Professional Content Audit & Improvement Studio Types
export interface AuditStudioCategoryScore {
  name: string;
  score: number;
  weight: number;
  applicable: boolean;
}

export interface AuditStudioOverallQuality {
  score: number;
  max_score: number;
  band: string;
  badge_color: "emerald" | "blue" | "gold" | "orange" | "rose";
  verdict: string;
  total_categories_evaluated: number;
  contributing_categories: AuditStudioCategoryScore[];
}

export type OverallQualityScore = AuditStudioOverallQuality;

export interface ImageAuditCategory {
  category: string;
  score: number;
  status: "Excellent" | "Good" | "Fair" | "Needs improvement";
  explanation: string;
  evidence: string;
  recommendation: string;
  is_heuristic: boolean;
}

export interface ImageAuditData {
  evaluated: boolean;
  overall_score: number | null;
  categories: ImageAuditCategory[];
  media_type: string;
  filename?: string | null;
}

export interface CaptionAuditCategory {
  category: string;
  score: number;
  status: "Excellent" | "Good" | "Fair" | "Needs improvement";
  explanation: string;
  evidence: string;
  recommendation: string;
}

export interface CaptionAuditData {
  evaluated: boolean;
  overall_score: number | null;
  categories: CaptionAuditCategory[];
  metrics: CaptionMetrics;
  hashtag_analysis: {
    count: number;
    density_label: string;
    detected: string[];
    recommendation: string;
  };
}

export interface CaptionAlternativeOption {
  id: string;
  title: string;
  subtitle: string;
  text: string;
  char_count: number;
  word_count: number;
  hashtag_count: number;
  key_changes: string[];
  recommended_for: string;
}

export interface CaptionStudioData {
  evaluated: boolean;
  original_caption: string;
  alternatives: CaptionAlternativeOption[];
  preserved_entities: string;
}

export interface DrawbackItem {
  id: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  title: string;
  evidence: string;
  explanation: string;
  recommended_fix: string;
  expected_benefit: string;
  confidence: string;
  tag: string;
}

export interface ImprovementChecklistItem {
  id: string;
  filter_tag: "visual" | "caption" | "accessibility" | "technical";
  priority: "Critical" | "High" | "Medium" | "Low";
  title: string;
  current_issue: string;
  proposed_change: string;
  reason: string;
  expected_benefit: string;
  action_label: string;
}

export interface VisualSpecificationData {
  has_media: boolean;
  media_type: string;
  original_aspect: string;
  recommended_aspect: string;
  framing_advice: string;
  color_palette: string[];
  contrast_advice: string;
  safe_zone_notes: string;
}

export interface BeforeAfterComparisonData {
  visual_specification: VisualSpecificationData;
  caption_alternatives: CaptionAlternativeOption[];
  original_caption: string;
}

export interface PublishingChecklistItem {
  id: string;
  item: string;
  description: string;
  status: "passed" | "needs_review" | "failed" | "not_evaluated";
  evidence: string;
  recommendation: string;
}

export interface PublishingChecklistSummary {
  passed: number;
  needs_review: number;
  failed: number;
  not_evaluated: number;
  total: number;
  readiness_percentage: number;
  is_ready_to_publish: boolean;
}

export interface PublishingChecklistData {
  summary: PublishingChecklistSummary;
  items: PublishingChecklistItem[];
}

export interface SegregatedEngagementPredictionData {
  available: boolean;
  predicted_rate: number;
  lower_bound: number;
  upper_bound: number;
  performance_band: string;
  model_name: string;
  target_definition: string;
  historical_baseline: {
    median_benchmark: number;
    category: string;
    category_average: number;
  };
  methodology_notice: string;
  limitations: string[];
}

export interface AuditStudioData {
  overall_quality: AuditStudioOverallQuality;
  image_audit: ImageAuditData;
  caption_audit: CaptionAuditData;
  caption_studio: CaptionStudioData;
  drawbacks: DrawbackItem[];
  improvement_checklist: ImprovementChecklistItem[];
  before_after_comparison: BeforeAfterComparisonData;
  publishing_checklist: PublishingChecklistData;
  segregated_engagement_prediction: SegregatedEngagementPredictionData;
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
    is_multimodal?: boolean;
    modalities_used?: {
      text: boolean;
      metadata_scheduling: boolean;
      media_visual: boolean;
      audio: boolean;
    };
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
  audit_studio?: AuditStudioData;
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

export interface ScenarioTemplateItem {
  id: string;
  name: string;
  tagline: string;
  category: string;
  description: string;
  scenario_a: {
    name: string;
    caption: string;
    media_type: "image" | "carousel" | "reel";
    followers: number;
    date: string;
    time: string;
    category: string;
    goal: string;
    audio_name?: string;
    audio_type?: string;
  };
  scenario_b: {
    name: string;
    caption: string;
    media_type: "image" | "carousel" | "reel";
    followers: number;
    date: string;
    time: string;
    category: string;
    goal: string;
    audio_name?: string;
    audio_type?: string;
  };
}

export interface QualityPillarComparison {
  pillar: string;
  key: string;
  score_a: number | null;
  score_b: number | null;
  delta: number | null;
  applicable: boolean;
  observation: string;
  recommendation: string;
}

export interface SmartRecommendationItem {
  id: string;
  title: string;
  observation: string;
  rationale: string;
  proposed_action: string;
  evidence_type: "rule-based" | "model-informed" | "historical-best-practice";
  confidence: "High" | "Medium";
  action_type: "apply_to_b" | "copy_caption" | "isolate_variable";
  action_payload: Record<string, any>;
}

export interface ExperimentProtocol {
  experiment_name: string;
  test_variable: string;
  control_variables: string[];
  hypothesis: string;
  guidance: string;
  measurement_window: string;
}

export interface ScenarioComparisonResult {
  prediction_a: PredictionResultData;
  prediction_b: PredictionResultData;
  delta_pp: number;
  delta_direction: "higher" | "lower" | "neutral";
  delta_relative_pct?: number | null;
  intervals_overlap: boolean;
  is_inconclusive?: boolean;
  inconclusive_reason?: string | null;
  is_confounded?: boolean;
  confounding_warning?: string | null;
  overlap_explanation: string;
  caption_a: CaptionAnalysisData;
  caption_b: CaptionAnalysisData;
  audio_a: AudioAnalysisData;
  audio_b: AudioAnalysisData;
  changed_parameters: ChangedParameter[];
  unchanged_parameters: UnchangedParameter[];
  changed_model_inputs?: string[];
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
  quality_a?: OverallQualityScore;
  quality_b?: OverallQualityScore;
  quality_delta?: number;
  content_quality_comparison?: {
    pillars: QualityPillarComparison[];
    strengths_a?: DrawbackItem[];
    strengths_b?: DrawbackItem[];
  };
  smart_recommendations?: SmartRecommendationItem[];
  experiment_protocol?: ExperimentProtocol;
  scenario_templates?: ScenarioTemplateItem[];
  model_metadata?: {
    model_name: string;
    target: string;
    uncertainty_level: string;
    dataset_baseline: string;
  };
}

export interface CompareScenariosResponse {
  success: boolean;
  comparison: ScenarioComparisonResult;
  scenario_a?: any;
  scenario_b?: any;
  comparison_metrics?: {
    pred_a: number;
    pred_b: number;
    delta_absolute: number;
    delta_relative_pct: number | null;
    delta_direction: "higher" | "lower" | "neutral";
    quality_score_a: number;
    quality_score_b: number;
    quality_delta: number;
    intervals_overlap: boolean;
    is_inconclusive: boolean;
    inconclusive_reason: string | null;
    is_confounded: boolean;
    confounding_warning: string | null;
  };
  what_changed?: {
    changed_parameters: ChangedParameter[];
    unchanged_parameters: UnchangedParameter[];
    changed_model_inputs: string[];
    count_changed: number;
    count_unchanged: number;
  };
  content_quality_comparison?: {
    pillars: QualityPillarComparison[];
    strengths_a?: DrawbackItem[];
    strengths_b?: DrawbackItem[];
  };
  smart_recommendations?: SmartRecommendationItem[];
  experiment_protocol?: ExperimentProtocol;
  scenario_templates?: ScenarioTemplateItem[];
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

export interface ContentAuditDatasetItem {
  filename: string;
  title: string;
  category: string;
  description: string;
  target_use: string;
  physical_media_coverage: string;
  records: number;
  columns: number;
  file_size_kb: number;
  validation_status: string;
  source_type_breakdown?: Record<string, number>;
}

export interface ContentAuditDatasetsResponse {
  success: boolean;
  master_dataset?: {
    filename: string;
    path: string;
    records: number;
    accounts: number;
    status: string;
    sha256: string;
  };
  audit_datasets_count: number;
  total_audit_records: number;
  datasets: ContentAuditDatasetItem[];
  data_dictionary_path?: string;
}


