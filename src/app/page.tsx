import { RotatingHeroSection } from "@/components/ui/rotating-hero-section";
import { FeaturedSection } from "@/components/ui/featured-section";
import { MediaSection } from "@/components/shared/media-section";
import { fetchFeaturedMovies } from "@/lib/data-fetching";

export default async function Home() {
  const { nowPlaying, popular, topRated, featured } =
    await fetchFeaturedMovies();

  return (
    <div className="min-h-screen">
      {/* Rotating Hero Section */}
      {featured.length > 0 && (
        <RotatingHeroSection
          items={featured}
          mediaType="movie"
          className="mb-8 sm:mb-12 md:mb-16"
        />
      )}

      {/* Movie Sections */}
      <div className="space-y-8 md:space-y-12 pb-8 md:pb-12">
        {/* Trending This Week - Featured Layout */}
        <section className="section-gradient-primary py-8 md:py-12">
          <div className="container mx-auto px-4">
            <FeaturedSection
              title="Trending This Week"
              items={popular}
              mediaType="movie"
              limit={6}
              showTrending={true}
              viewAllHref="/movies/popular"
            />
          </div>
        </section>

        {/* Now Playing */}
        <section className="py-6 md:py-8">
          <div className="container mx-auto px-4">
            <MediaSection
              title="Now Playing"
              items={nowPlaying}
              mediaType="movie"
              href="/movies/now-playing"
              limit={12}
              badge="In Theaters"
            />
          </div>
        </section>

        {/* Top Rated */}
        <section className="section-gradient-secondary py-8 md:py-12">
          <div className="container mx-auto px-4">
            <MediaSection
              title="Top Rated"
              items={topRated}
              mediaType="movie"
              href="/movies/top-rated"
              limit={12}
              badge="Critics' Choice"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
