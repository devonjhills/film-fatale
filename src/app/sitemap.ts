import type { MetadataRoute } from "next";
import { fetchMovies, fetchTVShows } from "@/lib/data-fetching";
import { SITE_URL } from "@/lib/seo";
import { TMDB_PATHS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/movies/now-playing`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/movies/popular`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/movies/top-rated`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/tv`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/tv/on-the-air`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/tv/popular`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/tv/top-rated`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const [nowPlaying, popularMovies, topRatedMovies, onTheAir, popularTV, topRatedTV] =
    await Promise.all([
      fetchMovies(TMDB_PATHS.moviesNowPlaying),
      fetchMovies(TMDB_PATHS.moviesPopular),
      fetchMovies(TMDB_PATHS.moviesTopRated),
      fetchTVShows(TMDB_PATHS.tvOnTheAir),
      fetchTVShows(TMDB_PATHS.tvPopular),
      fetchTVShows(TMDB_PATHS.tvTopRated),
    ]);

  const movies = new Map(
    [...nowPlaying, ...popularMovies, ...topRatedMovies].map((movie) => [
      movie.id,
      movie,
    ]),
  );
  const tvShows = new Map(
    [...onTheAir, ...popularTV, ...topRatedTV].map((show) => [show.id, show]),
  );

  return [
    ...staticRoutes,
    ...Array.from(movies.values()).map((movie) => ({
      url: `${SITE_URL}/movie/${movie.id}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      images: movie.poster_path
        ? [`https://image.tmdb.org/t/p/w780${movie.poster_path}`]
        : undefined,
    })),
    ...Array.from(tvShows.values()).map((show) => ({
      url: `${SITE_URL}/tv/${show.id}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      images: show.poster_path
        ? [`https://image.tmdb.org/t/p/w780${show.poster_path}`]
        : undefined,
    })),
  ];
}
