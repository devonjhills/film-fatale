import { MetadataRoute } from "next";
import { fetchFeaturedMovies, fetchFeaturedTVShows } from "@/lib/data-fetching";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.filmfatale.app";

  // Static pages
  const staticPages = [
    "",
    "/search",
    "/about",
    "/privacy",
    "/terms",
    "/movies/popular",
    "/movies/top-rated",
    "/movies/now-playing",
    "/tv/popular",
    "/tv/top-rated",
    "/tv/on-the-air",
  ];

  const staticUrls = staticPages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: page === "" ? 1 : 0.8,
  }));

  try {
    // Fetch dynamic content for sitemap
    const { popular: popularMovies } = await fetchFeaturedMovies();
    const { popular: popularTVShows } = await fetchFeaturedTVShows();

    const movieUrls = popularMovies.slice(0, 100).map((movie) => ({
      url: `${baseUrl}/movie/${movie.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    const tvUrls = popularTVShows.slice(0, 100).map((show) => ({
      url: `${baseUrl}/tv/${show.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticUrls, ...movieUrls, ...tvUrls];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return staticUrls;
  }
}
