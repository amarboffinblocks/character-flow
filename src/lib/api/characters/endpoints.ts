/**
 * Character API Endpoints
 * All character-related API calls
 */
import { apiClient } from "../shared/client";
import { ApiResponse } from "../shared/types";
import type {
  CreateCharacterRequest,
  CreateCharacterResponse,
  UpdateCharacterRequest,
  UpdateCharacterResponse,
  GetCharacterResponse,
  ListCharactersResponse,
  BatchDuplicateCharactersResponse,
  ImportCharacterResponse,
  BulkImportCharactersResponse,
  Character,
} from "./types";
import { getAccessToken } from "@/lib/utils/token-storage";

/**
 * Create a new character
 * Supports both multipart/form-data (for file uploads) and application/json (backward compatible)
 */
export const createCharacter = async (
  data: CreateCharacterRequest
): Promise<ApiResponse<CreateCharacterResponse>> => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("No access token available");
  }

  // Check if we have file uploads
  const hasFiles = data.avatar instanceof File;

  if (hasFiles) {
    // Use FormData for multipart/form-data
    const formData = new FormData();

    // Add all form fields
    formData.append("characterName", data.name);

    if (data.visibility) {
      formData.append("visiable", data.visibility);
    }

    if (data.rating) {
      formData.append("rating", data.rating);
    }

    if (data.favourite !== undefined) {
      // API accepts boolean/string - send as string for FormData
      formData.append("favourite", String(data.favourite));
    }

    if (data.description) {
      formData.append("description", data.description);
    }

    if (data.scenario) {
      formData.append("scenario", data.scenario);
    }

    if (data.summary) {
      formData.append("summary", data.summary);
    }

    if (data.tags && data.tags.length > 0) {
      // Join tags with comma as per API spec
      formData.append("tags", data.tags.join(","));
    }

    if (data.firstMessage) {
      formData.append("firstMessage", data.firstMessage);
    }

    if (data.alternateMessages && data.alternateMessages.length > 0) {
      data.alternateMessages.forEach((msg, index) => {
        formData.append(`alternateMessages[${index}]`, msg);
      });
    }

    if (data.exampleDialogues && data.exampleDialogues.length > 0) {
      data.exampleDialogues.forEach((dialogue, index) => {
        formData.append(`exampleDialogues[${index}]`, dialogue);
      });
    }

    if (data.authorNotes) {
      formData.append("authorNotes", data.authorNotes);
    }

    if (data.characterNotes) {
      formData.append("characterNotes", data.characterNotes);
    }

    if (data.personaId) {
      formData.append("personaId", data.personaId);
    }

    if (data.lorebookId) {
      formData.append("lorebookId", data.lorebookId);
    }

    if (data.realmId) {
      formData.append("realmId", data.realmId);
    }

    if (data.tokens !== undefined) {
      formData.append("tokens", String(data.tokens));
    }

    // Handle file uploads
    if (data.avatar instanceof File) {
      formData.append("avatar", data.avatar);
    } else if (typeof data.avatar === "string") {
      // If avatar is a URL string, send it as is
      formData.append("avatar", data.avatar);
    }

    const response = await apiClient.post<ApiResponse<CreateCharacterResponse>>(
      "/api/v1/characters",
      formData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // Don't set Content-Type - browser will set it with boundary for multipart/form-data
        },
      }
    );

    return response.data;
  } else {
    // Use JSON for backward compatibility (when no files are uploaded)
    const jsonData: any = {
      characterName: data.name,
      visiable: data.visibility,
      rating: data.rating,
      favourite: data.favourite,
      description: data.description,
      scenario: data.scenario,
      summary: data.summary,
      tags: data.tags,
      firstMessage: data.firstMessage,
      alternateMessages: data.alternateMessages,
      exampleDialogues: data.exampleDialogues,
      authorNotes: data.authorNotes,
      characterNotes: data.characterNotes,
      personaId: data.personaId,
      lorebookId: data.lorebookId,
      realmId: data.realmId,
    };

    // Only include avatar if it's a string (URL)
    if (typeof data.avatar === "string") {
      jsonData.avatar = data.avatar;
    }

    const response = await apiClient.post<ApiResponse<CreateCharacterResponse>>(
      "/api/v1/characters",
      jsonData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  }
};

/**
 * Get a character by ID
 * @param characterId - Character UUID
 * @param options - Optional configuration
 */
export const getCharacter = async (
  characterId: string,
  options?: { requireAuth?: boolean }
): Promise<ApiResponse<GetCharacterResponse>> => {
  const accessToken = getAccessToken();

  if (options?.requireAuth && !accessToken) {
    throw new Error("Authentication required");
  }

  const headers: Record<string, string> = {};

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  // Validation: Character ID must be a valid UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(characterId)) {
    throw new Error("Invalid character ID format");
  }

  const response = await apiClient.get<ApiResponse<GetCharacterResponse>>(
    `/api/v1/characters/${characterId}`,
    {
      headers,
    }
  );


  return response.data;
};

/**
 * List characters with optional filters
 * Supports filtering, sorting, and pagination
 */
export const listCharacters = async (
  filters?: {
    page?: number;
    limit?: number;
    search?: string;
    rating?: "SFW" | "NSFW";
    visibility?: "public" | "private";
    isFavourite?: boolean;
    isSaved?: boolean;
    tags?: string[];
    excludeTags?: string[];
    sortBy?: "createdAt" | "updatedAt" | "name" | "chatCount";
    sortOrder?: "asc" | "desc";
  }
): Promise<ApiResponse<ListCharactersResponse>> => {
  const accessToken = getAccessToken();

  const headers: Record<string, string> = {};

  // Add authorization header if token is available (optional for personalized results)
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  // Build query parameters
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
  if (filters?.rating) {
    params.append("rating", filters.rating);
  }
  if (filters?.visibility) {
    params.append("visibility", filters.visibility);
  }
  if (filters?.isFavourite !== undefined) {
    params.append("isFavourite", String(filters.isFavourite));
  }
  if (filters?.isSaved !== undefined) {
    params.append("isSaved", String(filters.isSaved));
  }
  if (filters?.tags && filters.tags.length > 0) {
    // Join tags with comma as per API spec
    params.append("tags", filters.tags.join(","));
  }
  if (filters?.excludeTags && filters.excludeTags.length > 0) {
    // Join exclude tags with comma as per API spec
    params.append("excludeTags", filters.excludeTags.join(","));
  }
  if (filters?.sortBy) {
    params.append("sortBy", filters.sortBy);
  }
  if (filters?.sortOrder) {
    params.append("sortOrder", filters.sortOrder);
  }

  const queryString = params.toString();
  const url = `/api/v1/characters${queryString ? `?${queryString}` : ""}`;

  const response = await apiClient.get<ApiResponse<ListCharactersResponse>>(
    url,
    {
      headers,
    }
  );

  return response.data;
};

/**
 * Duplicate a character by ID
 * Fetches the character and creates a new one with the same data
 */
export const duplicateCharacter = async (
  characterId: string
): Promise<ApiResponse<CreateCharacterResponse>> => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("No access token available");
  }

  // First, get the character to duplicate
  const characterResponse = await getCharacter(characterId, { requireAuth: true });
  const character = characterResponse.data.character;

  // Prepare data for duplication
  // Add "Copy" suffix to the name
  const duplicateData: CreateCharacterRequest = {
    name: `${character.name} (Copy)`,
    description: character.description,
    scenario: character.scenario,
    summary: character.summary,
    rating: character.rating,
    visibility: character.visibility,
    tags: character.tags,
    firstMessage: character.firstMessage,
    alternateMessages: character.alternateMessages,
    exampleDialogues: character.exampleDialogues,
    authorNotes: character.authorNotes,
    characterNotes: character.characterNotes,
    personaId: character.persona?.id,
    lorebookId: character.lorebook?.id,
    realmId: character.realm?.id,
    favourite: false, // New duplicate is not favorited by default
  };

  // Handle images - if they're URLs, we need to fetch and convert to Files
  // For now, we'll pass the URLs and let the backend handle it
  if (character.avatar?.url) {
    duplicateData.avatar = character.avatar.url;
  }

  // Create the duplicate character
  return createCharacter(duplicateData);
};

/**
 * Batch duplicate multiple characters by IDs
 * Uses the backend batch-duplicate endpoint for optimal performance
 * Single API call instead of multiple sequential calls
 * 
 * @param characterIds - Array of character UUIDs to duplicate (1-100 characters)
 * @returns Promise with results
 * @throws Error if validation fails or API call fails
 */
export const duplicateCharactersBatch = async (
  characterIds: string[]
): Promise<ApiResponse<BatchDuplicateCharactersResponse>> => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("No access token available");
  }

  // Validation: Minimum 1 character ID required
  if (!characterIds || characterIds.length === 0) {
    throw new Error("Character IDs array is required and cannot be empty");
  }

  // Validation: Maximum 100 character IDs
  if (characterIds.length > 100) {
    throw new Error("Maximum 100 character IDs allowed per batch duplicate request");
  }

  // Validation: All IDs must be valid UUIDs
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const invalidIds = characterIds.filter((id) => !uuidRegex.test(id));
  if (invalidIds.length > 0) {
    throw new Error(`Invalid character ID format. Invalid IDs: ${invalidIds.slice(0, 5).join(", ")}${invalidIds.length > 5 ? "..." : ""}`);
  }

  try {
    // Call the backend batch-duplicate endpoint
    const response = await apiClient.post<ApiResponse<BatchDuplicateCharactersResponse>>(
      "/api/v1/characters/batch-duplicate",
      {
        characterIds,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    // Handle API error responses
    if (error.response?.data) {
      const errorData = error.response.data;
      // Handle structured error response with code and message
      if (errorData.error?.code && errorData.error?.message) {
        throw new Error(`${errorData.error.code}: ${errorData.error.message}`);
      }
      // Handle simple error response
      if (errorData.error || errorData.message) {
        throw new Error(errorData.error || errorData.message);
      }
    }
    throw error;
  }
};

/**
 * Delete a character by ID
 * @param characterId - Character UUID
 */
export const deleteCharacter = async (characterId: string): Promise<void> => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("No access token available");
  }

  // Validation: Character ID must be a valid UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(characterId)) {
    throw new Error("Invalid character ID format");
  }

  try {
    await apiClient.delete(`/api/v1/characters/${characterId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (error: any) {
    // Handle API error responses
    if (error.response?.data) {
      const errorData = error.response.data;
      // Handle structured error response with code and message
      if (errorData.error?.code && errorData.error?.message) {
        throw new Error(`${errorData.error.code}: ${errorData.error.message}`);
      }
      // Handle simple error response
      if (errorData.error || errorData.message) {
        throw new Error(errorData.error || errorData.message);
      }
    }
    throw error;
  }
};

/**
 * Update a character by ID
 * Supports both multipart/form-data (with files) and JSON (without files)
 * @param characterId - Character UUID
 * @param data - Character update data
 */
export const updateCharacter = async (
  characterId: string,
  data: UpdateCharacterRequest
): Promise<ApiResponse<UpdateCharacterResponse>> => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("No access token available");
  }

  // Validation: Character ID must be a valid UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(characterId)) {
    throw new Error("Invalid character ID format");
  }

  const hasFiles = data.avatar instanceof File;

  if (hasFiles) {
    // Use FormData for multipart/form-data
    const formData = new FormData();

    // Add all form fields
    if (data.name) {
      formData.append("characterName", data.name);
    }

    if (data.visibility) {
      formData.append("visiable", data.visibility);
    }

    if (data.rating) {
      formData.append("rating", data.rating);
    }

    if (data.favourite !== undefined) {
      formData.append("favourite", String(data.favourite));
    }

    if (data.description) {
      formData.append("description", data.description);
    }

    if (data.scenario) {
      formData.append("scenario", data.scenario);
    }

    if (data.summary) {
      formData.append("summary", data.summary);
    }

    if (data.tags && data.tags.length > 0) {
      formData.append("tags", data.tags.join(","));
    }

    if (data.firstMessage) {
      formData.append("firstMessage", data.firstMessage);
    }

    if (data.alternateMessages && data.alternateMessages.length > 0) {
      data.alternateMessages.forEach((msg, index) => {
        formData.append(`alternateMessages[${index}]`, msg);
      });
    }

    if (data.exampleDialogues && data.exampleDialogues.length > 0) {
      data.exampleDialogues.forEach((dialogue, index) => {
        formData.append(`exampleDialogues[${index}]`, dialogue);
      });
    }

    if (data.authorNotes) {
      formData.append("authorNotes", data.authorNotes);
    }

    if (data.characterNotes) {
      formData.append("characterNotes", data.characterNotes);
    }

    if (data.personaId) {
      formData.append("personaId", data.personaId);
    }

    if (data.lorebookId) {
      formData.append("lorebookId", data.lorebookId);
    }

    if (data.realmId) {
      formData.append("realmId", data.realmId);
    }

    if (data.tokens !== undefined) {
      formData.append("tokens", String(data.tokens));
    }

    // Handle file uploads
    if (data.avatar instanceof File) {
      formData.append("avatar", data.avatar);
    } else if (typeof data.avatar === "string") {
      formData.append("avatar", data.avatar);
    }

    const response = await apiClient.put<ApiResponse<UpdateCharacterResponse>>(
      `/api/v1/characters/${characterId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // Don't set Content-Type - browser will set it with boundary for multipart/form-data
        },
      }
    );

    return response.data;
  } else {
    // Use JSON for backward compatibility (when no files are uploaded)
    const jsonData: any = {
      characterName: data.name,
      visiable: data.visibility,
      rating: data.rating,
      favourite: data.favourite,
      description: data.description,
      scenario: data.scenario,
      summary: data.summary,
      tags: data.tags,
      firstMessage: data.firstMessage,
      alternateMessages: data.alternateMessages,
      exampleDialogues: data.exampleDialogues,
      authorNotes: data.authorNotes,
      characterNotes: data.characterNotes,
      personaId: data.personaId,
      lorebookId: data.lorebookId,
      realmId: data.realmId,
    };

    // Only include avatar if it's a string (URL)
    if (typeof data.avatar === "string") {
      jsonData.avatar = data.avatar;
    }

    const response = await apiClient.put<ApiResponse<UpdateCharacterResponse>>(
      `/api/v1/characters/${characterId}`,
      jsonData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  }
};

/**
 * Batch delete multiple characters by IDs
 * Uses the backend batch-delete endpoint for optimal performance
 * Single API call instead of multiple sequential calls
 * 
 * @param characterIds - Array of character UUIDs to delete (1-100 characters)
 * @returns Promise with results
 * @throws Error if validation fails or API call fails
 */
export const deleteCharactersBatch = async (
  characterIds: string[]
): Promise<{ success: number; failed: number; errors: Array<{ id: string; error: string }> }> => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("No access token available");
  }

  // Validation: Minimum 1 character ID required
  if (!characterIds || characterIds.length === 0) {
    throw new Error("Character IDs array is required and cannot be empty");
  }

  // Validation: Maximum 100 character IDs
  if (characterIds.length > 100) {
    throw new Error("Maximum 100 character IDs allowed per batch delete request");
  }

  // Validation: All IDs must be valid UUIDs
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const invalidIds = characterIds.filter((id) => !uuidRegex.test(id));
  if (invalidIds.length > 0) {
    throw new Error(`Invalid character ID format. Invalid IDs: ${invalidIds.slice(0, 5).join(", ")}${invalidIds.length > 5 ? "..." : ""}`);
  }

  try {
    // Call the backend batch-delete endpoint
    const response = await apiClient.post<ApiResponse<{ success: number; failed: number; errors: Array<{ id: string; error: string }>; message: string }>>(
      "/api/v1/characters/batch-delete",
      {
        characterIds,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: response.data.data.success,
      failed: response.data.data.failed,
      errors: response.data.data.errors,
    };
  } catch (error: any) {
    // Handle API error responses
    if (error.response?.data) {
      const errorData = error.response.data;
      // Handle structured error response with code and message
      if (errorData.error?.code && errorData.error?.message) {
        throw new Error(`${errorData.error.code}: ${errorData.error.message}`);
      }
      // Handle simple error response
      if (errorData.error || errorData.message) {
        throw new Error(errorData.error || errorData.message);
      }
    }
    throw error;
  }
};

/**
 * Toggle favourite status of a character
 * @param characterId - Character UUID
 * @returns Promise with updated character data
 */
export const toggleCharacterFavourite = async (
  characterId: string
): Promise<ApiResponse<{ character: Character; isFavourite: boolean }>> => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("No access token available");
  }

  // Validation: Character ID must be a valid UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(characterId)) {
    throw new Error("Invalid character ID format");
  }

  try {
    const response = await apiClient.patch<ApiResponse<{ character: Character; isFavourite: boolean }>>(
      `/api/v1/characters/${characterId}/favourite`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    // Handle API error responses
    if (error.response?.data) {
      const errorData = error.response.data;
      if (errorData.error?.code && errorData.error?.message) {
        throw new Error(`${errorData.error.code}: ${errorData.error.message}`);
      }
      if (errorData.error || errorData.message) {
        throw new Error(errorData.error || errorData.message);
      }
    }
    throw error;
  }
};

/**
 * Toggle saved status of a character
 * @param characterId - Character UUID
 * @returns Promise with updated character data
 */
export const toggleCharacterSaved = async (
  characterId: string
): Promise<ApiResponse<{ character: Character; isSaved: boolean }>> => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("No access token available");
  }

  // Validation: Character ID must be a valid UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(characterId)) {
    throw new Error("Invalid character ID format");
  }

  try {
    const response = await apiClient.patch<ApiResponse<{ character: Character; isSaved: boolean }>>(
      `/api/v1/characters/${characterId}/saved`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    // Handle API error responses
    if (error.response?.data) {
      const errorData = error.response.data;
      if (errorData.error?.code && errorData.error?.message) {
        throw new Error(`${errorData.error.code}: ${errorData.error.message}`);
      }
      if (errorData.error || errorData.message) {
        throw new Error(errorData.error || errorData.message);
      }
    }
    throw error;
  }
};

/**
 * Export a character as JSON file
 * Downloads the character data as a JSON file
 * @param characterId - Character UUID
 * @param format - Export format: "json" | "png" (default: "json")
 */
export const exportCharacter = async (
  characterId: string,
  format: "json" | "png" = "json"
): Promise<void> => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("No access token available");
  }

  // Validation: Character ID must be a valid UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(characterId)) {
    throw new Error("Invalid character ID format");
  }

  try {
    // For JSON export, we'll fetch the character and create a downloadable file
    if (format === "json") {
      // First, get the character data
      const characterResponse = await getCharacter(characterId, { requireAuth: true });
      const character = characterResponse.data.character;

      // Create a clean export object (remove internal fields)
      const exportData = {
        name: character.name,
        description: character.description,
        scenario: character.scenario,
        summary: character.summary,
        rating: character.rating,
        visibility: character.visibility,
        tags: character.tags,
        firstMessage: character.firstMessage,
        alternateMessages: character.alternateMessages,
        exampleDialogues: character.exampleDialogues,
        authorNotes: character.authorNotes,
        characterNotes: character.characterNotes,
        avatar: character.avatar?.url,
        backgroundImg: character.backgroundImg?.url,
        // Include metadata
        exportedAt: new Date().toISOString(),
        version: "1.0",
      };

      // Create a blob and download
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${character.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${characterId.slice(0, 8)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // For PNG export, we would need backend support
      // For now, throw an error or implement a fallback
      throw new Error("PNG export is not yet supported. Please use JSON format.");
    }
  } catch (error: any) {
    // Handle API error responses
    if (error.response?.data) {
      const errorData = error.response.data;
      // Handle structured error response with code and message
      if (errorData.error?.code && errorData.error?.message) {
        throw new Error(`${errorData.error.code}: ${errorData.error.message}`);
      }
      // Handle simple error response
      if (errorData.error || errorData.message) {
        throw new Error(errorData.error || errorData.message);
      }
    }
    throw error;
  }
};

/**
 * Import a character from JSON or PNG file
 * @param file - File object (JSON or PNG)
 * @returns Promise with imported character data
 */
export const importCharacter = async (
  file: File
): Promise<ApiResponse<ImportCharacterResponse>> => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("No access token available");
  }

  // Validation: File must be provided
  if (!file) {
    throw new Error("File is required for import");
  }

  // Validation: File type must be JSON or PNG
  const allowedTypes = ['application/json', 'image/png', 'image/jpeg', 'image/jpg'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Invalid file type. Allowed types: JSON, PNG, JPEG, JPG");
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<ImportCharacterResponse>>(
      "/api/v1/characters/import",
      formData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // Don't set Content-Type - browser will set it with boundary for multipart/form-data
        },
      }
    );

    return response.data;
  } catch (error: any) {
    // Handle API error responses
    if (error.response?.data) {
      const errorData = error.response.data;
      // Handle structured error response with code and message
      if (errorData.error?.code && errorData.error?.message) {
        throw new Error(`${errorData.error.code}: ${errorData.error.message}`);
      }
      // Handle simple error response
      if (errorData.error || errorData.message) {
        throw new Error(errorData.error || errorData.message);
      }
    }
    throw error;
  }
};

/**
 * Bulk import characters from JSON file (array of characters) or ZIP file
 * @param file - File object (JSON array or ZIP)
 * @returns Promise with bulk import results
 */
export const bulkImportCharacters = async (
  file: File
): Promise<ApiResponse<BulkImportCharactersResponse>> => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("No access token available");
  }

  // Validation: File must be provided
  if (!file) {
    throw new Error("File is required for bulk import");
  }

  // Validation: File type must be JSON (ZIP support can be added later)
  const allowedTypes = ['application/json'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Invalid file type. Allowed types: JSON (array of characters)");
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<BulkImportCharactersResponse>>(
      "/api/v1/characters/import/bulk",
      formData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // Don't set Content-Type - browser will set it with boundary for multipart/form-data
        },
      }
    );

    return response.data;
  } catch (error: any) {
    // Handle API error responses
    if (error.response?.data) {
      const errorData = error.response.data;
      // Handle structured error response with code and message
      if (errorData.error?.code && errorData.error?.message) {
        throw new Error(`${errorData.error.code}: ${errorData.error.message}`);
      }
      // Handle simple error response
      if (errorData.error || errorData.message) {
        throw new Error(errorData.error || errorData.message);
      }
    }
    throw error;
  }
};
