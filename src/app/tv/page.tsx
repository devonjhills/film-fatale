import { RotatingHeroSection } from "@/components/ui/rotating-hero-section";
import { MediaSection } from "@/components/shared/media-section";
import { fetchFeaturedTVShows } from "@/lib/data-fetching";

export default async function TVPage() {
  const { onTheAir, topRated } = await fetchFeaturedTVShows();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {onTheAir.length > 0 && (
        <RotatingHeroSection
          items={onTheAir.slice(0, 5)}
          mediaType="tv"
          className="mb-16"
        />
      )}

      {/* Content Sections */}
      <div className="container mx-auto px-4 space-y-20 pb-16">
        {/* On The Air */}
        <section>
          <MediaSection
            title="On The Air"
            items={onTheAir}
            mediaType="tv"
            href="/tv/on-the-air"
            limit={12}
            badge="Airing Now"
          />
        </section>

        {/* Top Rated */}
        <section>
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
