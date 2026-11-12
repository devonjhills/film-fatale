import type { Metadata } from "next";
import { FeaturedPanel } from "@/components/shared/featured-panel";
import { MediaSection } from "@/components/shared/media-section";
import { fetchMovieShelves } from "@/lib/data-fetching";

const DESCRIPTION =
  "Movies in theaters now, the most popular and top rated films, and what's coming soon.";

export const metadata: Metadata = {
  title: "Movies",
  description: DESCRIPTION,
  alternates: { canonical: "/movies" },
  openGraph: { title: "Movies", description: DESCRIPTION, url: "/movies" },
};

export default async function MoviesPage() {
  const { nowPlaying, popular, topRated, upcoming } = await fetchMovieShelves();

  return (
    <div className="min-h-screen">
      <div className="site-container space-y-5 py-6 md:space-y-6 md:py-8">
        <FeaturedPanel items={nowPlaying.slice(0, 5)} mediaType="movie" />
        <MediaSection
          title="In theaters"
          items={nowPlaying}
          mediaType="movie"
          href="/movies/now-playing"
        />
        <MediaSection title="Popular movies" items={popular} mediaType="movie" href="/movies/popular" />
        <MediaSection title="Coming soon" items={upcoming} mediaType="movie" />
        <MediaSection
          title="Top rated movies"
          items={topRated}
          mediaType="movie"
          href="/movies/top-rated"
        />
      </div>
    </div>
  );
}
