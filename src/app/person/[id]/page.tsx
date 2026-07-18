import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PersonDetailsPage } from "@/components/person/person-details-page";
import type { PersonDetails } from "@/lib/types";
import { API_CONFIG, TMDB_PATHS } from "@/lib/constants";
import { fetchTMDBServer } from "@/lib/tmdb-server";

interface PersonPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Server-side fetch function for metadata
async function fetchPersonDetails(
  personId: number,
): Promise<PersonDetails | null> {
  try {
    return await fetchTMDBServer<PersonDetails>(
      TMDB_PATHS.personDetails(personId),
      {
        params: {
          language: API_CONFIG.language,
          append_to_response: API_CONFIG.append_to_response.person,
        },
        next: { revalidate: 86400 },
      },
    );
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
