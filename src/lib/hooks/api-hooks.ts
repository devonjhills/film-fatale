"use client";

import useSWR from "swr";
import type {
  MovieDetails,
  TVShowDetails,
  TVSeasonDetails,
  PersonDetails,
  Movie,
  TVShow,
  Person,
  TMDBResponse,
  MultiSearchResult,
  TMDBError,
  WatchProvidersResponse,
  SearchResultItem,
} from "../types";
import { ENDPOINTS, API_CONFIG, SWR_CONFIG } from "../constants";
import { formatMovieResults } from "../api";

// Custom fetcher with error handling
const fetcher = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);

  if (!response.ok) {
    const errorData: TMDBError = await response.json().catch(() => ({
      status_code: response.status,
      status_message: response.statusText,
      success: false,
    }));

    throw new Error(errorData.status_message || `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
};

// Helper function to build query parameters
const buildQueryParams = (params: Record<string, unknown>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
};

// Category pages show 24 titles so every grid row is full (24 splits into
// 3, 4, 6 and 8 columns). TMDB serves 20 per page, so each site page reads
// from at most two TMDB pages.
export const CATEGORY_PAGE_SIZE = 24;
const TMDB_PAGE_SIZE = 20;
const TMDB_MAX_PAGE = 500;

const useCategoryList = <T extends { id: number }>(
  endpoint: string,
  page: number,
  params: Record<string, unknown>,
) => {
  const start = (page - 1) * CATEGORY_PAGE_SIZE;
  const firstTmdbPage = Math.floor(start / TMDB_PAGE_SIZE) + 1;
  const lastTmdbPage = Math.min(
    Math.floor((start + CATEGORY_PAGE_SIZE - 1) / TMDB_PAGE_SIZE) + 1,
    TMDB_MAX_PAGE,
  );
  const urls: string[] = [];
  for (let n = firstTmdbPage; n <= lastTmdbPage; n++) {
    urls.push(`${endpoint}?${buildQueryParams({ ...params, page: n })}`);
  }

  const { data, error, isLoading } = useSWR<TMDBResponse<T>[]>(
    urls,
    (keys: string[]) =>
      Promise.all(keys.map((url) => fetcher<TMDBResponse<T>>(url))),
    SWR_CONFIG,
  );

  // TMDB occasionally repeats a title across adjacent pages.
  const seen = new Set<number>();
  const offset = start - (firstTmdbPage - 1) * TMDB_PAGE_SIZE;
  const results = (data ?? [])
    .flatMap((response) => response.results ?? [])
    .slice(offset, offset + CATEGORY_PAGE_SIZE)
    .filter((item) => !seen.has(item.id) && seen.add(item.id));

  const first = data?.[0];
  const reachable = Math.min(
    first?.total_results ?? 0,
    (first?.total_pages ?? 0) * TMDB_PAGE_SIZE,
    TMDB_MAX_PAGE * TMDB_PAGE_SIZE,
  );

  return {
    results,
    totalPages: Math.ceil(reachable / CATEGORY_PAGE_SIZE),
    totalResults: reachable,
    isLoading,
    isError: error,
  };
};

// Movie API Hooks
export const useMovieDetails = (
  movieId: number,
  initialData?: MovieDetails,
) => {
  const queryParams = buildQueryParams({
    language: API_CONFIG.language,
    append_to_response: API_CONFIG.append_to_response.movie,
  });

  const { data, error, isLoading } = useSWR<MovieDetails>(
    movieId ? `${ENDPOINTS.movieDetails(movieId)}?${queryParams}` : null,
    fetcher<MovieDetails>,
    { ...SWR_CONFIG, fallbackData: initialData },
  );

  return {
    movie: data,
    isLoading,
    isError: error,
  };
};

export const usePopularMovies = (page: number = 1) => {
  const { results, ...rest } = useCategoryList<Movie>(
    ENDPOINTS.moviesPopular,
    page,
    { language: API_CONFIG.language, region: API_CONFIG.region },
  );

  return {
    movies: results.map(formatMovieResults),
    ...rest,
    currentPage: page,
  };
};

export const useTopRatedMovies = (page: number = 1) => {
  const { results, ...rest } = useCategoryList<Movie>(
    ENDPOINTS.moviesTopRated,
    page,
    { language: API_CONFIG.language, region: API_CONFIG.region },
  );

  return {
    movies: results.map(formatMovieResults),
    ...rest,
    currentPage: page,
  };
};

export const useNowPlayingMovies = (page: number = 1) => {
  const { results, ...rest } = useCategoryList<Movie>(
    ENDPOINTS.moviesNowPlaying,
    page,
    { language: API_CONFIG.language, region: API_CONFIG.region },
  );

  return {
    movies: results.map(formatMovieResults),
    ...rest,
    currentPage: page,
  };
};

// TV Show API Hooks
export const useTVDetails = (tvId: number, initialData?: TVShowDetails) => {
  const queryParams = buildQueryParams({
    language: API_CONFIG.language,
    append_to_response: API_CONFIG.append_to_response.tv,
  });

  const { data, error, isLoading } = useSWR<TVShowDetails>(
    tvId ? `${ENDPOINTS.tvDetails(tvId)}?${queryParams}` : null,
    fetcher<TVShowDetails>,
    { ...SWR_CONFIG, fallbackData: initialData },
  );

  return {
    tvShow: data,
    isLoading,
    isError: error,
  };
};

export const usePopularTVShows = (page: number = 1) => {
  const { results, ...rest } = useCategoryList<TVShow>(
    ENDPOINTS.tvPopular,
    page,
    { language: API_CONFIG.language },
  );

  return {
    tvShows: results,
    ...rest,
    currentPage: page,
  };
};

export const useTopRatedTVShows = (page: number = 1) => {
  const { results, ...rest } = useCategoryList<TVShow>(
    ENDPOINTS.tvTopRated,
    page,
    { language: API_CONFIG.language },
  );

  return {
    tvShows: results,
    ...rest,
    currentPage: page,
  };
};

export const useOnTheAirTVShows = (page: number = 1) => {
  const { results, ...rest } = useCategoryList<TVShow>(
    ENDPOINTS.tvOnTheAir,
    page,
    { language: API_CONFIG.language },
  );

  return {
    tvShows: results,
    ...rest,
    currentPage: page,
  };
};

// Person API Hooks
export const usePersonDetails = (
  personId: number,
  initialData?: PersonDetails,
) => {
  const queryParams = buildQueryParams({
    language: API_CONFIG.language,
    append_to_response: API_CONFIG.append_to_response.person,
  });

  const { data, error, isLoading } = useSWR<PersonDetails>(
    personId ? `${ENDPOINTS.personDetails(personId)}?${queryParams}` : null,
    fetcher<PersonDetails>,
    { ...SWR_CONFIG, fallbackData: initialData },
  );

  return {
    person: data,
    isLoading,
    isError: error,
  };
};

// Search API Hooks
export const useMultiSearch = (query: string) => {
  const queryParams = buildQueryParams({
    language: API_CONFIG.language,
    query,
    page: 1,
    include_adult: API_CONFIG.include_adult,
  });

  const { data, error, isLoading } = useSWR<TMDBResponse<SearchResultItem>>(
    query ? `${ENDPOINTS.searchMulti}?${queryParams}` : null,
    fetcher<TMDBResponse<SearchResultItem>>,
    {
      ...SWR_CONFIG,
      dedupingInterval: 2000, // Shorter deduping for search
    },
  );

  // Transform search results into categorized format
  const transformedResults: MultiSearchResult = {
    movieResults: [],
    tvResults: [],
    peopleResults: [],
  };

  if (data?.results) {
    data.results.forEach((result: SearchResultItem) => {
      if (result.media_type === "movie") {
        transformedResults.movieResults.push(result as Movie);
      } else if (result.media_type === "tv") {
        transformedResults.tvResults.push(result as TVShow);
      } else if (result.media_type === "person") {
        transformedResults.peopleResults.push(result as Person);
      }
    });
  }

  return {
    results: transformedResults,
    isLoading,
    isError: error,
  };
};

// Discover API Hooks
export const useDiscoverMovies = (params: {
  genre?: number;
  keyword?: number;
  sortBy?: string;
  page?: number;
}) => {
  const queryParams = buildQueryParams({
    language: API_CONFIG.language,
    region: API_CONFIG.region,
    sort_by: params.sortBy || "popularity.desc",
    page: params.page || 1,
    ...(params.genre && { with_genres: params.genre }),
    ...(params.keyword && { with_keywords: params.keyword }),
  });

  const { data, error, isLoading } = useSWR<TMDBResponse<Movie>>(
    `${ENDPOINTS.movieDiscover}?${queryParams}`,
    fetcher<TMDBResponse<Movie>>,
    SWR_CONFIG,
  );

  return {
    movies: data?.results?.map(formatMovieResults) || [],
    totalPages: data?.total_pages || 0,
    isLoading,
    isError: error,
  };
};

export const useDiscoverTVShows = (params: {
  genre?: number;
  keyword?: number;
  sortBy?: string;
  page?: number;
}) => {
  const queryParams = buildQueryParams({
    language: API_CONFIG.language,
    sort_by: params.sortBy || "popularity.desc",
    page: params.page || 1,
    ...(params.genre && { with_genres: params.genre }),
    ...(params.keyword && { with_keywords: params.keyword }),
  });

  const { data, error, isLoading } = useSWR<TMDBResponse<TVShow>>(
    `${ENDPOINTS.tvDiscover}?${queryParams}`,
    fetcher<TMDBResponse<TVShow>>,
    SWR_CONFIG,
  );

  return {
    tvShows: data?.results || [],
    totalPages: data?.total_pages || 0,
    isLoading,
    isError: error,
  };
};

// Watch Provider API Hooks
export const useMovieWatchProviders = (movieId: number) => {
  const { data, error, isLoading } = useSWR<WatchProvidersResponse>(
    movieId ? `${ENDPOINTS.movieWatchProviders(movieId)}` : null,
    fetcher<WatchProvidersResponse>,
    SWR_CONFIG,
  );

  return {
    watchProviders: data,
    isLoading,
    isError: error,
  };
};

export const useTVWatchProviders = (tvId: number) => {
  const { data, error, isLoading } = useSWR<WatchProvidersResponse>(
    tvId ? `${ENDPOINTS.tvWatchProviders(tvId)}` : null,
    fetcher<WatchProvidersResponse>,
    SWR_CONFIG,
  );

  return {
    watchProviders: data,
    isLoading,
    isError: error,
  };
};

export const useTVSeasonDetails = (
  tvId: number,
  seasonNumber: number,
  initialData?: TVSeasonDetails,
) => {
  const queryParams = buildQueryParams({
    language: API_CONFIG.language,
    append_to_response: API_CONFIG.append_to_response.tvSeason,
  });
  const { data, error, isLoading } = useSWR<TVSeasonDetails>(
    tvId && seasonNumber !== undefined
      ? `${ENDPOINTS.tvSeasonDetails(tvId, seasonNumber)}?${queryParams}`
      : null,
    fetcher<TVSeasonDetails>,
    { ...SWR_CONFIG, fallbackData: initialData },
  );
  return {
    season: data,
    isLoading,
    isError: error,
  };
};
