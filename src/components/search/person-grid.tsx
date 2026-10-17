import { PersonTile } from "@/components/person/person-tile";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Person } from "@/lib/types";

interface PersonCardProps {
  person: Person;
  className?: string;
}

function PersonCardSkeleton() {
  return (
    <div className="poster-card">
      <Skeleton className="aspect-[2/3] w-full rounded-none" />
      <div className="poster-card-body">
        <Skeleton className="h-3.5 w-4/5 rounded-sm" />
        <Skeleton className="mt-1 h-3 w-1/2 rounded-sm" />
      </div>
    </div>
  );
}

function PersonCard({ person, className }: PersonCardProps) {
  const topKnownFor = person.known_for?.[0];
  const knownForTitle = topKnownFor
    ? "title" in topKnownFor
      ? topKnownFor.title
      : topKnownFor.name
    : null;

  return (
    <PersonTile
      person={person}
      subtitle={knownForTitle ?? person.known_for_department}
      className={className}
    />
  );
}

interface PersonGridProps {
  people: Person[];
  isLoading?: boolean;
  error?: Error | null;
  className?: string;
  emptyMessage?: string;
}

export function PersonGrid({
  people,
  isLoading = false,
  error,
  className,
  emptyMessage = "No people found.",
}: PersonGridProps) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-destructive mb-2">⚠️ Error loading people</div>
        <p className="text-sm text-muted-foreground">
          {error?.message || "Something went wrong. Please try again later."}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn("poster-grid", className)}>
        {Array.from({ length: 12 }).map((_, index) => (
          <PersonCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!people || people.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-6xl mb-4">👤</div>
        <h3 className="text-lg font-medium mb-2">No People Found</h3>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("poster-grid", className)}>
      {people.map((person) => (
        <PersonCard key={person.id} person={person} />
      ))}
    </div>
  );
}
