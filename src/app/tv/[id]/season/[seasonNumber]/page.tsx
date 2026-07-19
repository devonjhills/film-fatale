import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { TVSeasonDetailsPage } from "@/components/tv/tv-season-details-page";
import { fetchTMDBServer } from "@/lib/tmdb-server";
import type { TVSeasonDetails, TVShowDetails } from "@/lib/types";
import { API_CONFIG } from "@/lib/constants";
import { absoluteUrl, conciseDescription } from "@/lib/seo";

interface SeasonPageProps {
  params: Promise<{
    id: string;
    seasonNumber: string;
  }>;
}

const getSeasonSeoData = cache(async (tvId: number, seasonNumber: number) => {
  try {
    const [show, season] = await Promise.all([
      fetchTMDBServer<TVShowDetails>(`/tv/${tvId}`, {
        params: { language: API_CONFIG.language },
        next: { revalidate: 86400 },
      }),
      fetchTMDBServer<TVSeasonDetails>(
        `/tv/${tvId}/season/${seasonNumber}`,
        {
          params: { language: API_CONFIG.language },
          next: { revalidate: 86400 },
        },
      ),
    ]);
    return { show, season };
  } catch {
    return null;
  }
});

export default async function SeasonPage({ params }: SeasonPageProps) {
  const resolvedParams = await params;
  const tvId = /^\d+$/.test(resolvedParams.id)
    ? Number(resolvedParams.id)
    : NaN;
  const seasonNumber = /^\d+$/.test(resolvedParams.seasonNumber)
    ? Number(resolvedParams.seasonNumber)
    : NaN;

  if (
    !Number.isSafeInteger(tvId) ||
    tvId <= 0 ||
    !Number.isSafeInteger(seasonNumber) ||
    seasonNumber < 0
  ) {
    notFound();
  }

  const data = await getSeasonSeoData(tvId, seasonNumber);
  const canonical = absoluteUrl(`/tv/${tvId}/season/${seasonNumber}`);

  return (
    <>
      {data && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "TVSeason",
            "@id": `${canonical}#season`,
            url: canonical,
            name: `${data.show.name}: ${data.season.name}`,
            description: conciseDescription(
              data.season.overview,
              `Episodes and details for ${data.show.name} ${data.season.name}.`,
            ),
            image: data.season.poster_path
              ? `https://image.tmdb.org/t/p/w780${data.season.poster_path}`
              : undefined,
            seasonNumber: data.season.season_number,
            numberOfEpisodes: data.season.episodes.length,
            datePublished: data.season.air_date || undefined,
            partOfSeries: {
              "@type": "TVSeries",
              "@id": `${absoluteUrl(`/tv/${tvId}`)}#series`,
              name: data.show.name,
              url: absoluteUrl(`/tv/${tvId}`),
            },
          }}
        />
      )}
      <TVSeasonDetailsPage
        tvId={tvId}
        seasonNumber={seasonNumber}
        initialSeason={data?.season}
        initialTVShow={data?.show}
      />
    </>
  );
}

export async function generateMetadata({
  params,
}: SeasonPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const tvId = /^\d+$/.test(resolvedParams.id)
    ? Number(resolvedParams.id)
    : NaN;
  const seasonNumber = /^\d+$/.test(resolvedParams.seasonNumber)
    ? Number(resolvedParams.seasonNumber)
    : NaN;

  if (
    !Number.isSafeInteger(tvId) ||
    tvId <= 0 ||
    !Number.isSafeInteger(seasonNumber) ||
    seasonNumber < 0
  ) {
    return {
      title: "Season Not Found",
      robots: { index: false, follow: false },
    };
  }

  const data = await getSeasonSeoData(tvId, seasonNumber);
  if (!data) {
    return {
      title: "Season Not Found",
      robots: { index: false, follow: false },
    };
  }

  const title = `${data.show.name}: ${data.season.name}`;
  const description = conciseDescription(
    data.season.overview,
    `Browse episodes and details for ${data.show.name} ${data.season.name}.`,
  );
  const image = data.season.poster_path
    ? `https://image.tmdb.org/t/p/w780${data.season.poster_path}`
    : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: `/tv/${tvId}/season/${seasonNumber}`,
    },
    openGraph: {
      title,
      description,
      url: `/tv/${tvId}/season/${seasonNumber}`,
      type: "video.tv_show",
      images: image ? [{ url: image, alt: title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}
