/**
 * Authentication API Endpoints
 */
import { apiClient } from "../shared/client";
import { ApiResponse } from "../shared/types";
import type { LoginResponse, UsernameCheckResponse } from "./types";

export const loginUser = async (): Promise<ApiResponse<LoginResponse>> => {
  const response = await apiClient.post<ApiResponse<LoginResponse>>("/api/v1/auth/login", {});
  return response.data;
};

export const checkUsernameAvailability = async (
  username: string
): Promise<ApiResponse<UsernameCheckResponse>> => {
  const response = await apiClient.get<ApiResponse<UsernameCheckResponse>>(
    "/api/v1/auth/username/check",
    { params: { username } }
  );
  return response.data;
};
