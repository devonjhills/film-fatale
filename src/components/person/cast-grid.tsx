"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User } from "@/components/ui/icons";
import { getImageUrl } from "@/lib/api";
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

// Collapsed: four on phones (one column), eight from 480px (two columns, four
// from lg), so the list always ends on a full row.
const COLLAPSED_COUNT = 8;

/** Top-billed cast as a compact list: round portrait, name and role inline. */
export function CastGrid({ cast, mediaType = "movie" }: CastGridProps) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? cast : cast.slice(0, COLLAPSED_COUNT);

  return (
    <div>
      <ul
        className={cn(
          "grid grid-cols-1 gap-x-6 gap-y-1 min-[480px]:grid-cols-2 lg:grid-cols-4",
          !expanded && "max-[479px]:[&>li:nth-child(n+5)]:hidden",
        )}
      >
        {shown.map((person) => {
          const profileUrl = getImageUrl(person.profile_path, "profile", "w185");
          const episodes =
            mediaType === "tv" && person.episode_count
              ? `${person.episode_count} episode${person.episode_count === 1 ? "" : "s"}`
              : null;
          return (
            <li key={person.id} className="min-w-0">
              <Link
                href={`/person/${person.id}`}
                className="group -mx-2 flex items-center gap-3 rounded-sm px-2 py-2 transition-colors hover:bg-accent/60"
              >
                <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted outline outline-1 -outline-offset-1 outline-foreground/10">
                  {profileUrl ? (
                    <Image src={profileUrl} alt="" fill sizes="56px" className="object-cover" />
                  ) : (
                    <User className="size-5 text-muted-foreground/50" aria-hidden="true" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[0.9375rem] font-medium">{person.name}</span>
                  {person.character && (
                    <span className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      {person.character}
                    </span>
                  )}
                  {episodes && (
                    <span className="block text-xs tabular-nums text-muted-foreground">{episodes}</span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {cast.length > 4 && (
        <Button
          variant="outline"
          className={cn("mt-4", cast.length <= COLLAPSED_COUNT && !expanded && "min-[480px]:hidden")}
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          {expanded ? "Show less" : `Show full cast (${cast.length})`}
        </Button>
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
