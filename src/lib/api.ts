import { IMAGE_URLS } from "./constants";

// Utility functions for images
export const getImageUrl = (
  path: string | null,
  type: "poster" | "backdrop" | "profile" | "logo" = "poster",
  size: string = "w500",
): string => {
  if (!path) return "";

  switch (type) {
    case "poster":
      return (
        IMAGE_URLS.poster[size as keyof typeof IMAGE_URLS.poster]?.(path) || ""
      );
    case "backdrop":
      return (
        IMAGE_URLS.backdrop[size as keyof typeof IMAGE_URLS.backdrop]?.(path) ||
        ""
      );
    case "profile":
      return (
        IMAGE_URLS.profile[size as keyof typeof IMAGE_URLS.profile]?.(path) ||
        ""
      );
    case "logo":
      return (
        IMAGE_URLS.logo[size as keyof typeof IMAGE_URLS.logo]?.(path) || ""
      );
    default:
      return "";
  }
};
