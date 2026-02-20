"use client";

import { useState } from "react";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { PersonCard } from "@/components/person/person-card";

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
  episode_count?: number; // For TV shows
}

interface CastGridProps {
  cast: CastMember[];
  initialDisplayCount?: number;
  mediaType?: "movie" | "tv";
}

export function CastGrid({
  cast,
  initialDisplayCount = 12,
  mediaType = "movie",
}: CastGridProps) {
  const [showAll, setShowAll] = useState(false);

  const displayedCast = showAll ? cast : cast.slice(0, initialDisplayCount);
  const hasMoreCast = cast.length > initialDisplayCount;

  return (
    <div className="space-y-4">
      {/* Main Cast Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {displayedCast.map((person) => (
          <PersonCard
            key={person.id}
            person={person}
            role={person.character}
            mediaType={mediaType}
          />
        ))}
      </div>

      {/* Show More/Less Button */}
      {hasMoreCast && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2"
          >
            {showAll ? (
              <>
                Show Less Cast
                <Icons.ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Show {cast.length - initialDisplayCount} More Cast
                <Icons.ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
