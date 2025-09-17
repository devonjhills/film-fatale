import { RotatingHeroSection } from "@/components/ui/rotating-hero-section";
import { MediaSection } from "@/components/shared/media-section";
import { fetchFeaturedMovies } from "@/lib/data-fetching";

export default async function Home() {
  const { nowPlaying, topRated } = await fetchFeaturedMovies();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {nowPlaying.length > 0 && (
        <RotatingHeroSection
          items={nowPlaying.slice(0, 5)}
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
