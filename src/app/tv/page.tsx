import { RotatingHeroSection } from "@/components/ui/rotating-hero-section";
import { MediaSection } from "@/components/shared/media-section";
import { fetchFeaturedTVShows } from "@/lib/data-fetching";

export default async function TVPage() {
  const { onTheAir, topRated } = await fetchFeaturedTVShows();

  return (
    <div className="min-h-screen">
      {onTheAir.length > 0 && (
        <RotatingHeroSection
          items={onTheAir.slice(0, 5)}
          mediaType="tv"
        />
      )}

      <div className="site-container space-y-20 py-16 md:space-y-24 md:py-24">
        <MediaSection
          title="On The Air"
          items={onTheAir}
          mediaType="tv"
          href="/tv/on-the-air"
          limit={12}
          badge="Airing now"
        />

        <div className="editorial-rule opacity-70" />

        <MediaSection
          title="The Essential List"
          items={topRated}
          mediaType="tv"
          href="/tv/top-rated"
          limit={12}
          badge="The highest rated"
        />
      </div>
    </div>
  );
}
