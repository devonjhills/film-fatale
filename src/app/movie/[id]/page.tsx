import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { MovieDetailsPage } from "@/components/movie/movie-details-page";
import { JsonLd } from "@/components/seo/json-ld";
import { fetchTMDBServer } from "@/lib/tmdb-server";
import type { MovieDetails } from "@/lib/types";
import { API_CONFIG } from "@/lib/constants";
import {
  absoluteUrl,
  conciseDescription,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

interface MoviePageProps {
  params: Promise<{
    id: string;
  }>;
}

const getMovieDetails = cache(async (movieId: number) => {
  try {
    return await fetchTMDBServer<MovieDetails>(`/movie/${movieId}`, {
      params: {
        language: API_CONFIG.language,
        append_to_response: API_CONFIG.append_to_response.movie,
      },
      next: { revalidate: 86400 },
    });
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params,
}: MoviePageProps): Promise<Metadata> {
  const { id } = await params;
  const movieId = /^\d+$/.test(id) ? Number(id) : NaN;

  if (!Number.isSafeInteger(movieId) || movieId <= 0) {
    return {
      title: "Movie Not Found",
      robots: { index: false, follow: false },
    };
  }

  const movie = await getMovieDetails(movieId);
  if (!movie) {
    return {
      title: "Movie Not Found",
      description: "The requested movie could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const year = movie.release_date?.slice(0, 4);
  const title = `${movie.title}${year ? ` (${year})` : ""}`;
  const description = conciseDescription(
    movie.overview,
    `Explore ${movie.title}, including cast, crew, ratings, trailers, and where to watch.`,
  );
  const socialImage = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : movie.poster_path
      ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
      : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: `/movie/${movieId}`,
    },
    openGraph: {
      title,
      description,
      type: "video.movie",
      url: `/movie/${movieId}`,
      siteName: SITE_NAME,
      images: socialImage ? [{ url: socialImage, alt: movie.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: socialImage ? [socialImage] : undefined,
    },
  };
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  const movieId = /^\d+$/.test(id) ? Number(id) : NaN;

  if (!Number.isSafeInteger(movieId) || movieId <= 0) {
    notFound();
  }

  const movie = await getMovieDetails(movieId);
  const canonical = absoluteUrl(`/movie/${movieId}`);
  const directors =
    movie?.credits?.crew
      ?.filter((person) => person.job === "Director")
      .map((person) => ({ "@type": "Person", name: person.name })) || [];

  const structuredData = movie
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Movie",
            "@id": `${canonical}#movie`,
            url: canonical,
            name: movie.title,
            description: conciseDescription(
              movie.overview,
              `Details for ${movie.title}.`,
            ),
            image: movie.poster_path
              ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
              : undefined,
            dateCreated: movie.release_date || undefined,
            duration: movie.runtime ? `PT${movie.runtime}M` : undefined,
            genre: movie.genres?.map((genre) => genre.name),
            director: directors.length ? directors : undefined,
            aggregateRating:
              movie.vote_count > 0
                ? {
                    "@type": "AggregateRating",
                    ratingValue: movie.vote_average,
                    ratingCount: movie.vote_count,
                    bestRating: 10,
                    worstRating: 0,
                  }
                : undefined,
            sameAs: movie.imdb_id
              ? `https://www.imdb.com/title/${movie.imdb_id}/`
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
                name: "Movies",
                item: absoluteUrl("/movies/popular"),
              },
              {
                "@type": "ListItem",
                position: 3,
                name: movie.title,
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
      <MovieDetailsPage movieId={movieId} initialMovie={movie || undefined} />
    </>
  );
}
