import type { Metadata } from "next";
import { TrendingSpotlight } from "@/components/discover/trending-spotlight";
import { UpNextShelf } from "@/components/discover/up-next-shelf";
import { NewReleases } from "@/components/discover/new-releases";
import { ComingSoon } from "@/components/discover/coming-soon";
import { MediaSection } from "@/components/shared/media-section";
import { fetchDiscoverShelves } from "@/lib/data-fetching";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

const dateline = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  timeZone: "America/New_York",
});

export default async function Home() {
  const { trending, nowPlaying, newStreaming, newShows, comingSoon } = await fetchDiscoverShelves();

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

      <header className="site-container pt-8 md:pt-10">
        <p className="text-ui font-semibold text-violet">
          <time dateTime={new Date().toISOString().slice(0, 10)}>{dateline.format(new Date())}</time>
        </p>
        <h1 className="page-title mt-1.5">Discover</h1>
        <p className="page-lede mt-2">What&apos;s new in film and TV, and what&apos;s coming next.</p>
      </header>

      <div className="site-container space-y-5 py-6 md:space-y-6 md:py-8">
        <UpNextShelf />
        <TrendingSpotlight items={trending.slice(0, 8)} />
        <NewReleases theaters={nowPlaying} streaming={newStreaming} tv={newShows} />
        <ComingSoon movies={comingSoon.movies} shows={comingSoon.shows} />
        <MediaSection
          title="More trending today"
          items={trending.slice(8)}
          mediaType="movie"
        />
      </div>
    </div>
  );
}
