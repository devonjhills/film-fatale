export const SITE_NAME = "Film Fatale";
export const SITE_URL = "https://filmfatale.app";
export const SITE_DESCRIPTION =
  "Discover movies and TV shows, explore cast and crew, find where to watch, and keep a private personal library.";

export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}

export function conciseDescription(
  value: string | null | undefined,
  fallback: string,
  maxLength = 160,
): string {
  const normalized = value?.replace(/\s+/g, " ").trim() || fallback;
  if (normalized.length <= maxLength) return normalized;

  const shortened = normalized.slice(0, maxLength - 1);
  const lastSpace = shortened.lastIndexOf(" ");
  return `${shortened.slice(0, lastSpace > 100 ? lastSpace : undefined)}…`;
}

export function jsonLd(value: Record<string, unknown>): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
