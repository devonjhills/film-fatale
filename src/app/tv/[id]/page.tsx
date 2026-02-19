import { Metadata } from "next";
import { notFound } from "next/navigation";
import { TVDetailsPage } from "@/components/tv/tv-details-page";

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
    const API_KEY = process.env.NEXT_PUBLIC_MOVIE_API_KEY;
    if (!API_KEY) {
      throw new Error("API key not configured");
    }

    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${tvId}?api_key=${API_KEY}`,
      { next: { revalidate: 86400 } }, // Cache for 24 hours
    );

    if (!response.ok) {
      throw new Error("TV show not found");
    }

    const tvShow = await response.json();
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
