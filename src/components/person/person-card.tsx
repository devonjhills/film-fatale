"use client";

import Link from "next/link";
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
  className?: string;
}

export function PersonCard({
  person,
  role,
  href,
  mediaType,
  className,
}: PersonCardProps) {
  const linkPath = href || `/person/${person.id}`;

  const fallbackInitials = person.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <Link href={linkPath} className={className}>
      <div className="group flex min-h-24 cursor-pointer items-center space-x-4 rounded-sm border border-border bg-card p-3.5 transition-colors duration-150 hover:border-input">
        {/* Person Avatar with noir styling */}
        <div className="relative">
          <Avatar className="size-16 flex-shrink-0">
            <AvatarImage
              src={
                person.profile_path
                  ? getImageUrl(person.profile_path, "profile", "w185")
                  : undefined
              }
              alt={person.name}
              className="object-cover object-center"
            />
            <AvatarFallback className="text-sm font-serif font-semibold bg-muted">
              {fallbackInitials}
            </AvatarFallback>
          </Avatar>

        </div>

        {/* Person Info with enhanced typography */}
        <div className="min-w-0 flex-1 space-y-1">
          <h4 className="line-clamp-1 text-base font-semibold leading-tight group-hover:underline group-hover:underline-offset-4">
            {person.name}
          </h4>

          <p className="text-sm text-muted-foreground line-clamp-1">
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
