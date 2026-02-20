import Image from "next/image";
import Link from "next/link";
import { Icons } from "@/components/ui/icons";
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
        "overflow-hidden hover:shadow-lg transition-shadow",
        className,
      )}
    >
      <CardContent className="p-2 space-y-2">
        {/* Profile Image - Clickable */}
        <Link href={`/person/${person.id}`} className="group">
          <div className="relative aspect-[3/4] overflow-hidden rounded-md cursor-pointer">
            {profileUrl ? (
              <Image
                src={profileUrl}
                alt={person.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground border rounded-md">
                <Icons.User className="h-8 w-8" />
              </div>
            )}
          </div>
        </Link>

        {/* Person Info - Not Clickable */}
        <div className="space-y-1.5">
          <h3 className="text-sm font-medium leading-tight line-clamp-2">
            {person.name}
          </h3>

          {person.known_for_department && (
            <p className="text-xs text-muted-foreground font-medium">
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
