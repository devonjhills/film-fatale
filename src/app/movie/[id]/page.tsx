import { Metadata } from "next";
import { notFound } from "next/navigation";
import { MovieDetailsPage } from "@/components/movie/movie-details-page";

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
    const API_KEY = process.env.NEXT_PUBLIC_MOVIE_API_KEY;
    if (!API_KEY) {
      throw new Error("API key not configured");
    }

    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`,
      { next: { revalidate: 86400 } }, // Cache for 24 hours
    );

    if (!response.ok) {
      throw new Error("Movie not found");
    }

    const movie = await response.json();
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
