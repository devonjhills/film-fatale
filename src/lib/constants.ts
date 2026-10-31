// TMDB API Base Configuration
export const TMDB_API_BASE_URL = "/api/tmdb";
export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export const TMDB_PATHS = {
  movieDetails: (id: number) => `/movie/${id}`,
  moviesNowPlaying: "/movie/now_playing",
  moviesPopular: "/movie/popular",
  moviesTopRated: "/movie/top_rated",
  movieDiscover: "/discover/movie",
  movieWatchProviders: (id: number) => `/movie/${id}/watch/providers`,
  tvDetails: (id: number) => `/tv/${id}`,
  tvSeasonDetails: (tvId: number, seasonNumber: number) =>
    `/tv/${tvId}/season/${seasonNumber}`,
  tvOnTheAir: "/tv/on_the_air",
  tvPopular: "/tv/popular",
  tvTopRated: "/tv/top_rated",
  tvDiscover: "/discover/tv",
  tvWatchProviders: (id: number) => `/tv/${id}/watch/providers`,
  personDetails: (id: number) => `/person/${id}`,
  searchMulti: "/search/multi",
  trendingWeek: "/trending/all/week",
} as const;

// API Endpoints
export const ENDPOINTS = {
  // Movie endpoints
  movieDetails: (id: number) => `${TMDB_API_BASE_URL}${TMDB_PATHS.movieDetails(id)}`,
  moviesNowPlaying: `${TMDB_API_BASE_URL}${TMDB_PATHS.moviesNowPlaying}`,
  moviesPopular: `${TMDB_API_BASE_URL}${TMDB_PATHS.moviesPopular}`,
  moviesTopRated: `${TMDB_API_BASE_URL}${TMDB_PATHS.moviesTopRated}`,
  movieDiscover: `${TMDB_API_BASE_URL}${TMDB_PATHS.movieDiscover}`,
  movieWatchProviders: (id: number) =>
    `${TMDB_API_BASE_URL}${TMDB_PATHS.movieWatchProviders(id)}`,

  // TV endpoints
  tvDetails: (id: number) => `${TMDB_API_BASE_URL}${TMDB_PATHS.tvDetails(id)}`,
  tvSeasonDetails: (tvId: number, seasonNumber: number) =>
    `${TMDB_API_BASE_URL}${TMDB_PATHS.tvSeasonDetails(tvId, seasonNumber)}`,
  tvOnTheAir: `${TMDB_API_BASE_URL}${TMDB_PATHS.tvOnTheAir}`,
  tvPopular: `${TMDB_API_BASE_URL}${TMDB_PATHS.tvPopular}`,
  tvTopRated: `${TMDB_API_BASE_URL}${TMDB_PATHS.tvTopRated}`,
  tvDiscover: `${TMDB_API_BASE_URL}${TMDB_PATHS.tvDiscover}`,
  tvWatchProviders: (id: number) => `${TMDB_API_BASE_URL}${TMDB_PATHS.tvWatchProviders(id)}`,

  // Person endpoints
  personDetails: (id: number) => `${TMDB_API_BASE_URL}${TMDB_PATHS.personDetails(id)}`,

  // Search endpoints
  searchMulti: `${TMDB_API_BASE_URL}${TMDB_PATHS.searchMulti}`,
} as const;

// Image URL builders - Optimized sizes for responsive design
export const IMAGE_URLS = {
  // Poster sizes - optimized for different viewports
  poster: {
    w92: (path: string) => `${TMDB_IMAGE_BASE_URL}/w92${path}`, // Thumbnail/small cards
    w154: (path: string) => `${TMDB_IMAGE_BASE_URL}/w154${path}`, // Mobile cards
    w185: (path: string) => `${TMDB_IMAGE_BASE_URL}/w185${path}`, // Default card size
    w342: (path: string) => `${TMDB_IMAGE_BASE_URL}/w342${path}`, // Large cards/hero
    w500: (path: string) => `${TMDB_IMAGE_BASE_URL}/w500${path}`, // Detail pages
    w780: (path: string) => `${TMDB_IMAGE_BASE_URL}/w780${path}`, // High-res displays
    original: (path: string) => `${TMDB_IMAGE_BASE_URL}/original${path}`, // Maximum quality
  },

  // Backdrop sizes - optimized for different screen sizes
  backdrop: {
    w300: (path: string) => `${TMDB_IMAGE_BASE_URL}/w300${path}`, // Mobile backdrops
    w780: (path: string) => `${TMDB_IMAGE_BASE_URL}/w780${path}`, // Tablet/desktop
    w1280: (path: string) => `${TMDB_IMAGE_BASE_URL}/w1280${path}`, // Large screens
    original: (path: string) => `${TMDB_IMAGE_BASE_URL}/original${path}`, // 4K displays
  },

  // Profile sizes (for person images)
  profile: {
    w45: (path: string) => `${TMDB_IMAGE_BASE_URL}/w45${path}`, // Tiny avatars
    w185: (path: string) => `${TMDB_IMAGE_BASE_URL}/w185${path}`, // Person cards
    h632: (path: string) => `${TMDB_IMAGE_BASE_URL}/h632${path}`, // Person details
    original: (path: string) => `${TMDB_IMAGE_BASE_URL}/original${path}`, // High quality
  },

  // Logo sizes
  logo: {
    w45: (path: string) => `${TMDB_IMAGE_BASE_URL}/w45${path}`, // Small icons
    w92: (path: string) => `${TMDB_IMAGE_BASE_URL}/w92${path}`, // Medium icons
    w154: (path: string) => `${TMDB_IMAGE_BASE_URL}/w154${path}`, // Large icons
    w300: (path: string) => `${TMDB_IMAGE_BASE_URL}/w300${path}`, // Extra large
    original: (path: string) => `${TMDB_IMAGE_BASE_URL}/original${path}`, // Vector quality
  },
} as const;

// API Configuration
export const API_CONFIG = {
  language: "en-US",
  region: "US",
  include_adult: false,
  append_to_response: {
    movie:
      "videos,credits,external_ids,recommendations,release_dates,reviews",
    tv: "videos,credits,aggregate_credits,external_ids,recommendations,reviews",
    tvSeason: "credits,external_ids,images,videos",
    person: "combined_credits,external_ids,images",
  },
} as const;

// SWR Configuration
export const SWR_CONFIG = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  refreshInterval: 0,
  dedupingInterval: 60000, // 1 minute
  errorRetryCount: 3,
  errorRetryInterval: 5000, // 5 seconds
} as const;

// Genre ID to name mappings
export const GENRE_NAMES = {
  movie: {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Sci-Fi",
    53: "Thriller",
    10752: "War",
    37: "Western",
  },
  tv: {
    10759: "Action & Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    10762: "Kids",
    9648: "Mystery",
    10763: "News",
    10764: "Reality",
    10765: "Sci-Fi & Fantasy",
    10766: "Soap",
    10767: "Talk",
    10768: "War & Politics",
    37: "Western",
  },
} as const;
