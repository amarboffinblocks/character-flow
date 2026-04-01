"use client";

import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api/user";
import { queryKeys } from "@/lib/api/shared/query-keys";
import type { GetCurrentUserResponse } from "@/lib/api/user";
import type { ApiError } from "@/lib/api/shared/types";

interface UseCurrentUserOptions {
  enabled?: boolean;
  onSuccess?: (data: GetCurrentUserResponse) => void;
  onError?: (error: ApiError) => void;
  retry?: boolean;
}

export const useCurrentUser = (options: UseCurrentUserOptions = {}) => {
  const {
    enabled = true,
    onSuccess: onSuccessCallback,
    onError: onErrorCallback,
    retry = true,
  } = options;

  const query = useQuery({
    queryKey: queryKeys.user.current(),
    queryFn: async () => {
      const response = await getCurrentUser();
      return response.data;
    },
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: (failureCount, error) => {
      const apiError = error as unknown as ApiError;
      if (apiError?.statusCode === 401 || apiError?.statusCode === 403) {
        return false;
      }
      return retry && failureCount < 2;
    },
    retryDelay: 1000,
  });

  if (query.data && onSuccessCallback) {
    onSuccessCallback(query.data);
  }

  if (query.error && onErrorCallback) {
    onErrorCallback(query.error as unknown as ApiError);
  }

  return {
    user: query.data?.user,
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? (query.error as unknown as ApiError) : null,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
};
