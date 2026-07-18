"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getImageUrl } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PersonCardProps {
  person: {
    id: number;
    name: string;
    profile_path: string | null;
    episode_count?: number; // For TV shows
  };
  role: string; // character or job
  href?: string;
  mediaType?: "movie" | "tv";
  variant?: "horizontal" | "vertical";
  className?: string;
}

export function PersonCard({
  person,
  role,
  href,
  mediaType,
  variant = "horizontal",
  className,
}: PersonCardProps) {
  const linkPath = href || `/person/${person.id}`;

  const fallbackInitials = person.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  if (variant === "vertical") {
    return (
      <Link href={linkPath} className={className}>
        <div className="group cursor-pointer w-[140px]">
          <Card className="relative flex h-[240px] flex-col overflow-hidden border-border/60 bg-card transition-colors duration-200 hover:border-primary/40">
            {/* Person Photo */}
            <div className="relative flex-1 rounded-lg overflow-hidden shadow-lg">
              <Avatar className="w-full h-full rounded-lg">
                <AvatarImage
                  src={
                    person.profile_path
                      ? getImageUrl(person.profile_path, "profile", "w185")
                      : undefined
                  }
                  alt={person.name}
                  className="size-full rounded-md object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                />
                <AvatarFallback className="text-lg font-serif font-semibold w-full h-full rounded-lg bg-muted flex items-center justify-center">
                  {fallbackInitials}
                </AvatarFallback>
              </Avatar>

              {/* Noir gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

              {/* Episode count badge for TV */}
              {mediaType === "tv" && person.episode_count && (
                <div className="absolute top-2 right-2">
                  <Badge
                    variant="secondary"
                    className="bg-background/90 text-xs"
                  >
                    {person.episode_count} ep
                    {person.episode_count !== 1 ? "s" : ""}
                  </Badge>
                </div>
              )}

              {/* Text overlay at bottom */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-3">
                <h4 className="mb-1 line-clamp-2 font-serif text-sm font-semibold leading-tight text-white drop-shadow-lg">
                  {person.name}
                </h4>
                <p className="line-clamp-1 text-xs font-medium text-white/80">
                  {role}
                </p>
              </div>

              {/* Subtle border glow */}
              <div className="absolute inset-0 rounded-lg border border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </Card>
        </div>
      </Link>
    );
  }

  return (
    <Link href={linkPath} className={className}>
      <div className="group flex cursor-pointer items-center space-x-4 rounded-md border border-border/60 bg-card/70 p-3 transition-colors duration-200 hover:border-primary/40 hover:bg-card">
        {/* Person Avatar with noir styling */}
        <div className="relative">
          <Avatar className="size-16 flex-shrink-0 ring-1 ring-border/70 transition-colors duration-200 group-hover:ring-primary/50">
            <AvatarImage
              src={
                person.profile_path
                  ? getImageUrl(person.profile_path, "profile", "w185")
                  : undefined
              }
              alt={person.name}
              className="object-cover object-center transition-transform duration-200 group-hover:scale-[1.02]"
            />
            <AvatarFallback className="text-sm font-serif font-semibold bg-muted">
              {fallbackInitials}
            </AvatarFallback>
          </Avatar>

          {/* Subtle glow effect */}
          <div className="absolute inset-0 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
        </div>

        {/* Person Info with enhanced typography */}
        <div className="min-w-0 flex-1 space-y-1">
          <h4 className="font-serif font-semibold text-lg leading-tight line-clamp-1 transition-colors duration-300 group-hover:text-primary tracking-wide">
            {person.name}
          </h4>

          <p className="text-sm text-muted-foreground line-clamp-1 font-medium italic">
            {role}
          </p>

          {mediaType === "tv" && person.episode_count && (
            <Badge variant="outline" className="text-xs font-medium">
              {person.episode_count} episode
              {person.episode_count !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
