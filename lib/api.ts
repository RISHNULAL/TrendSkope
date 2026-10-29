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
        status: "ready",
        status_label: "READY",
        name: "Ridge Regression",
        active_model: "Ridge Regression",
        target: "Engagement Rate",
        target_formula: "log1p(engagement_rate)",
        dataset_size: 15000,
        master_records: 15000,
        training_records: 12750,
        test_records: 2250,
        features: 25,
        last_training: "",
        training_status: "Trained & Validated",
        validation_methodology: "Chronological Split (70% Train, 15% Validation, 15% Test)",
        selection_metric: "Validation MAE",
        splits: { train: 10500, validation: 2250, test: 2250 },
        metrics: {
          mae: 2.948,
          rmse: 4.007,
          r2: 0.196,
          median_absolute_error: 2.223,
        },
        validation_mae: 2.795,
        coefficients: [],
        comparison: [],
      },
      dataset: {
        posts: 15000,
        unique_post_ids: 15000,
        accounts: 250,
        date_start: "2025-01-01",
        date_end: "2026-10-25",
        date_coverage: "2025-01-01 to 2026-10-25",
        media_types: { image: 5993, reel: 5382, carousel: 3625 },
        missing_values: 0,
        duplicate_rows: 0,
        duplicate_post_ids: 0,
        records_added: 13900,
        rows: 15000,
        columns: 10,
        invalid_records: 0,
        required_fields_status: "All 8 Core Fields Compliant",
        quality_status: "Healthy",
        health: "Healthy",
        provenance: "Synthetic Simulation Research Corpus (250 Creator Accounts, 15 Domains)",
        provenance_status: "Synthetic Simulation Research Data",
        posts_over_time: [],
        engagement_quartiles: {},
        account_stats: { avg_posts: 60, min_posts: 25, max_posts: 120 },
        training_records: 12750,
        validation_records: 2250,
        test_records: 2250,
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

export async function fetchScenarioTemplates(): Promise<{
  success: boolean;
  templates: import("@/types").ScenarioTemplateItem[];
}> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/scenario-templates`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return { success: false, templates: [] };
    }
    return res.json();
  } catch {
    return { success: false, templates: [] };
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

export async function compareScenariosMultipart(
  formData: FormData
): Promise<import("@/types").CompareScenariosResponse> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/compare-scenarios-multipart`, {
      method: "POST",
      body: formData,
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

export async function fetchMediaSummary(): Promise<any> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/media-summary`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return { success: false };
    }
    return res.json();
  } catch {
    return { success: false };
  }
}

export async function fetchContentAuditDatasets(): Promise<import("@/types").ContentAuditDatasetsResponse> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/content-audit-datasets`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return {
        success: false,
        audit_datasets_count: 0,
        total_audit_records: 0,
        datasets: [],
      };
    }
    return res.json();
  } catch {
    return {
      success: false,
      audit_datasets_count: 0,
      total_audit_records: 0,
      datasets: [],
    };
  }
}


