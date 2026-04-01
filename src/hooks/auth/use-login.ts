"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { loginUser } from "@/lib/api/auth";
import { queryKeys } from "@/lib/api/shared/query-keys";
import { storeTokens } from "@/lib/utils/token-storage";
import type { ApiError } from "@/lib/api/shared/types";

interface UseLoginOptions {
  onSuccess?: () => void;
  onError?: (error: ApiError) => void;
  showToasts?: boolean;
  redirectOnSuccess?: boolean;
}

export const useLogin = (options: UseLoginOptions = {}) => {
  const {
    onSuccess: onSuccessCallback,
    onError: onErrorCallback,
    showToasts = true,
    redirectOnSuccess = true,
  } = options;

  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const mutation = useMutation({
    mutationFn: async () => loginUser(),
    retry: (failureCount, error) => {
      const err = error as ApiError;
      if (err.statusCode && err.statusCode >= 400 && err.statusCode < 500) return false;
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    onSuccess: () => {
      storeTokens({ accessToken: "open-access", refreshToken: "" });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.current() });
      if (showToasts) {
        toast.success("Welcome", { description: "You're in.", duration: 3000 });
      }
      onSuccessCallback?.();
      if (redirectOnSuccess) {
        const next = searchParams.get("redirect");
        router.replace(next && next.startsWith("/") ? next : "/dashboard");
      }
    },
    onError: (error: ApiError) => {
      const msg = error.message || error.error || "Could not enter the app.";
      if (showToasts) toast.error("Something went wrong", { description: msg });
      onErrorCallback?.(error);
    },
  });

  return {
    login: () => mutation.mutate(),
    loginAsync: () => mutation.mutateAsync(),
    status: mutation.status,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    data: mutation.data?.data,
    error: mutation.error as ApiError | null,
    reset: mutation.reset,
  };
};
