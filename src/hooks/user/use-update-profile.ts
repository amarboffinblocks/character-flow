/**
 * useUpdateProfile Hook
 * Custom hook for updating user profile with TanStack Query
 * Handles profile updates with optimistic updates and cache invalidation
 */
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateProfile } from "@/lib/api/user";
import { queryKeys } from "@/lib/api/shared/query-keys";
import type { UpdateProfileRequest, UpdateProfileResponse } from "@/lib/api/user";
import type { ApiError } from "@/lib/api/shared/types";

interface UseUpdateProfileOptions {
  onSuccess?: (data: UpdateProfileResponse) => void;
  onError?: (error: ApiError) => void;
  showToasts?: boolean;
}

export const useUpdateProfile = (options: UseUpdateProfileOptions = {}) => {
  const {
    onSuccess: onSuccessCallback,
    onError: onErrorCallback,
    showToasts = true,
  } = options;

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: UpdateProfileRequest) => updateProfile(data),

    retry: false,

    /**
     * Optimistic update
     * Updates cache immediately for better UX
     */
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.user.current() });

      // Snapshot previous value
      const previousUser = queryClient.getQueryData(queryKeys.user.current());

      // Optimistically update cache
      queryClient.setQueryData(queryKeys.user.current(), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          user: {
            ...old.user,
            ...newData,
          },
        };
      });

      return { previousUser };
    },

    onSuccess: (response) => {
      const { data } = response;

      // Update cache with server response
      queryClient.setQueryData(queryKeys.user.current(), {
        user: data.user,
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });

      if (showToasts) {
        toast.success("Profile Updated", {
          description: "Your profile has been updated successfully.",
          duration: 3000,
        });
      }

      if (onSuccessCallback) {
        onSuccessCallback(data);
      }
    },

    onError: (error: ApiError, newData, context) => {
      // Rollback optimistic update
      if (context?.previousUser) {
        queryClient.setQueryData(queryKeys.user.current(), context.previousUser);
      }

      const errorMessage =
        error.message ||
        error.error ||
        "Failed to update profile. Please try again.";

      if (showToasts) {
        toast.error("Update Failed", {
          description: errorMessage,
          duration: 5000,
        });
      }

      if (onErrorCallback) {
        onErrorCallback(error);
      }
    },

    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.user.current() });
    },
  });

  const update = (data: UpdateProfileRequest) => {
    return mutation.mutate(data);
  };

  const updateAsync = (data: UpdateProfileRequest) => {
    return mutation.mutateAsync(data);
  };

  return {
    updateProfile: update,
    updateProfileAsync: updateAsync,
    status: mutation.status,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    data: mutation.data?.data,
    error: mutation.error as ApiError | null,
    reset: mutation.reset,
  };
};

