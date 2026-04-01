/**
 * API Client — centralized HTTP with error shaping (no JWT refresh)
 */
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { ApiError } from "./types";

declare module "axios" {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

const getBaseURL = (): string => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  }
  return process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:8000";
};

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: getBaseURL(),
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
      }

      if (["post", "put", "patch"].includes(config.method?.toLowerCase() || "") && !config.headers["Idempotency-Key"]) {
        const uuid =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        config.headers["Idempotency-Key"] = uuid;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const apiError: ApiError = {
        success: false,
        error: error.message || "An unexpected error occurred",
        statusCode: error.response?.status,
      };

      if (error.response) {
        const data = error.response.data as {
          message?: string | { code?: number; message?: string };
          error?: string | { code?: number; message?: string };
        };

        let messageStr: string | undefined;
        if (typeof data.message === "string") {
          messageStr = data.message;
        } else if (
          data.message &&
          typeof data.message === "object" &&
          "message" in data.message &&
          typeof data.message.message === "string"
        ) {
          messageStr = data.message.message;
        }

        let errorStr: string | undefined;
        if (typeof data.error === "string") {
          errorStr = data.error;
        } else if (
          data.error &&
          typeof data.error === "object" &&
          "message" in data.error &&
          typeof data.error.message === "string"
        ) {
          errorStr = data.error.message;
        }

        apiError.message = messageStr || errorStr || error.message;
        apiError.error = errorStr || messageStr || error.message;

        if (
          data &&
          typeof data === "object" &&
          "error" in data &&
          data.error &&
          typeof data.error === "object" &&
          "details" in data.error
        ) {
          apiError.details = (data.error as { details?: unknown }).details;
        }
      } else if (error.request) {
        apiError.error = "Network error. Please check your connection.";
        apiError.message = "Unable to reach the server. Please try again later.";
      } else {
        apiError.error = error.message || "Request configuration error";
      }

      return Promise.reject(apiError);
    }
  );

  return client;
};

export const apiClient = createApiClient();

export const generateIdempotencyKey = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`;
};
