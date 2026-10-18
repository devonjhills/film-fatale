"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { User } from "@/components/ui/icons";
import { usePersonDetails } from "@/lib/hooks/api-hooks";
import { getImageUrl } from "@/lib/api";
import { formatDate, calculateAge } from "@/lib/utils";
import type { CombinedCredits, PersonDetails } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MediaCard } from "@/components/shared/media-card";
import { Section, FactList } from "@/components/shared/section";

interface PersonDetailsPageProps {
  personId: number;
  initialPerson?: PersonDetails;
}

type Credit = CombinedCredits["cast"][number] & { role: string };

const FILMOGRAPHY_PREVIEW = 20;
// Talk shows and news: appearances, not roles.
const APPEARANCE_GENRES = new Set([10763, 10767]);
const SELF_ROLE = /\b(self|himself|herself|themselves|narrator \(voice\))\b/i;

function PersonDetailsSkeleton() {
  return (
    <div className="site-container py-14 md:py-20" aria-busy="true">
      <div className="grid gap-10 md:grid-cols-[minmax(12rem,17rem)_minmax(0,1fr)] md:gap-14">
        <Skeleton className="mx-auto aspect-[2/3] w-48 md:w-full" />
        <div className="space-y-6">
          <Skeleton className="h-14 w-2/3 max-w-md" />
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
          <Skeleton className="h-40 w-full max-w-2xl" />
        </div>
      </div>
    </div>
  );
}

function creditYear(credit: Credit) {
  const date = credit.release_date || credit.first_air_date;
  return date ? new Date(date).getUTCFullYear() : null;
}

export function PersonDetailsPage({
  personId,
  initialPerson,
}: PersonDetailsPageProps) {
  const { person, isLoading, isError } = usePersonDetails(
    personId,
    initialPerson,
  );
  const [bioExpanded, setBioExpanded] = useState(false);
  const [filmographyExpanded, setFilmographyExpanded] = useState(false);

  if (isLoading) {
    return <PersonDetailsSkeleton />;
  }

  if (isError || !person) {
    return notFound();
  }

  const profileUrl = getImageUrl(person.profile_path, "profile", "h632");
  const age = calculateAge(person.birthday, person.deathday);
  const isActor = (person.known_for_department || "Acting") === "Acting";

  // Actors are listed by role; directors, writers etc. by their main job.
  const credits: Credit[] = isActor
    ? (person.combined_credits?.cast || []).map((credit) => ({
        ...credit,
        role: credit.character,
      }))
    : (person.combined_credits?.crew || [])
        .filter((credit) => credit.department === person.known_for_department)
        .map((credit) => ({ ...credit, character: "", role: credit.job }));

  // One row per title, with every role on it combined.
  const byTitle = new Map<string, Credit>();
  for (const credit of credits) {
    const key = `${credit.media_type}-${credit.id}`;
    const existing = byTitle.get(key);
    if (!existing) {
      byTitle.set(key, { ...credit });
    } else if (credit.role && !existing.role.includes(credit.role)) {
      existing.role = existing.role ? `${existing.role}, ${credit.role}` : credit.role;
    }
  }
  const titles = [...byTitle.values()];

  const knownFor = titles
    .filter(
      (credit) =>
        credit.poster_path &&
        !SELF_ROLE.test(credit.role) &&
        !credit.genre_ids?.some((genre) => APPEARANCE_GENRES.has(genre)),
    )
    .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
    .slice(0, 16);

  // Newest first; titles without a date are upcoming, so they lead.
  const filmography = titles.sort((a, b) => {
    const yearA = creditYear(a) ?? Infinity;
    const yearB = creditYear(b) ?? Infinity;
    return yearB - yearA || (b.popularity || 0) - (a.popularity || 0);
  });
  const shownFilmography = filmographyExpanded
    ? filmography
    : filmography.slice(0, FILMOGRAPHY_PREVIEW);

  const paragraphs = person.biography
    ? person.biography.split(/\n+/).filter((paragraph) => paragraph.trim())
    : [];
  const longBio = paragraphs.length > 2;
  const shownBio = bioExpanded ? paragraphs : paragraphs.slice(0, 2);

  const links = [
    person.external_ids?.imdb_id && {
      label: "IMDb",
      href: `https://www.imdb.com/name/${person.external_ids.imdb_id}`,
    },
    person.external_ids?.instagram_id && {
      label: "Instagram",
      href: `https://www.instagram.com/${person.external_ids.instagram_id}`,
    },
    person.homepage && { label: "Website", href: person.homepage },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <div className="site-container space-y-16 py-14 md:space-y-20 md:py-20">
      <div className="grid gap-10 md:grid-cols-[minmax(12rem,17rem)_minmax(0,1fr)] md:gap-14">
        <div className="poster-frame relative mx-auto aspect-[2/3] w-48 overflow-hidden sm:w-56 md:w-full">
          {profileUrl ? (
            <Image
              src={profileUrl}
              alt={person.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 224px, 272px"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <User className="size-20 text-muted-foreground/50" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="min-w-0">
          <h1 className="page-title">{person.name}</h1>
          {person.known_for_department && (
            <p className="mt-3 text-muted-foreground">{person.known_for_department}</p>
          )}

          <FactList
            className="mt-8 border-t border-border pt-6 lg:grid-cols-3"
            facts={[
              {
                label: "Born",
                value: person.birthday
                  ? `${formatDate(person.birthday)}${age !== null && !person.deathday ? ` (age ${age})` : ""}`
                  : null,
              },
              { label: "Birthplace", value: person.place_of_birth },
              {
                label: "Died",
                value: person.deathday
                  ? `${formatDate(person.deathday)}${age !== null ? ` (aged ${age})` : ""}`
                  : null,
              },
            ]}
          />

          {shownBio.length > 0 && (
            <div className="reading-text mt-8 max-w-[62ch] space-y-4">
              {shownBio.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
              {longBio && (
                <button
                  type="button"
                  onClick={() => setBioExpanded(!bioExpanded)}
                  aria-expanded={bioExpanded}
                  className="font-sans text-sm font-medium underline underline-offset-4 hover:text-muted-foreground"
                >
                  {bioExpanded ? "Show less" : "Read full biography"}
                </button>
              )}
            </div>
          )}

          {links.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {links.map((link) => (
                <Button key={link.label} variant="outline" size="sm" asChild>
                  <a href={link.href} target="_blank" rel="noopener noreferrer">
                    {link.label}
                  </a>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {knownFor.length > 0 && (
        <Section title="Known for">
          <div className="poster-grid poster-grid-two-rows">
            {knownFor.map((credit) => (
              <MediaCard
                key={`${credit.media_type}-${credit.id}`}
                item={credit}
                mediaType={credit.media_type}
              />
            ))}
          </div>
        </Section>
      )}

      {filmography.length > 0 && (
        <Section
          title="Filmography"
          action={
            <span className="text-sm tabular-nums text-muted-foreground">
              {filmography.length} titles
            </span>
          }
        >
          <ol className="divide-y divide-border">
            {shownFilmography.map((credit) => (
              <li key={`${credit.media_type}-${credit.id}`}>
                <Link
                  href={`/${credit.media_type}/${credit.id}`}
                  className="group grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4 py-3 sm:grid-cols-[4rem_minmax(0,1fr)_auto]"
                >
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {creditYear(credit) ?? "TBA"}
                  </span>
                  <span className="min-w-0">
                    <span className="font-medium group-hover:underline group-hover:underline-offset-4">
                      {credit.title || credit.name}
                    </span>
                    {credit.role && (
                      <span className="block truncate text-sm text-muted-foreground">
                        {credit.role}
                      </span>
                    )}
                  </span>
                  <span className="hidden text-sm text-muted-foreground sm:block">
                    {credit.media_type === "tv" ? "TV" : "Film"}
                  </span>
                </Link>
              </li>
            ))}
          </ol>

          {filmography.length > FILMOGRAPHY_PREVIEW && (
            <div className="mt-8 flex justify-center">
              <Button
                variant="outline"
                onClick={() => setFilmographyExpanded(!filmographyExpanded)}
                aria-expanded={filmographyExpanded}
              >
                {filmographyExpanded ? "Show less" : `Show all ${filmography.length}`}
              </Button>
            </div>
          )}
        </Section>
      )}
    </div>
  );
}
