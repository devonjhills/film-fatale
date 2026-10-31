import { unstable_cache } from "next/cache";

/** unstable_cache with a one-hour default revalidation. */
export function createOptimizedCache<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  keyParts: string[],
  options: {
    revalidate?: number;
    tags?: string[];
  } = {},
) {
  const { revalidate = 3600, tags = [] } = options;

  return unstable_cache(fn, keyParts, {
    revalidate,
    tags,
  });
}

export const CACHE_TAGS = {
  MOVIES: "movies",
  TV_SHOWS: "tv-shows",
  FEATURED: "featured",
} as const;
