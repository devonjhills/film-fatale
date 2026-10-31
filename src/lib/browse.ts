import "server-only";

import { API_CONFIG, GENRE_NAMES, TMDB_PATHS } from "./constants";
import { fetchTMDBServer } from "./tmdb-server";
import type { Movie, TMDBResponse, TVShow } from "./types";

export type MediaType = "movie" | "tv";

export interface BrowseList {
  slug: string;
  label: string;
  title: string;
  description: string;
  /** TMDB list endpoint, used when no filter is set. */
  path: string;
  /** Lists of what is out right now can't be narrowed by decade. */
  current?: boolean;
  /** Discover parameters that reproduce the list when filters are set. */
  discover: () => Record<string, string | number>;
}

const isoDate = (offsetDays: number) =>
  new Date(Date.now() + offsetDays * 86_400_000).toISOString().slice(0, 10);

export const BROWSE_LISTS: Record<MediaType, BrowseList[]> = {
  movie: [
    {
      slug: "now-playing",
      label: "In theaters",
      title: "In theaters",
      description: "Movies playing in US theaters now.",
      path: TMDB_PATHS.moviesNowPlaying,
      current: true,
      discover: () => ({
        sort_by: "popularity.desc",
        with_release_type: "2|3",
        "release_date.gte": isoDate(-42),
        "release_date.lte": isoDate(0),
      }),
    },
    {
      slug: "popular",
      label: "Popular",
      title: "Popular movies",
      description: "The movies people are looking up most this week.",
      path: TMDB_PATHS.moviesPopular,
      discover: () => ({ sort_by: "popularity.desc" }),
    },
    {
      slug: "top-rated",
      label: "Top rated",
      title: "Top rated movies",
      description: "The highest rated movies on TMDB.",
      path: TMDB_PATHS.moviesTopRated,
      discover: () => ({ sort_by: "vote_average.desc", "vote_count.gte": 300 }),
    },
  ],
  tv: [
    {
      slug: "on-the-air",
      label: "On the air",
      title: "On the air",
      description: "Shows with new episodes this week.",
      path: TMDB_PATHS.tvOnTheAir,
      current: true,
      discover: () => ({
        sort_by: "popularity.desc",
        "air_date.gte": isoDate(0),
        "air_date.lte": isoDate(7),
      }),
    },
    {
      slug: "popular",
      label: "Popular",
      title: "Popular shows",
      description: "The shows people are looking up most this week.",
      path: TMDB_PATHS.tvPopular,
      discover: () => ({ sort_by: "popularity.desc" }),
    },
    {
      slug: "top-rated",
      label: "Top rated",
      title: "Top rated shows",
      description: "The highest rated shows on TMDB.",
      path: TMDB_PATHS.tvTopRated,
      discover: () => ({ sort_by: "vote_average.desc", "vote_count.gte": 200 }),
    },
  ],
};

export const listHref = (media: MediaType, slug: string) =>
  media === "movie" ? `/movies/${slug}` : `/tv/${slug}`;

export function getBrowseList(media: MediaType, slug: string): BrowseList {
  const list = BROWSE_LISTS[media].find((entry) => entry.slug === slug);
  if (!list) throw new Error(`Unknown ${media} list: ${slug}`);
  return list;
}

export function genreOptions(media: MediaType) {
  return Object.entries(GENRE_NAMES[media])
    .map(([id, name]) => ({ id: Number(id), name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

const FIRST_DECADE = 1920;
export function decadeOptions() {
  const decades: number[] = [];
  for (let decade = Math.floor(new Date().getFullYear() / 10) * 10; decade >= FIRST_DECADE; decade -= 10) {
    decades.push(decade);
  }
  return decades;
}

export interface BrowseFilters {
  page: number;
  genre?: number;
  decade?: number;
}

type SearchParams = Record<string, string | string[] | undefined>;

const positiveInt = (value: string | string[] | undefined) => {
  const parsed = typeof value === "string" && /^\d+$/.test(value) ? Number(value) : NaN;
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
};

/** Reads ?page, ?genre and ?decade, dropping anything that isn't valid for the list. */
export function parseBrowseFilters(media: MediaType, list: BrowseList, params: SearchParams): BrowseFilters {
  const genre = positiveInt(params.genre);
  const decade = positiveInt(params.decade);
  return {
    page: positiveInt(params.page) ?? 1,
    genre: genre && genre in GENRE_NAMES[media] ? genre : undefined,
    decade: !list.current && decade && decadeOptions().includes(decade) ? decade : undefined,
  };
}

/** Builds a list URL, leaving out defaults so plain lists keep clean URLs. */
export function browseHref(
  media: MediaType,
  slug: string,
  { page, genre, decade }: Partial<BrowseFilters>,
) {
  const params = new URLSearchParams();
  if (genre) params.set("genre", String(genre));
  if (decade) params.set("decade", String(decade));
  if (page && page > 1) params.set("page", String(page));
  const query = params.toString();
  return `${listHref(media, slug)}${query ? `?${query}` : ""}`;
}

// Site pages show 24 titles so every grid row is full (24 splits into 3, 4,
// 6 and 8 columns). TMDB serves 20 per page, so each site page reads from at
// most two TMDB pages. TMDB stops at page 500.
export const BROWSE_PAGE_SIZE = 24;
const TMDB_PAGE_SIZE = 20;
const TMDB_MAX_PAGE = 500;

export interface BrowsePage<T> {
  items: T[];
  totalPages: number;
  totalResults: number;
}

export async function fetchBrowsePage(
  media: MediaType,
  list: BrowseList,
  { page, genre, decade }: BrowseFilters,
): Promise<BrowsePage<Movie | TVShow>> {
  const filtered = Boolean(genre || decade);
  const dateField = media === "movie" ? "primary_release_date" : "first_air_date";
  const params: Record<string, string | number | boolean> = {
    language: API_CONFIG.language,
    ...(media === "movie" && { region: API_CONFIG.region }),
    ...(filtered && {
      include_adult: false,
      ...list.discover(),
      ...(genre && { with_genres: genre }),
      ...(decade && {
        [`${dateField}.gte`]: `${decade}-01-01`,
        [`${dateField}.lte`]: `${decade + 9}-12-31`,
      }),
    }),
  };
  const path = filtered
    ? media === "movie"
      ? TMDB_PATHS.movieDiscover
      : TMDB_PATHS.tvDiscover
    : list.path;

  const start = (page - 1) * BROWSE_PAGE_SIZE;
  const firstTmdbPage = Math.floor(start / TMDB_PAGE_SIZE) + 1;
  const lastTmdbPage = Math.floor((start + BROWSE_PAGE_SIZE - 1) / TMDB_PAGE_SIZE) + 1;
  const tmdbPages: number[] = [];
  for (let n = firstTmdbPage; n <= Math.min(lastTmdbPage, TMDB_MAX_PAGE); n++) tmdbPages.push(n);

  const responses = await Promise.all(
    tmdbPages.map((n) =>
      fetchTMDBServer<TMDBResponse<Movie | TVShow>>(path, {
        params: { ...params, page: n },
        next: { revalidate: 3600 },
      }),
    ),
  );

  // TMDB occasionally repeats a title across adjacent pages.
  const seen = new Set<number>();
  const offset = start - (firstTmdbPage - 1) * TMDB_PAGE_SIZE;
  const items = responses
    .flatMap((response) => response.results ?? [])
    .slice(offset, offset + BROWSE_PAGE_SIZE)
    .filter((item) => !seen.has(item.id) && seen.add(item.id));

  const first = responses[0];
  const reachable = Math.min(
    first?.total_results ?? 0,
    (first?.total_pages ?? 0) * TMDB_PAGE_SIZE,
    TMDB_MAX_PAGE * TMDB_PAGE_SIZE,
  );

  return {
    items,
    totalPages: Math.ceil(reachable / BROWSE_PAGE_SIZE),
    totalResults: reachable,
  };
}
