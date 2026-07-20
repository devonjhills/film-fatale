import Image from "next/image";
import Link from "next/link";
import { User } from "@/components/ui/icons";
import { getImageUrl } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Person } from "@/lib/types";

interface PersonCardProps {
  person: Person;
  className?: string;
}

function PersonCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-2 space-y-2">
        {/* Profile Image Skeleton */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-md">
          <Skeleton className="h-full w-full" />
        </div>

        {/* Person Info Skeleton */}
        <div className="space-y-2">
          {/* Name */}
          <Skeleton className="h-4 w-full" />
          {/* Department */}
          <Skeleton className="h-3 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

function PersonCard({ person, className }: PersonCardProps) {
  const profileUrl = getImageUrl(person.profile_path, "profile", "w185");

  // Get top known for item
  const topKnownFor = person.known_for?.[0];
  const knownForTitle = topKnownFor
    ? "title" in topKnownFor
      ? topKnownFor.title
      : topKnownFor.name
    : null;

  return (
    <Card
      className={cn(
        "group overflow-hidden transition-[border-color,background-color,transform] duration-300 hover:-translate-y-1 hover:border-primary/55 hover:bg-card",
        className,
      )}
    >
      <Link href={`/person/${person.id}`} className="block">
        <CardContent className="space-y-3 p-2.5">
          <div className="relative aspect-[3/4] overflow-hidden rounded-sm">
            {profileUrl ? (
              <Image
                src={profileUrl}
                alt=""
                fill
                className="object-cover saturate-[0.72] transition-[filter,transform] duration-500 group-hover:scale-[1.035] group-hover:saturate-100"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center border bg-muted text-muted-foreground">
                <User className="h-8 w-8" weight="duotone" />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
          </div>

          <div className="space-y-1.5 px-0.5 pb-1">
          <h3 className="line-clamp-2 font-serif text-base font-semibold leading-tight tracking-[-0.015em] transition-colors group-hover:text-primary">
            {person.name}
          </h3>

          {person.known_for_department && (
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              {person.known_for_department}
            </p>
          )}

          {/* Top Known For */}
          {knownForTitle && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {knownForTitle}
            </p>
          )}
          </div>
        </CardContent>
      </Link>
    </Card>
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
      <div
        className={cn(
          "grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
          className,
        )}
      >
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
    <div
      className={cn(
        "grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
        className,
      )}
    >
      {people.map((person) => (
        <PersonCard key={person.id} person={person} />
      ))}
    </div>
  );
}
