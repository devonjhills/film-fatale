import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PersonDetailsPage } from "@/components/person/person-details-page";
import type { PersonDetails } from "@/lib/types";
import { ENDPOINTS, API_CONFIG } from "@/lib/constants";

interface PersonPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Server-side fetch function for metadata
async function fetchPersonDetails(
  personId: number,
): Promise<PersonDetails | null> {
  const API_KEY = process.env.NEXT_PUBLIC_MOVIE_API_KEY;
  if (!API_KEY) {
    return null;
  }

  try {
    const queryParams = new URLSearchParams({
      language: API_CONFIG.language,
      append_to_response: API_CONFIG.append_to_response.person,
      api_key: API_KEY,
    });

    const response = await fetch(
      `${ENDPOINTS.personDetails(personId)}?${queryParams}`,
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: PersonPageProps): Promise<Metadata> {
  const { id } = await params;
  const personId = parseInt(id);

  if (isNaN(personId)) {
    return {
      title: "Person Not Found - FilmFatale",
      description: "The requested person page could not be found.",
    };
  }

  try {
    const person = await fetchPersonDetails(personId);

    if (!person) {
      return {
        title: "Person Not Found - FilmFatale",
        description: "The requested person page could not be found.",
      };
    }

    const title = `${person.name} - FilmFatale`;
    const description = person.biography
      ? `${person.biography.slice(0, 155)}...`
      : `View detailed information about ${person.name} including filmography, biography, and more.`;

    return {
      title,
      description,
      alternates: {
        canonical: `/person/${personId}`,
      },
      keywords: [
        person.name,
        person.known_for_department,
        "actor",
        "actress",
        "director",
        "producer",
        "movies",
        "TV shows",
        "filmography",
        "biography",
      ]
        .filter(Boolean)
        .join(", "),
      openGraph: {
        title,
        description,
        type: "profile",
        url: `/person/${personId}`,
        images: person.profile_path
          ? [`https://image.tmdb.org/t/p/w780${person.profile_path}`]
          : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: person.profile_path
          ? [`https://image.tmdb.org/t/p/w780${person.profile_path}`]
          : undefined,
      },
    };
  } catch {
    return {
      title: "Person Not Found - FilmFatale",
      description: "The requested person page could not be found.",
    };
  }
}

export default async function PersonPage({ params }: PersonPageProps) {
  const { id } = await params;
  const personId = parseInt(id);

  if (isNaN(personId)) {
    notFound();
  }

  return <PersonDetailsPage personId={personId} />;
}
