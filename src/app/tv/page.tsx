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

      <div className="site-container space-y-24 py-18 md:space-y-28 md:py-28">
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
