// Base types for TMDB API responses
export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

// Genre type
export interface Genre {
  id: number;
  name: string;
}

// Production company
export interface ProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

// Production country
export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

// Spoken language
export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

// Movie types
export interface Movie {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

export interface MovieDetails extends Omit<Movie, "genre_ids"> {
  belongs_to_collection: {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
  } | null;
  budget: number;
  genres: Genre[];
  homepage: string;
  imdb_id: string | null;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  revenue: number;
  runtime: number | null;
  spoken_languages: SpokenLanguage[];
  status: string;
  tagline: string | null;
  videos?: VideoResponse;
  credits?: CreditsResponse;
  external_ids?: ExternalIds;
  recommendations?: TMDBResponse<Movie>;
  release_dates?: ReleaseDatesResponse;
  reviews?: ReviewsResponse;
  keywords?: KeywordsResponse;
}

// TV Show types
export interface TVShow {
  backdrop_path: string | null;
  first_air_date: string;
  genre_ids: number[];
  id: number;
  name: string;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  vote_average: number;
  vote_count: number;
}

export interface TVShowDetails extends Omit<TVShow, "genre_ids"> {
  created_by: {
    id: number;
    credit_id: string;
    name: string;
    gender: number;
    profile_path: string | null;
  }[];
  episode_run_time: number[];
  genres: Genre[];
  homepage: string;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  last_episode_to_air: {
    air_date: string;
    episode_number: number;
    id: number;
    name: string;
    overview: string;
    production_code: string;
    season_number: number;
    still_path: string | null;
    vote_average: number;
    vote_count: number;
  } | null;
  networks: {
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
  }[];
  next_episode_to_air: {
    air_date: string;
    episode_number: number;
    id: number;
    name: string;
    overview: string;
    production_code: string;
    season_number: number;
    still_path: string | null;
    vote_average: number;
    vote_count: number;
  } | null;
  number_of_episodes: number;
  number_of_seasons: number;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  seasons: {
    air_date: string;
    episode_count: number;
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    season_number: number;
  }[];
  spoken_languages: SpokenLanguage[];
  status: string;
  tagline: string;
  type: string;
  videos?: VideoResponse;
  credits?: CreditsResponse;
  aggregate_credits?: {
    cast: {
      adult: boolean;
      gender: number;
      id: number;
      known_for_department: string;
      name: string;
      order: number;
      original_name: string;
      popularity: number;
      profile_path: string | null;
      roles: {
        character: string;
        credit_id: string;
        episode_count: number;
      }[];
      total_episode_count: number;
    }[];
    crew: (CrewMember & {
      episode_count: number;
      total_episode_count: number;
    })[];
  };
  external_ids?: ExternalIds;
  recommendations?: TMDBResponse<TVShow>;
  reviews?: ReviewsResponse;
  keywords?: TVKeywordsResponse;
}

// Person types
export interface Person {
  adult: boolean;
  gender: number;
  id: number;
  known_for: (Movie | TVShow)[];
  known_for_department: string;
  name: string;
  popularity: number;
  profile_path: string | null;
}

export interface PersonDetails {
  adult: boolean;
  also_known_as: string[];
  biography: string;
  birthday: string | null;
  deathday: string | null;
  gender: number;
  homepage: string | null;
  id: number;
  imdb_id: string;
  known_for_department: string;
  name: string;
  place_of_birth: string | null;
  popularity: number;
  profile_path: string | null;
  combined_credits?: CombinedCredits;
  external_ids?: ExternalIds;
  images?: PersonImages;
}

// Cast and crew types
export interface CastMember {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  cast_id: number;
  character: string;
  credit_id: string;
  order: number;
}

export interface CrewMember {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  credit_id: string;
  department: string;
  job: string;
}

export interface CreditsResponse {
  id: number;
  cast: CastMember[];
  crew: CrewMember[];
}

// Video types
export interface Video {
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  key: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
  id: string;
}

export interface VideoResponse {
  id: number;
  results: Video[];
}

// External IDs
export interface ExternalIds {
  imdb_id: string | null;
  facebook_id: string | null;
  instagram_id: string | null;
  twitter_id: string | null;
  id: number;
}

// Release dates
export interface ReleaseDate {
  certification: string;
  iso_639_1: string;
  note: string;
  release_date: string;
  type: number;
}

export interface ReleaseDatesResponse {
  id: number;
  results: {
    iso_3166_1: string;
    release_dates: ReleaseDate[];
  }[];
}

// Reviews
export interface Review {
  author: string;
  author_details: {
    name: string;
    username: string;
    avatar_path: string | null;
    rating: number | null;
  };
  content: string;
  created_at: string;
  id: string;
  updated_at: string;
  url: string;
}

export interface ReviewsResponse {
  id: number;
  page: number;
  results: Review[];
  total_pages: number;
  total_results: number;
}

// Keywords
export interface Keyword {
  id: number;
  name: string;
}

export interface KeywordsResponse {
  id: number;
  keywords: Keyword[];
}

export interface TVKeywordsResponse {
  id: number;
  results: Keyword[];
}

// TV Season types
export interface TVSeason {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
}

export interface TVEpisode {
  air_date: string;
  episode_number: number;
  id: number;
  name: string;
  overview: string;
  production_code: string;
  runtime: number;
  season_number: number;
  show_id: number;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
  crew: CrewMember[];
  guest_stars: (CastMember & { episode_count?: number })[];
}

export interface TVSeasonDetails extends TVSeason {
  episodes: TVEpisode[];
  credits?: {
    cast: (CastMember & { episode_count: number })[];
    crew: CrewMember[];
  };
  external_ids?: ExternalIds;
  images?: {
    posters: {
      aspect_ratio: number;
      height: number;
      iso_639_1: string | null;
      file_path: string;
      vote_average: number;
      vote_count: number;
      width: number;
    }[];
  };
  videos?: VideoResponse;
}

// Combined credits for person
export interface CombinedCredits {
  cast: (Movie &
    TVShow & {
      character: string;
      credit_id: string;
      order?: number;
      media_type: "movie" | "tv";
    })[];
  crew: (Movie &
    TVShow & {
      credit_id: string;
      department: string;
      job: string;
      media_type: "movie" | "tv";
    })[];
  id: number;
}

// Person images
export interface PersonImages {
  id: number;
  profiles: {
    aspect_ratio: number;
    file_path: string;
    height: number;
    iso_639_1: string | null;
    vote_average: number;
    vote_count: number;
    width: number;
  }[];
}

// Multi-search results
export interface MultiSearchResult {
  movieResults: Movie[];
  tvResults: TVShow[];
  peopleResults: Person[];
}

// Search result item with media type
export interface SearchResultItem
  extends Partial<Movie>,
    Partial<TVShow>,
    Partial<Person> {
  media_type: "movie" | "tv" | "person";
}

// Formatted movie result
export interface FormattedMovie {
  id: number;
  release_date: string;
  title: string;
  vote_average: number;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  poster: string;
}

// Image URL helpers type
export type ImageSize =
  | "w92"
  | "w154"
  | "w185"
  | "w300"
  | "w500"
  | "w780"
  | "original";

// Error types
export interface TMDBError {
  status_code: number;
  status_message: string;
  success: boolean;
}

// Union types for components
export type MovieOrTVShow = Movie | TVShow;
export type MovieDetailsOrTVShowDetails = MovieDetails | TVShowDetails;

// Type guards
export function isMovie(item: MovieOrTVShow): item is Movie {
  return "title" in item && "release_date" in item;
}

export function isTVShow(item: MovieOrTVShow): item is TVShow {
  return "name" in item && "first_air_date" in item;
}

export function isMovieDetails(
  item: MovieDetailsOrTVShowDetails,
): item is MovieDetails {
  return "title" in item && "release_date" in item;
}

export function isTVShowDetails(
  item: MovieDetailsOrTVShowDetails,
): item is TVShowDetails {
  return "name" in item && "first_air_date" in item;
}

// Watch Provider types (JustWatch integration)
export interface WatchProvider {
  display_priority: number;
  logo_path: string;
  provider_id: number;
  provider_name: string;
}

export interface WatchProviderRegion {
  buy?: WatchProvider[];
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  ads?: WatchProvider[];
  link: string;
}

export interface WatchProvidersResponse {
  id: number;
  results: {
    [countryCode: string]: WatchProviderRegion;
  };
}

// Viewing History types
export type WatchStatus = "watching" | "completed" | "plan_to_watch";

export interface ViewingHistoryItem {
  id: string;
  user_id: string;
  tmdb_id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  status: WatchStatus;
  started_at: string | null;
  completed_at: string | null;
  last_watched_at: string | null;
  notes: string | null;
  rating: number | null; // User's personal rating (1-10)
  created_at: string;
  updated_at: string;
  episode_progress?: TVShowProgress | null; // Episode progress for TV shows
}

export interface ViewingHistoryResponse {
  items: ViewingHistoryItem[];
  total: number;
}

// TV Episode Tracking
export interface EpisodeProgress {
  id: string;
  user_id: string;
  tmdb_id: number; // TV show ID
  season_number: number;
  episode_number: number;
  watched: boolean;
  watched_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SeasonProgress {
  season_number: number;
  total_episodes: number;
  watched_episodes: number;
  completion_percentage: number;
}

export interface TVShowProgress {
  tmdb_id: number;
  total_seasons: number;
  total_episodes: number;
  watched_episodes: number;
  completion_percentage: number;
  seasons: SeasonProgress[];
  next_episode?: {
    season_number: number;
    episode_number: number;
  };
}

// Watch Sessions (for tracking multiple viewings)
export interface WatchSession {
  id: string;
  user_id: string;
  tmdb_id: number;
  media_type: "movie" | "tv";
  season_number?: number;
  episode_number?: number;
  watched_at: string;
  rating: number | null;
  notes: string | null;
  created_at: string;
}

export interface WatchSessionsResponse {
  sessions: WatchSession[];
  total: number;
}

// Calendar View Data
export interface CalendarDay {
  date: string;
  watchedItems: {
    tmdb_id: number;
    media_type: "movie" | "tv";
    title: string;
    poster_path: string | null;
    session_count: number;
  }[];
}

export interface CalendarMonth {
  year: number;
  month: number;
  days: CalendarDay[];
}

// Statistics
export interface ViewingStats {
  total_movies_watched: number;
  total_tv_shows_watched: number;
  total_episodes_watched: number;
  total_watch_time_minutes: number;
  average_rating: number;
  most_watched_genre: string;
  completion_rate: number;
  monthly_activity: {
    month: string;
    count: number;
  }[];
}
