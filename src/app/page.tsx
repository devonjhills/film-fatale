import { RotatingHeroSection } from "@/components/ui/rotating-hero-section";
import { FeaturedSection } from "@/components/ui/featured-section";
import { MediaSection } from "@/components/shared/media-section";
import { fetchFeaturedMovies } from "@/lib/data-fetching";

export default async function Home() {
  const { nowPlaying, popular, topRated, featured } =
    await fetchFeaturedMovies();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {featured.length > 0 && (
        <RotatingHeroSection
          items={featured}
          mediaType="movie"
          className="mb-16"
        />
      )}

      {/* Content Sections */}
      <div className="container mx-auto px-4 space-y-20 pb-16">
        {/* Now Playing */}
        <section>
          <MediaSection
            title="Now Playing"
            items={nowPlaying}
            mediaType="movie"
            href="/movies/now-playing"
            limit={12}
            badge="In Theaters"
          />
        </section>

        {/* Popular */}
        <section>
          <MediaSection
            title="Popular Movies"
            items={popular}
            mediaType="movie"
            href="/movies/popular"
            limit={12}
          />
        </section>

        {/* Top Rated */}
        <section>
          <MediaSection
            title="Top Rated"
            items={topRated}
            mediaType="movie"
            href="/movies/top-rated"
            limit={12}
            badge="Critics' Choice"
          />
        </section>
      </div>
    </div>
  );
}
