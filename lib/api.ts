import {
  AnalyzeContentResponse,
  CsvValidationResponse,
  DashboardSummaryResponse,
  InsightsResponse,
  ModelStatusResponse,
  PostPredictionInput,
  PredictionResponse,
} from "@/types";

const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  }
  return "";
};

export async function fetchDashboardSummary(): Promise<DashboardSummaryResponse> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/dashboard`, {
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch dashboard summary (HTTP ${res.status})`);
    }
    return res.json();
  } catch (err: any) {
    // Fallback if API offline or during SSR
    return {
      success: false,
      model: {
        status: "not_ready",
        status_label: "NOT READY",
        name: "Bayesian Ridge Regression",
        active_model: "Bayesian Ridge Regression",
        target: "Engagement Rate",
        target_formula: "log1p(engagement_rate)",
        dataset_size: 1000,
        features: 25,
        last_training: "",
        training_status: "Awaiting Training",
        validation_methodology: "Chronological Split (70% Train, 15% Validation, 15% Test)",
        selection_metric: "Validation MAE",
        splits: { train: 700, validation: 150, test: 150 },
        metrics: null,
        validation_mae: null,
        coefficients: [],
        comparison: [],
      },
      dataset: {
        posts: 1000,
        accounts: 40,
        date_start: "2025-01-21",
        date_end: "2026-09-16",
        date_coverage: "2025-01-21 to 2026-09-16",
        media_types: { reel: 411, image: 353, carousel: 236 },
        missing_values: 0,
        duplicate_rows: 0,
        rows: 1000,
        columns: 10,
        invalid_records: 0,
        required_fields_status: "All 8 Core Fields Compliant",
        quality_status: "Healthy",
        health: "Healthy",
        provenance: "Synthetic Research Corpus (10 Creator Domains, 40 Accounts)",
        posts_over_time: [],
        engagement_quartiles: {},
        account_stats: { avg_posts: 25, min_posts: 20, max_posts: 32 },
      },
    };
  }
}

export async function fetchHealth(): Promise<{ status: string }> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/health`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return { status: "error" };
    }
    return res.json();
  } catch {
    return { status: "error" };
  }
}

export async function fetchModelStatus(): Promise<ModelStatusResponse> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/model-status`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return {
        trained: false,
        selected_model: null,
        metrics: null,
        dataset_size: null,
        features_used: null,
        splits: null,
      };
    }
    return res.json();
  } catch {
    return {
      trained: false,
      selected_model: null,
      metrics: null,
      dataset_size: null,
      features_used: null,
      splits: null,
    };
  }
}

export async function predictPost(input: PostPredictionInput): Promise<PredictionResponse> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({
        detail: "Prediction service is currently unavailable.",
      }));
      throw new Error(errorData.detail || `Prediction failed (HTTP ${res.status})`);
    }

    return res.json();
  } catch (err: any) {
    if (err.message && !err.message.includes("fetch") && !err.message.includes("ECONNREFUSED")) {
      throw err;
    }
    throw new Error("Prediction service is currently unavailable. Please verify the backend is running.");
  }
}

export async function analyzeContent(formData: FormData): Promise<AnalyzeContentResponse> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/analyze-content`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({
        detail: "Content analysis service is currently unavailable.",
      }));
      throw new Error(errorData.detail || `Analysis failed (HTTP ${res.status})`);
    }

    return res.json();
  } catch (err: any) {
    if (err.message && !err.message.includes("fetch") && !err.message.includes("ECONNREFUSED")) {
      throw err;
    }
    throw new Error("Content analysis service is currently unavailable. Please check the backend connection.");
  }
}

export async function analyzeContentJson(payload: Record<string, any>): Promise<AnalyzeContentResponse> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/analyze-content-json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({
        detail: "Content analysis service is currently unavailable.",
      }));
      throw new Error(errorData.detail || `Analysis failed (HTTP ${res.status})`);
    }

    return res.json();
  } catch (err: any) {
    if (err.message && !err.message.includes("fetch") && !err.message.includes("ECONNREFUSED")) {
      throw err;
    }
    throw new Error("Content analysis service is currently unavailable.");
  }
}

export async function fetchInsights(): Promise<InsightsResponse> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/insights`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return {
        available: false,
        metrics: null,
        comparison: [],
      };
    }
    return res.json();
  } catch {
    return {
      available: false,
      metrics: null,
      comparison: [],
    };
  }
}

export async function uploadAndValidateCsv(file: File): Promise<CsvValidationResponse> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${getApiBaseUrl()}/api/validate-csv`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: "CSV validation failed." }));
      throw new Error(errorData.detail || `Server returned HTTP ${res.status}`);
    }

    return res.json();
  } catch (err: any) {
    if (err.message && !err.message.includes("fetch") && !err.message.includes("ECONNREFUSED")) {
      throw err;
    }
    throw new Error("Dataset validation service is currently unavailable.");
  }
}

export async function addAndRetrainDataset(file: File): Promise<import("@/types").RetrainResponse> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${getApiBaseUrl()}/api/add-and-retrain`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({
        detail: "Dataset append and retraining failed.",
      }));
      throw new Error(errorData.detail || `Retraining failed (HTTP ${res.status})`);
    }

    return res.json();
  } catch (err: any) {
    if (err.message && !err.message.includes("fetch") && !err.message.includes("ECONNREFUSED")) {
      throw err;
    }
    throw new Error("Dataset retraining service is currently unavailable. Please verify the backend is running.");
  }
}

export async function fetchDatasetProvenance(): Promise<{ success: boolean; history: import("@/types").DatasetProvenanceRecord[] }> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/dataset-provenance`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return { success: false, history: [] };
    }
    return res.json();
  } catch {
    return { success: false, history: [] };
  }
}

export async function compareScenarios(
  payload: import("@/types").CompareScenariosRequest
): Promise<import("@/types").CompareScenariosResponse> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/compare-scenarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({
        detail: "Scenario comparison service is currently unavailable.",
      }));
      throw new Error(errorData.detail || `Comparison failed (HTTP ${res.status})`);
    }

    return res.json();
  } catch (err: any) {
    if (err.message && !err.message.includes("fetch") && !err.message.includes("ECONNREFUSED")) {
      throw err;
    }
    throw new Error("Scenario comparison service is currently unavailable. Please verify the backend is running.");
  }
}

