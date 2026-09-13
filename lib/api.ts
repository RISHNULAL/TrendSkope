import {
  CsvValidationResponse,
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
