/**
 * Authentication API Types
 */

import { ApiResponse } from "../shared/types";

export interface AuthUserSummary {
  id: string;
  name: string;
  username: string;
  email: string;
  phoneNumber?: string | null;
  role: string;
  subscriptionPlan: string;
  tokensRemaining: number;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

/** POST /auth/login — ensures guest profile (no tokens) */
export interface LoginResponse {
  user: AuthUserSummary;
}

export interface UsernameCheckResponse {
  available: boolean;
  username: string;
  suggestions?: string[];
  errors?: string[];
}

export type { ApiResponse };
