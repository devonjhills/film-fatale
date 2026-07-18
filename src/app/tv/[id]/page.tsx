import { Metadata } from "next";
import { notFound } from "next/navigation";
import { TVDetailsPage } from "@/components/tv/tv-details-page";
import { fetchTMDBServer } from "@/lib/tmdb-server";
import type { TVShowDetails } from "@/lib/types";

interface TVPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: TVPageProps): Promise<Metadata> {
  const { id } = await params;
  const tvId = parseInt(id);

  if (isNaN(tvId)) {
    return {
      title: "TV Show Not Found",
    };
  }

  try {
    const tvShow = await fetchTMDBServer<TVShowDetails>(
      `/tv/${tvId}`,
      { next: { revalidate: 86400 } },
    );
    const year = tvShow.first_air_date
      ? new Date(tvShow.first_air_date).getFullYear()
      : "";
    const title = `${tvShow.name} ${year ? `(${year})` : ""} - FilmFatale`;
    const description =
      tvShow.overview ||
      `Discover ${tvShow.name}, ${year ? `a ${year} ` : ""}TV series. View cast, crew, episodes, ratings, and more details.`;
    const posterUrl = tvShow.poster_path
      ? `https://image.tmdb.org/t/p/w500${tvShow.poster_path}`
      : null;

    return {
      title,
      description,
      alternates: {
        canonical: `/tv/${tvId}`,
      },
      keywords: [
        tvShow.name,
        "TV show",
        "television",
        "series",
        "watch",
        "stream",
        "episodes",
        ...(tvShow.genres?.map((g: { name: string }) => g.name) || []),
      ],
      openGraph: {
        title,
        description,
        type: "video.tv_show",
        url: `/tv/${tvId}`,
        images: posterUrl ? [posterUrl] : [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: posterUrl ? [posterUrl] : [],
      },
    };
  } catch {
    return {
      title: "TV Show Not Found - FilmFatale",
      description: "The requested TV show could not be found.",
    };
  }
}

export default async function TVPage({ params }: TVPageProps) {
  const { id } = await params;
  const tvId = parseInt(id);

  if (isNaN(tvId)) {
    notFound();
  }

  return <TVDetailsPage tvId={tvId} />;
}
