/**
 * Image Utilities
 * Helpers for handling image URLs and transformations
 */

/**
 * Get the full URL for an image path
 * Handles relative paths from the backend and full Cloudinary/external URLs
 */
export const getImageUrl = (path: string | null | undefined): string => {
    if (!path) return "/logo1.png"; // Fallback image

    // If it's already a full URL, return as-is
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
        return path;
    }

    // Handle local storage paths from backend
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    // Ensure we don't have double slashes
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

    return `${cleanBaseUrl}${cleanPath}`;
};
