import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { TVDetailsPage } from "@/components/tv/tv-details-page";
import { JsonLd } from "@/components/seo/json-ld";
import { fetchTMDBServer } from "@/lib/tmdb-server";
import type { TVShowDetails } from "@/lib/types";
import { API_CONFIG } from "@/lib/constants";
import {
  absoluteUrl,
  conciseDescription,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

interface TVPageProps {
  params: Promise<{
    id: string;
  }>;
}

const getTVDetails = cache(async (tvId: number) => {
  try {
    return await fetchTMDBServer<TVShowDetails>(`/tv/${tvId}`, {
      params: {
        language: API_CONFIG.language,
        append_to_response: API_CONFIG.append_to_response.tv,
      },
      next: { revalidate: 86400 },
    });
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params,
}: TVPageProps): Promise<Metadata> {
  const { id } = await params;
  const tvId = /^\d+$/.test(id) ? Number(id) : NaN;

  if (!Number.isSafeInteger(tvId) || tvId <= 0) {
    return {
      title: "TV Show Not Found",
      robots: { index: false, follow: false },
    };
  }

  const tvShow = await getTVDetails(tvId);
  if (!tvShow) {
    return {
      title: "TV Show Not Found",
      description: "The requested TV show could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const year = tvShow.first_air_date?.slice(0, 4);
  const title = `${tvShow.name}${year ? ` (${year})` : ""}`;
  const description = conciseDescription(
    tvShow.overview,
    `Explore ${tvShow.name}, including seasons, cast, ratings, trailers, and where to watch.`,
  );
  const socialImage = tvShow.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${tvShow.backdrop_path}`
    : tvShow.poster_path
      ? `https://image.tmdb.org/t/p/w780${tvShow.poster_path}`
      : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: `/tv/${tvId}`,
    },
    openGraph: {
      title,
      description,
      type: "video.tv_show",
      url: `/tv/${tvId}`,
      siteName: SITE_NAME,
      images: socialImage ? [{ url: socialImage, alt: tvShow.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: socialImage ? [socialImage] : undefined,
    },
  };
}

export default async function TVPage({ params }: TVPageProps) {
  const { id } = await params;
  const tvId = /^\d+$/.test(id) ? Number(id) : NaN;

  if (!Number.isSafeInteger(tvId) || tvId <= 0) {
    notFound();
  }

  const tvShow = await getTVDetails(tvId);
  const canonical = absoluteUrl(`/tv/${tvId}`);

  const structuredData = tvShow
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "TVSeries",
            "@id": `${canonical}#series`,
            url: canonical,
            name: tvShow.name,
            description: conciseDescription(
              tvShow.overview,
              `Details for ${tvShow.name}.`,
            ),
            image: tvShow.poster_path
              ? `https://image.tmdb.org/t/p/w780${tvShow.poster_path}`
              : undefined,
            datePublished: tvShow.first_air_date || undefined,
            genre: tvShow.genres?.map((genre) => genre.name),
            numberOfSeasons: tvShow.number_of_seasons,
            numberOfEpisodes: tvShow.number_of_episodes,
            creator: tvShow.created_by?.map((creator) => ({
              "@type": "Person",
              name: creator.name,
            })),
            aggregateRating:
              tvShow.vote_count > 0
                ? {
                    "@type": "AggregateRating",
                    ratingValue: tvShow.vote_average,
                    ratingCount: tvShow.vote_count,
                    bestRating: 10,
                    worstRating: 0,
                  }
                : undefined,
            isPartOf: { "@id": `${SITE_URL}/#website` },
          },
          {
            "@type": "BreadcrumbList",
            "@id": `${canonical}#breadcrumb`,
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: SITE_URL,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "TV Shows",
                item: absoluteUrl("/tv"),
              },
              {
                "@type": "ListItem",
                position: 3,
                name: tvShow.name,
                item: canonical,
              },
            ],
          },
        ],
      }
    : null;

  return (
    <>
      {structuredData && <JsonLd data={structuredData} />}
      <TVDetailsPage tvId={tvId} initialTVShow={tvShow || undefined} />
    </>
  );
}
