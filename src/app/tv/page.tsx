import type { Metadata } from "next";
import { FeaturedHero } from "@/components/shared/featured-hero";
import { MediaSection } from "@/components/shared/media-section";
import { fetchTVShelves } from "@/lib/data-fetching";

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
  const { onTheAir, popular, topRated } = await fetchTVShelves();

  return (
    <div className="min-h-screen">
      <FeaturedHero items={onTheAir.slice(0, 5)} mediaType="tv" />

      <div className="site-container space-y-12 py-10 md:space-y-14 md:py-14">
        <MediaSection title="On the air" items={onTheAir} mediaType="tv" href="/tv/on-the-air" />
        <MediaSection title="Popular shows" items={popular} mediaType="tv" href="/tv/popular" />
        <MediaSection title="Top rated shows" items={topRated} mediaType="tv" href="/tv/top-rated" />
      </div>
    </div>
  );
}
