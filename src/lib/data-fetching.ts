import { TMDB_PATHS } from "./constants";
import { createOptimizedCache, CACHE_TAGS } from "./cache-utils";
import type { Movie, TVShow, TMDBResponse } from "./types";
import { fetchTMDBServer } from "./tmdb-server";

/** One TMDB list page; an empty list if TMDB fails, so pages still render. */
async function fetchFromTMDB<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean>,
): Promise<T[]> {
  try {
    const data = await fetchTMDBServer<TMDBResponse<T>>(endpoint, {
      params,
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

export type TrendingItem = (Movie & { media_type: "movie" }) | (TVShow & { media_type: "tv" });

const isoDate = (offsetDays: number) =>
  new Date(Date.now() + offsetDays * 86_400_000).toISOString().slice(0, 10);

const today = () => isoDate(0);

/** TMDB TV genres for news and talk shows. */
const NOT_SERIES = [10763, 10767];

/**
 * Discover: a mixed overview of what's new. Trending today leads; then new
 * releases in theaters, on streaming and on TV; then what's coming soon.
 */
export const fetchDiscoverShelves = createOptimizedCache(
  async () => {
    const [trending, nowPlaying, newStreaming, newShows, upcomingMovies, upcomingShows] =
      await Promise.all([
        fetchFromTMDB<TrendingItem | { media_type: "person" }>(TMDB_PATHS.trendingDay),
        fetchFromTMDB<Movie>(TMDB_PATHS.moviesNowPlaying, { region: "US" }),
        // Digital releases (type 4) in the US over the last six weeks.
        fetchFromTMDB<Movie>(TMDB_PATHS.movieDiscover, {
          region: "US",
          with_release_type: 4,
          "release_date.gte": isoDate(-42),
          "release_date.lte": today(),
          sort_by: "popularity.desc",
          "vote_count.gte": 10,
          include_adult: false,
        }),
        // Series that premiered in the last six weeks, in English-speaking markets first.
        fetchFromTMDB<TVShow>(TMDB_PATHS.tvDiscover, {
          "first_air_date.gte": isoDate(-42),
          "first_air_date.lte": today(),
          sort_by: "popularity.desc",
          with_original_language: "en",
          without_genres: "10763,10764,10767",
          include_adult: false,
        }),
        fetchFromTMDB<Movie>(TMDB_PATHS.moviesUpcoming, { region: "US" }),
        fetchFromTMDB<TVShow>(TMDB_PATHS.tvDiscover, {
          "first_air_date.gte": isoDate(1),
          "first_air_date.lte": isoDate(90),
          sort_by: "popularity.desc",
          with_original_language: "en",
          without_genres: "10763,10764,10767",
          include_adult: false,
        }),
      ]);

    const now = today();
    const byDate = <T>(date: (item: T) => string | undefined) => (a: T, b: T) =>
      (date(a) ?? "").localeCompare(date(b) ?? "");

    return {
      // Talk and news shows trend every day; leave them out of a film and series overview.
      trending: trending.filter(
        (item): item is TrendingItem =>
          item.media_type !== "person" && !item.genre_ids.some((id) => NOT_SERIES.includes(id)),
      ),
      nowPlaying,
      // Theatrical titles also show up as digital releases; keep each in one shelf.
      newStreaming: newStreaming.filter((movie) => !nowPlaying.some((playing) => playing.id === movie.id)),
      newShows,
      comingSoon: {
        movies: upcomingMovies
          .filter((movie) => movie.release_date > now && movie.poster_path)
          .slice(0, 6)
          .sort(byDate((movie: Movie) => movie.release_date)),
        shows: upcomingShows
          .filter((show) => show.first_air_date > now && show.poster_path)
          .slice(0, 6)
          .sort(byDate((show: TVShow) => show.first_air_date)),
      },
    };
  },
  ["discover-shelves"],
  { revalidate: 1800, tags: [CACHE_TAGS.FEATURED] },
);

/** Movies landing page shelves, laid out like the TV landing page. */
export const fetchMovieShelves = createOptimizedCache(
  async () => {
    const [nowPlaying, popular, topRated, upcoming] = await Promise.all([
      fetchFromTMDB<Movie>(TMDB_PATHS.moviesNowPlaying, { region: "US" }),
      fetchFromTMDB<Movie>(TMDB_PATHS.moviesPopular),
      fetchFromTMDB<Movie>(TMDB_PATHS.moviesTopRated),
      fetchFromTMDB<Movie>(TMDB_PATHS.moviesUpcoming, { region: "US" }),
    ]);
    const now = today();
    return {
      nowPlaying,
      popular,
      topRated,
      upcoming: upcoming.filter((movie) => movie.release_date > now),
    };
  },
  ["movie-shelves"],
  { revalidate: 1800, tags: [CACHE_TAGS.FEATURED, CACHE_TAGS.MOVIES] },
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
