import { Metadata } from "next";
import { notFound } from "next/navigation";
import { MovieDetailsPage } from "@/components/movie/movie-details-page";
import { fetchTMDBServer } from "@/lib/tmdb-server";
import type { MovieDetails } from "@/lib/types";

interface MoviePageProps {
  params: Promise<{
    id: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: MoviePageProps): Promise<Metadata> {
  const { id } = await params;
  const movieId = parseInt(id);

  if (isNaN(movieId)) {
    return {
      title: "Movie Not Found",
    };
  }

  try {
    const movie = await fetchTMDBServer<MovieDetails>(
      `/movie/${movieId}`,
      { next: { revalidate: 86400 } },
    );
    const title = `${movie.title} (${new Date(movie.release_date).getFullYear()}) - FilmFatale`;
    const description =
      movie.overview ||
      `Discover ${movie.title}, a ${new Date(movie.release_date).getFullYear()} movie. View cast, crew, ratings, and more details.`;
    const posterUrl = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : null;

    return {
      title,
      description,
      alternates: {
        canonical: `/movie/${movieId}`,
      },
      keywords: [
        movie.title,
        "movie",
        "film",
        "cinema",
        "watch",
        "review",
        ...(movie.genres?.map((g: { name: string }) => g.name) || []),
      ],
      openGraph: {
        title,
        description,
        type: "video.movie",
        url: `/movie/${movieId}`,
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
      title: "Movie Not Found - FilmFatale",
      description: "The requested movie could not be found.",
    };
  }
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  const movieId = parseInt(id);

  if (isNaN(movieId)) {
    notFound();
  }

  return <MovieDetailsPage movieId={movieId} />;
}
