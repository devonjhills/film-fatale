import { TMDB_PATHS } from "./constants";
import { createOptimizedCache, CACHE_TAGS } from "./cache-utils";
import type { Movie, TVShow, TMDBResponse } from "./types";
import { fetchTMDBServer } from "./tmdb-server";

/** One TMDB list page; an empty list if TMDB fails, so pages still render. */
async function fetchFromTMDB<T>(endpoint: string): Promise<T[]> {
  try {
    const data = await fetchTMDBServer<TMDBResponse<T>>(endpoint, {
      next: { revalidate: 3600 },
    });
    return data.results || [];
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    return [];
  }
}

export const fetchMovies = createOptimizedCache(
  (endpoint: string) => fetchFromTMDB<Movie>(endpoint),
  ["fetch-movies"],
  { tags: [CACHE_TAGS.MOVIES] },
);

export const fetchTVShows = createOptimizedCache(
  (endpoint: string) => fetchFromTMDB<TVShow>(endpoint),
  ["fetch-tv-shows"],
  { tags: [CACHE_TAGS.TV_SHOWS] },
);

type TrendingItem = (Movie & { media_type: "movie" }) | (TVShow & { media_type: "tv" });

/** Home page shelves: trending across movies and TV, then one list of each. */
export const fetchHomeShelves = createOptimizedCache(
  async () => {
    const [trending, nowPlaying, popularTV, topRated] = await Promise.all([
      fetchFromTMDB<TrendingItem | { media_type: "person" }>(TMDB_PATHS.trendingWeek),
      fetchFromTMDB<Movie>(TMDB_PATHS.moviesNowPlaying),
      fetchFromTMDB<TVShow>(TMDB_PATHS.tvPopular),
      fetchFromTMDB<Movie>(TMDB_PATHS.moviesTopRated),
    ]);

    return {
      trending: trending.filter((item): item is TrendingItem => item.media_type !== "person"),
      nowPlaying,
      popularTV,
      topRated,
    };
  },
  ["home-shelves"],
  { revalidate: 1800, tags: [CACHE_TAGS.FEATURED] },
);

/** TV page shelves. */
export const fetchTVShelves = createOptimizedCache(
  async () => {
    const [onTheAir, popular, topRated] = await Promise.all([
      fetchFromTMDB<TVShow>(TMDB_PATHS.tvOnTheAir),
      fetchFromTMDB<TVShow>(TMDB_PATHS.tvPopular),
      fetchFromTMDB<TVShow>(TMDB_PATHS.tvTopRated),
    ]);
    return { onTheAir, popular, topRated };
  },
  ["tv-shelves"],
  { revalidate: 1800, tags: [CACHE_TAGS.FEATURED, CACHE_TAGS.TV_SHOWS] },
);
