"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { queryKeys } from "@/lib/api/shared/query-keys";
import { clearTokens } from "@/lib/utils/token-storage";
import type { ApiError } from "@/lib/api/shared/types";

interface UseLogoutOptions {
  showToasts?: boolean;
  redirectOnSuccess?: boolean;
  redirectPath?: string;
}

/** Clears client cache and returns to entry (no server session) */
export const useLogout = (options: UseLogoutOptions = {}) => {
  const { showToasts = true, redirectOnSuccess = true, redirectPath = "/sign-in" } = options;
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      clearTokens();
    },
    retry: false,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.auth.all });
      queryClient.removeQueries({ queryKey: queryKeys.user.all });
      if (showToasts) {
        toast.success("See you soon", { description: "Session cleared locally.", duration: 2500 });
      }
      if (redirectOnSuccess) {
        setTimeout(() => router.push(redirectPath), 300);
      }
    },
    onError: (error: ApiError) => {
      clearTokens();
      queryClient.removeQueries({ queryKey: queryKeys.auth.all });
      if (showToasts) {
        toast.error(error.message || "Cleared local session.");
      }
      if (redirectOnSuccess) router.push(redirectPath);
    },
  });

  return {
    logout: () => mutation.mutate(),
    logoutAsync: () => mutation.mutateAsync(),
    status: mutation.status,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    reset: mutation.reset,
  };
};
