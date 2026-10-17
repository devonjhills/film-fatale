"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PersonTile } from "@/components/person/person-tile";
import { cn } from "@/lib/utils";

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  episode_count?: number;
}

interface CastGridProps {
  cast: CastMember[];
  mediaType?: "movie" | "tv";
}

// Two full rows at the widest grid (8 columns); the grid hides the rest
// per breakpoint so the collapsed view always ends on a complete row.
const COLLAPSED_COUNT = 16;

export function CastGrid({ cast, mediaType = "movie" }: CastGridProps) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? cast : cast.slice(0, COLLAPSED_COUNT);
  const canExpand = cast.length > 6;

  return (
    <div>
      <div className={cn("poster-grid", !expanded && "poster-grid-two-rows")}>
        {shown.map((person) => (
          <PersonTile
            key={person.id}
            person={person}
            subtitle={person.character}
            detail={
              mediaType === "tv" && person.episode_count
                ? `${person.episode_count} episode${person.episode_count === 1 ? "" : "s"}`
                : null
            }
          />
        ))}
      </div>

      {canExpand && (
        <div className="mt-8 flex justify-center">
          <Button variant="outline" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>
            {expanded ? "Show less" : `Show full cast (${cast.length})`}
          </Button>
        </div>
      )}
    </div>
  );
}

interface CrewMember {
  id: number;
  name: string;
  job: string;
}

const JOB_ORDER = [
  "Director",
  "Creator",
  "Writer",
  "Screenplay",
  "Story",
  "Novel",
  "Producer",
  "Executive Producer",
  "Director of Photography",
  "Cinematography",
  "Editor",
  "Original Music Composer",
  "Music",
];

/** Key crew as a name list; one entry per person with their jobs combined. */
export function CrewList({ crew, limit = 12 }: { crew: CrewMember[]; limit?: number }) {
  const people = new Map<number, { id: number; name: string; jobs: string[]; rank: number }>();

  for (const member of crew) {
    const rank = JOB_ORDER.indexOf(member.job);
    if (rank === -1) continue;
    const entry = people.get(member.id);
    if (entry) {
      if (!entry.jobs.includes(member.job)) entry.jobs.push(member.job);
      entry.rank = Math.min(entry.rank, rank);
    } else {
      people.set(member.id, { id: member.id, name: member.name, jobs: [member.job], rank });
    }
  }

  const sorted = [...people.values()]
    .sort((a, b) => a.rank - b.rank)
    .slice(0, limit);

  if (!sorted.length) return null;

  return (
    <ul className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
      {sorted.map((person) => (
        <li key={person.id} className="min-w-0">
          <Link
            href={`/person/${person.id}`}
            className="text-[0.9375rem] font-medium hover:underline"
          >
            {person.name}
          </Link>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {person.jobs
              .sort((a, b) => JOB_ORDER.indexOf(a) - JOB_ORDER.indexOf(b))
              .join(", ")}
          </p>
        </li>
      ))}
    </ul>
  );
}
