import type { DesignConfig, GenerationResponse, ValidationResponse } from "../types/design";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";

async function request<T>(path: string, payload: DesignConfig): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const validateDesign = (payload: DesignConfig): Promise<ValidationResponse> =>
  request<ValidationResponse>("/designs/validate", payload);

export const generateDesign = (payload: DesignConfig): Promise<GenerationResponse> =>
  request<GenerationResponse>("/designs/generate", payload);

