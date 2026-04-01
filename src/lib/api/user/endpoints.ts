/**
 * User API Endpoints
 */
import { apiClient } from "../shared/client";
import { ApiResponse } from "../shared/types";
import type {
  GetCurrentUserResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  UpdateProfilePictureResponse,
} from "./types";

export const getCurrentUser = async (): Promise<ApiResponse<GetCurrentUserResponse>> => {
  const response = await apiClient.get<ApiResponse<GetCurrentUserResponse>>("/api/v1/user/me");
  return response.data;
};

export const updateProfile = async (
  data: UpdateProfileRequest
): Promise<ApiResponse<UpdateProfileResponse>> => {
  const hasMultipartData =
    data.avatar instanceof File || data.backgroundImg instanceof File;

  const payload = hasMultipartData
    ? (() => {
        const formData = new FormData();
        const appendValue = (key: string, value: unknown) => {
          if (value === undefined) return;
          if (value === null) {
            formData.append(key, "null");
            return;
          }
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
            return;
          }
          if (typeof value === "object") {
            formData.append(key, JSON.stringify(value));
            return;
          }
          formData.append(key, String(value));
        };

        Object.entries(data).forEach(([key, value]) => {
          if (key === "avatar" && value instanceof File) {
            formData.append("avatar", value);
            return;
          }
          if (key === "backgroundImg" && value instanceof File) {
            formData.append("backgroundImage", value);
            return;
          }
          appendValue(key, value);
        });

        return formData;
      })()
    : data;

  const response = await apiClient.put<ApiResponse<UpdateProfileResponse>>("/api/v1/user/profile", payload, {
    headers: hasMultipartData ? { "Content-Type": "multipart/form-data" } : {},
  });

  return response.data;
};

export const updateProfilePicture = async (
  file: File
): Promise<ApiResponse<UpdateProfilePictureResponse>> => {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await apiClient.put<ApiResponse<UpdateProfilePictureResponse>>(
    "/api/v1/user/profile-picture",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return response.data;
};
