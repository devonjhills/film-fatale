import type { Metadata } from "next";
import { FeaturedPanel } from "@/components/shared/featured-panel";
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

      <div className="site-container space-y-5 py-6 md:space-y-6 md:py-8">
        <FeaturedPanel items={nowPlaying.slice(0, 5)} mediaType="movie" />
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
