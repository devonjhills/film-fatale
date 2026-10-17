import type { Metadata } from "next";
import { RotatingHeroSection } from "@/components/ui/rotating-hero-section";
import { MediaSection } from "@/components/shared/media-section";
import { fetchFeaturedMovies } from "@/lib/data-fetching";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default async function Home() {
  const { nowPlaying, topRated } = await fetchFeaturedMovies();

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
      {nowPlaying.length > 0 && (
        <RotatingHeroSection
          items={nowPlaying.slice(0, 5)}
          mediaType="movie"
        />
      )}

      <div className="site-container space-y-16 py-14 md:space-y-20 md:py-20">
        <MediaSection
          title="Now playing"
          items={nowPlaying}
          mediaType="movie"
          href="/movies/now-playing"
          limit={16}
        />

        <MediaSection
          title="Top rated"
          items={topRated}
          mediaType="movie"
          href="/movies/top-rated"
          limit={16}
        />
      </div>
    </div>
  );
}
