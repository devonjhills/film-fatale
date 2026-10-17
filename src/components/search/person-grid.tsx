import Image from "next/image";
import Link from "next/link";
import { User } from "@/components/ui/icons";
import { getImageUrl } from "@/lib/api";
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
  const profileUrl = getImageUrl(person.profile_path, "profile", "h632");

  const topKnownFor = person.known_for?.[0];
  const knownForTitle = topKnownFor
    ? "title" in topKnownFor
      ? topKnownFor.title
      : topKnownFor.name
    : null;

  return (
    <article className={cn("group min-w-0", className)}>
      <Link href={`/person/${person.id}`} className="poster-card">
        <div className="poster-card-art">
          {profileUrl ? (
            <Image
              src={profileUrl}
              alt=""
              fill
              sizes="(max-width: 639px) 33vw, 180px"
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <User
                className="size-7 text-muted-foreground/50"
                aria-hidden="true"
              />
            </div>
          )}
        </div>

        <div className="poster-card-body">
          <h3 className="line-clamp-2 min-h-[2.75em] text-[0.8125rem] font-medium leading-snug text-foreground group-hover:underline group-hover:underline-offset-4">
            {person.name}
          </h3>
          {(knownForTitle || person.known_for_department) && (
            <p className="mt-auto line-clamp-1 text-xs text-muted-foreground">
              {knownForTitle ?? person.known_for_department}
            </p>
          )}
        </div>
      </Link>
    </article>
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
