"use client";

import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Film, Calendar, Star } from "lucide-react";
import { getImageUrl } from "@/lib/api";

interface MediaCredit {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  character?: string;
  vote_average?: number;
  media_type: "movie" | "tv";
}

interface PersonCreditsCardProps {
  credit: MediaCredit;
  className?: string;
}

export function PersonCreditsCard({
  credit,
  className,
}: PersonCreditsCardProps) {
  const title = credit.title || credit.name || "";
  const releaseDate = credit.release_date || credit.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  const imageUrl = getImageUrl(credit.poster_path || null, "poster", "w154");
  const rating = credit.vote_average
    ? Math.round(credit.vote_average * 10) / 10
    : null;

  return (
    <Link href={`/${credit.media_type}/${credit.id}`} className={className}>
      <Card className="group overflow-hidden border border-border/50 bg-background/60 backdrop-blur-sm transition-all duration-500 hover:shadow-lg hover:scale-[1.02] hover:border-primary/30 h-full">
        <div className="flex gap-3 p-3">
          {/* Poster */}
          <div className="relative w-16 h-24 flex-shrink-0">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover rounded-md transition-transform duration-300 group-hover:scale-105"
                sizes="64px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted rounded-md">
                <Film className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Title */}
            <h4 className="font-serif font-semibold text-base leading-tight line-clamp-2 transition-colors duration-300 group-hover:text-primary">
              {title}
            </h4>

            {/* Character/Role */}
            {credit.character && (
              <p className="text-xs text-muted-foreground line-clamp-1 italic">
                <span className="font-medium not-italic">as</span>{" "}
                {credit.character}
              </p>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {year && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span className="font-medium">{year}</span>
                </div>
              )}

              {rating && rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-accent text-accent" />
                  <span className="font-medium">{rating}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
