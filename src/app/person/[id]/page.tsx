import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { PersonDetailsPage } from "@/components/person/person-details-page";
import { JsonLd } from "@/components/seo/json-ld";
import type { PersonDetails } from "@/lib/types";
import { API_CONFIG, TMDB_PATHS } from "@/lib/constants";
import { fetchTMDBServer } from "@/lib/tmdb-server";
import {
  absoluteUrl,
  conciseDescription,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

interface PersonPageProps {
  params: Promise<{
    id: string;
  }>;
}

const fetchPersonDetails = cache(async function fetchPersonDetails(
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
});

export async function generateMetadata({
  params,
}: PersonPageProps): Promise<Metadata> {
  const { id } = await params;
  const personId = /^\d+$/.test(id) ? Number(id) : NaN;

  if (!Number.isSafeInteger(personId) || personId <= 0) {
    return {
      title: "Person Not Found",
      description: "The requested person page could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const person = await fetchPersonDetails(personId);
  if (!person) {
    return {
      title: "Person Not Found",
      description: "The requested person page could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const description = conciseDescription(
    person.biography,
    `Explore ${person.name}'s biography, movie and TV credits, and known work.`,
  );
  const profileImage = person.profile_path
    ? `https://image.tmdb.org/t/p/h632${person.profile_path}`
    : undefined;

  return {
    title: person.name,
    description,
    alternates: {
      canonical: `/person/${personId}`,
    },
    openGraph: {
      title: person.name,
      description,
      type: "profile",
      url: `/person/${personId}`,
      siteName: SITE_NAME,
      images: profileImage
        ? [{ url: profileImage, alt: person.name }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: person.name,
      description,
      images: profileImage ? [profileImage] : undefined,
    },
  };
}

export default async function PersonPage({ params }: PersonPageProps) {
  const { id } = await params;
  const personId = /^\d+$/.test(id) ? Number(id) : NaN;

  if (!Number.isSafeInteger(personId) || personId <= 0) {
    notFound();
  }

  const person = await fetchPersonDetails(personId);
  const canonical = absoluteUrl(`/person/${personId}`);
  const structuredData = person
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Person",
            "@id": `${canonical}#person`,
            url: canonical,
            name: person.name,
            description: conciseDescription(
              person.biography,
              `Filmography and biography for ${person.name}.`,
            ),
            image: person.profile_path
              ? `https://image.tmdb.org/t/p/h632${person.profile_path}`
              : undefined,
            birthDate: person.birthday || undefined,
            deathDate: person.deathday || undefined,
            birthPlace: person.place_of_birth
              ? { "@type": "Place", name: person.place_of_birth }
              : undefined,
            jobTitle: person.known_for_department || undefined,
            sameAs: person.imdb_id
              ? [`https://www.imdb.com/name/${person.imdb_id}/`]
              : undefined,
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
                name: "People",
                item: absoluteUrl("/search"),
              },
              {
                "@type": "ListItem",
                position: 3,
                name: person.name,
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
      <PersonDetailsPage
        personId={personId}
        initialPerson={person || undefined}
      />
    </>
  );
}
