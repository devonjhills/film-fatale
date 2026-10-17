import type { Metadata } from "next";
import { RotatingHeroSection } from "@/components/ui/rotating-hero-section";
import { MediaSection } from "@/components/shared/media-section";
import { fetchFeaturedTVShows } from "@/lib/data-fetching";

export const metadata: Metadata = {
  title: "TV Shows",
  description:
    "Discover TV series airing now, explore top-rated shows, browse cast and seasons, and find your next watch.",
  alternates: {
    canonical: "/tv",
  },
  openGraph: {
    title: "TV Shows",
    description:
      "Discover TV series airing now, explore top-rated shows, browse cast and seasons, and find your next watch.",
    url: "/tv",
  },
};

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

      <div className="site-container space-y-16 py-14 md:space-y-20 md:py-20">
        <MediaSection
          title="On the air"
          items={onTheAir}
          mediaType="tv"
          href="/tv/on-the-air"
          limit={16}
        />

        <MediaSection
          title="Top rated"
          items={topRated}
          mediaType="tv"
          href="/tv/top-rated"
          limit={16}
        />
      </div>
    </div>
  );
}
