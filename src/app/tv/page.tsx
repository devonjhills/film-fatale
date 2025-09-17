import { RotatingHeroSection } from "@/components/ui/rotating-hero-section";
import { MediaSection } from "@/components/shared/media-section";
import { fetchFeaturedTVShows } from "@/lib/data-fetching";

export default async function TVPage() {
  const { onTheAir, topRated } = await fetchFeaturedTVShows();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      {onTheAir.length > 0 && (
        <RotatingHeroSection
          items={onTheAir.slice(0, 5)}
          mediaType="tv"
          className="mb-20"
        />
      )}

      {/* Content Sections */}
      <div className="container mx-auto px-4 space-y-24 pb-20">
        {/* On The Air */}
        <section className="space-y-8">
          <MediaSection
            title="On The Air"
            items={onTheAir}
            mediaType="tv"
            href="/tv/on-the-air"
            limit={12}
            badge="Airing Now"
          />
        </section>

        {/* Divider */}
        <div className="divider opacity-30" />

        {/* Top Rated */}
        <section className="space-y-8">
          <MediaSection
            title="Top Rated"
            items={topRated}
            mediaType="tv"
            href="/tv/top-rated"
            limit={12}
            badge="Critics' Choice"
          />
        </section>
      </div>
    </div>
  );
}
