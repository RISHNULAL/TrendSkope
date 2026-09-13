export interface ModelMetrics {
  mae: number;
  rmse: number;
  r2: number;
  median_absolute_error: number;
}

export interface ModelStatusResponse {
  trained: boolean;
  selected_model: string | null;
  metrics: ModelMetrics | null;
  dataset_size: number | null;
  features_used: number | null;
  splits: {
    train: number;
    validation: number;
    test: number;
  } | null;
}

export interface PostPredictionInput {
  caption: string;
  media_type: "image" | "carousel" | "reel";
  followers_at_or_near_collection: number;
  published_at?: string;
  date?: string;
  time?: string;
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
  } | null;
  comparison: ModelComparisonRow[];
}

export interface CsvValidationResponse {
  valid: boolean;
  errors: string[];
  post_count: number;
  preview: Record<string, any>[];
}
