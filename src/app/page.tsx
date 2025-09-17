import { RotatingHeroSection } from "@/components/ui/rotating-hero-section";
import { MediaSection } from "@/components/shared/media-section";
import { fetchFeaturedMovies } from "@/lib/data-fetching";

export default async function Home() {
  const { nowPlaying, topRated } = await fetchFeaturedMovies();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      {nowPlaying.length > 0 && (
        <RotatingHeroSection
          items={nowPlaying.slice(0, 5)}
          mediaType="movie"
          className="mb-20"
        />
      )}

      {/* Content Sections */}
      <div className="container mx-auto px-4 space-y-24 pb-20">
        {/* Now Playing */}
        <section className="space-y-8">
          <MediaSection
            title="Now Playing"
            items={nowPlaying}
            mediaType="movie"
            href="/movies/now-playing"
            limit={12}
            badge="In Theaters"
          />
        </section>

        {/* Divider */}
        <div className="divider opacity-30" />

        {/* Top Rated */}
        <section className="space-y-8">
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
