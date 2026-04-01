/**
 * Background API Endpoints
 * All background-related API calls
 */
import { apiClient } from "../shared/client";
import { ApiResponse } from "../shared/types";
import { getAccessToken } from "@/lib/utils/token-storage";
import type {
  Background,
  ListBackgroundsFilters,
  ListBackgroundsResponse,
  GetBackgroundResponse,
  CreateBackgroundRequest,
  UpdateBackgroundRequest,
  ImportBackgroundResponse,
  BulkImportBackgroundsResponse,
} from "./types";

type RawBackground = Background & {
  image?: unknown;
};

const normalizeBackgroundImage = (rawImage: unknown): Background["image"] => {
  if (rawImage && typeof rawImage === "object" && !Array.isArray(rawImage)) {
    const imageObj = rawImage as Record<string, unknown>;
    const directUrl = typeof imageObj.url === "string" ? imageObj.url : null;
    const secureUrl =
      typeof imageObj.secure_url === "string" ? imageObj.secure_url : null;
    return {
      url: directUrl ?? secureUrl ?? "",
      width: typeof imageObj.width === "number" ? imageObj.width : undefined,
      height: typeof imageObj.height === "number" ? imageObj.height : undefined,
    };
  }

  if (typeof rawImage === "string") {
    const trimmed = rawImage.trim();
    if (!trimmed) {
      return { url: "" };
    }

    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed) as Record<string, unknown>;
        const parsedUrl =
          typeof parsed.url === "string"
            ? parsed.url
            : typeof parsed.secure_url === "string"
              ? parsed.secure_url
              : "";
        return {
          url: parsedUrl,
          width: typeof parsed.width === "number" ? parsed.width : undefined,
          height: typeof parsed.height === "number" ? parsed.height : undefined,
        };
      } catch {
        return { url: trimmed };
      }
    }

    return { url: trimmed };
  }

  return { url: "" };
};

const normalizeBackground = (raw: RawBackground): Background => ({
  ...raw,
  image: normalizeBackgroundImage(raw.image),
});

/**
 * List backgrounds with optional filters
 */
export const listBackgrounds = async (
  filters?: ListBackgroundsFilters
): Promise<ApiResponse<ListBackgroundsResponse>> => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("No access token available");
  }

  const params = new URLSearchParams();

  if (filters?.page !== undefined) {
    params.append("page", String(filters.page));
  }
  if (filters?.limit !== undefined) {
    params.append("limit", String(filters.limit));
  }
  if (filters?.search) {
    params.append("search", filters.search);
  }
  if (filters?.tags && filters.tags.length > 0) {
    params.append("tags", filters.tags.join(","));
  }
  if (filters?.excludeTags && filters.excludeTags.length > 0) {
    params.append("excludeTags", filters.excludeTags.join(","));
  }
  if (filters?.rating) {
    params.append("rating", filters.rating);
  }
  if (filters?.linkedTo) {
    params.append("linkedTo", filters.linkedTo);
  }
  if (filters?.sort) {
    params.append("sort", filters.sort);
  }
  if (filters?.order) {
    params.append("order", filters.order);
  }
  if (filters?.isGlobalDefault !== undefined) {
    params.append("isGlobalDefault", String(filters.isGlobalDefault));
  }
  if (filters?.characterId) {
    params.append("characterId", filters.characterId);
  }
  if (filters?.personaId) {
    params.append("personaId", filters.personaId);
  }
  if (filters?.lorebookId) {
    params.append("lorebookId", filters.lorebookId);
  }
  if (filters?.realmId) {
    params.append("realmId", filters.realmId);
  }

  const queryString = params.toString();
  const url = `/api/v1/backgrounds${queryString ? `?${queryString}` : ""}`;

  const response = await apiClient.get<ApiResponse<ListBackgroundsResponse>>(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.data?.data?.backgrounds) {
    response.data.data.backgrounds = response.data.data.backgrounds.map((bg) =>
      normalizeBackground(bg as RawBackground)
    );
  }

  return response.data;
};

/**
 * Get a background by ID
 */
export const getBackground = async (
  backgroundId: string
): Promise<ApiResponse<GetBackgroundResponse>> => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("No access token available");
  }

  const response = await apiClient.get<ApiResponse<GetBackgroundResponse>>(
    `/api/v1/backgrounds/${backgroundId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (response.data?.data?.background) {
    response.data.data.background = normalizeBackground(
      response.data.data.background as RawBackground
    );
  }

  return response.data;
};

/**
 * Create (upload) a new background
 */
export const createBackground = async (
  data: CreateBackgroundRequest
): Promise<ApiResponse<{ background: Background }>> => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("No access token available");
  }

  const formData = new FormData();
  formData.append("image", data.image);

  if (data.name) {
    formData.append("name", data.name);
  }
  if (data.description) {
    formData.append("description", data.description);
  }
  if (data.tags && data.tags.length > 0) {
    formData.append("tags", data.tags.join(","));
  }
  if (data.rating) {
    formData.append("rating", data.rating);
  }

  const response = await apiClient.post<ApiResponse<{ background: Background }>>(
    "/api/v1/backgrounds",
    formData,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (response.data?.data?.background) {
    response.data.data.background = normalizeBackground(
      response.data.data.background as RawBackground
    );
  }

  return response.data;
};

/**
 * Update a background by ID
 */
export const updateBackground = async (
  backgroundId: string,
  data: UpdateBackgroundRequest
): Promise<ApiResponse<GetBackgroundResponse>> => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("No access token available");
  }

  const response = await apiClient.put<ApiResponse<GetBackgroundResponse>>(
    `/api/v1/backgrounds/${backgroundId}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (response.data?.data?.background) {
    response.data.data.background = normalizeBackground(
      response.data.data.background as RawBackground
    );
  }

  return response.data;
};

/**
 * Delete a background by ID
 */
export const deleteBackground = async (backgroundId: string): Promise<void> => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("No access token available");
  }

  await apiClient.delete(`/api/v1/backgrounds/${backgroundId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

/**
 * Import a single background from image file
 */
export const importBackground = async (
  file: File
): Promise<ApiResponse<ImportBackgroundResponse>> => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("No access token available");
  }

  if (!file) {
    throw new Error("File is required for import");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<ApiResponse<ImportBackgroundResponse>>(
    "/api/v1/backgrounds/import",
    formData,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (response.data?.data?.background) {
    response.data.data.background = normalizeBackground(
      response.data.data.background as RawBackground
    );
  }

  return response.data;
};

/**
 * Bulk import backgrounds from multiple image files
 */
export const bulkImportBackgrounds = async (
  files: File[]
): Promise<ApiResponse<BulkImportBackgroundsResponse>> => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("No access token available");
  }

  if (!files || files.length === 0) {
    throw new Error("At least one file is required for bulk import");
  }

  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const response = await apiClient.post<ApiResponse<BulkImportBackgroundsResponse>>(
    "/api/v1/backgrounds/import/bulk",
    formData,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (response.data?.data?.backgrounds) {
    response.data.data.backgrounds = response.data.data.backgrounds.map((bg) =>
      normalizeBackground(bg as RawBackground)
    );
  }

  return response.data;
};

/**
 * Clear the global default background
 */
export const clearBackgroundDefault = async (
  backgroundId: string
): Promise<ApiResponse<{ message: string }>> => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("No access token available");
  }

  const response = await apiClient.delete<ApiResponse<{ message: string }>>(
    `/api/v1/backgrounds/${backgroundId}/default`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};

/**
 * Set a background as global default
 */
export const setBackgroundDefault = async (
  backgroundId: string
): Promise<ApiResponse<{ message: string }>> => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("No access token available");
  }

  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    `/api/v1/backgrounds/${backgroundId}/default`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};
