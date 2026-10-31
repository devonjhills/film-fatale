import type { Metadata } from "next";
import { FeaturedHero } from "@/components/shared/featured-hero";
import { MediaSection } from "@/components/shared/media-section";
import { fetchHomeShelves } from "@/lib/data-fetching";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default async function Home() {
  const { trending, nowPlaying, popularTV, topRated } = await fetchHomeShelves();

  return (
    <div className="min-h-screen">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": `${SITE_URL}/#website`,
          url: SITE_URL,
          name: SITE_NAME,
          alternateName: "FilmFatale",
          description: SITE_DESCRIPTION,
          inLanguage: "en-US",
        }}
      />
      <FeaturedHero items={nowPlaying.slice(0, 5)} mediaType="movie" />

      <div className="site-container space-y-12 py-10 md:space-y-14 md:py-14">
        <MediaSection title="Trending this week" items={trending} mediaType="movie" />
        <MediaSection
          title="In theaters"
          items={nowPlaying}
          mediaType="movie"
          href="/movies/now-playing"
        />
        <MediaSection title="Popular on TV" items={popularTV} mediaType="tv" href="/tv/popular" />
        <MediaSection
          title="Top rated movies"
          items={topRated}
          mediaType="movie"
          href="/movies/top-rated"
        />
      </div>
    </div>
  );
}
