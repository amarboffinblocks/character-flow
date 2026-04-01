/**
 * useUpdateProfilePicture Hook
 * Custom hook for updating profile picture with TanStack Query
 * Handles file upload with progress tracking and image validation
 */
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateProfilePicture } from "@/lib/api/user";
import { queryKeys } from "@/lib/api/shared/query-keys";
import type { UpdateProfilePictureResponse } from "@/lib/api/user";
import type { ApiError } from "@/lib/api/shared/types";

/**
 * Validate image file
 */
const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Please upload JPEG, PNG, WebP, or GIF.",
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: "File size exceeds 10MB limit. Please choose a smaller image.",
    };
  }

  return { valid: true };
};

interface UseUpdateProfilePictureOptions {
  onSuccess?: (data: UpdateProfilePictureResponse) => void;
  onError?: (error: ApiError) => void;
  showToasts?: boolean;
}

export const useUpdateProfilePicture = (options: UseUpdateProfilePictureOptions = {}) => {
  const {
    onSuccess: onSuccessCallback,
    onError: onErrorCallback,
    showToasts = true,
  } = options;

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      // Validate file before upload
      const validation = validateImageFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      return await updateProfilePicture(file);
    },

    retry: false,

    onSuccess: (response) => {
      const { data } = response;

      // Update cache with new avatar
      queryClient.setQueryData(queryKeys.user.current(), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          user: {
            ...old.user,
            avatar: data.user.avatar.url,
          },
        };
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });

      if (showToasts) {
        toast.success("Profile Picture Updated", {
          description: "Your profile picture has been updated successfully.",
          duration: 3000,
        });
      }

      if (onSuccessCallback) {
        onSuccessCallback(data);
      }
    },

    onError: (error: ApiError) => {
      const errorMessage =
        error.message ||
        error.error ||
        "Failed to update profile picture. Please try again.";

      if (showToasts) {
        toast.error("Upload Failed", {
          description: errorMessage,
          duration: 5000,
        });
      }

      if (onErrorCallback) {
        onErrorCallback(error);
      }
    },
  });

  const update = (file: File) => {
    return mutation.mutate(file);
  };

  const updateAsync = (file: File) => {
    return mutation.mutateAsync(file);
  };

  return {
    updateProfilePicture: update,
    updateProfilePictureAsync: updateAsync,
    status: mutation.status,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    data: mutation.data?.data,
    error: mutation.error as ApiError | null,
    reset: mutation.reset,
  };
};

