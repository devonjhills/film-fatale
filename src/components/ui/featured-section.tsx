import Image from "next/image";
import Link from "next/link";
import { Pin } from "lucide-react";
import { cn, formatVoteAverage } from "@/lib/utils";
import { getImageUrl } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { RatingBadge } from "@/components/ui/rating-badge";
import { Card } from "@/components/ui/card";
import { ViewAllButton } from "@/components/ui/view-all-button";
import type { Movie, TVShow } from "@/lib/types";

interface FeaturedSectionProps {
  title: string;
  items: (Movie | TVShow)[];
  mediaType?: "movie" | "tv";
  className?: string;
  limit?: number;
  showTrending?: boolean;
  viewAllHref?: string;
}

export function FeaturedSection({
  title,
  items,
  mediaType = "movie",
  className,
  limit = 6,
  showTrending = true,
  viewAllHref,
}: FeaturedSectionProps) {
  const featuredItems = items.slice(0, limit);

  if (featuredItems.length === 0) return null;

  return (
    <section className={cn("space-y-10", className)}>
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold tracking-tight">
            {title}
          </h2>
          {showTrending && (
            <Badge variant="secondary" className="gap-1">
              <Pin className="h-3 w-3 fill-current" />
              Trending
            </Badge>
          )}
        </div>
        {viewAllHref && <ViewAllButton href={viewAllHref} />}
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {featuredItems.map((item, index) => {
          const title =
            "title" in item ? item.title : "name" in item ? item.name : "";
          const releaseDate =
            "release_date" in item
              ? item.release_date
              : "first_air_date" in item
                ? item.first_air_date
                : null;
          const backdropUrl = getImageUrl(
            item.backdrop_path,
            "backdrop",
            "w780",
          );
          const rating = formatVoteAverage(item.vote_average);

          return (
            <Link key={item.id} href={`/${mediaType}/${item.id}`}>
              <Card className="group transition-all duration-200 hover:shadow-xl hover:scale-[1.02] h-[280px] overflow-hidden">
                <div className="relative h-full">
                  {backdropUrl ? (
                    <Image
                      src={backdropUrl}
                      alt={title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      priority={index < 3}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                      <span className="text-sm">No Image</span>
                    </div>
                  )}

                  {/* Enhanced gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  {/* Content positioning */}
                  <div className="absolute inset-0 flex flex-col justify-end p-5">
                    <div className="space-y-3">
                      <h3 className="font-serif font-semibold text-xl text-white leading-tight line-clamp-2">
                        {title}
                      </h3>

                      <div className="flex items-center gap-2">
                        {item.vote_average > 0 && (
                          <RatingBadge
                            rating={rating}
                            variant="overlay"
                            size="sm"
                          />
                        )}
                        {releaseDate && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-white/10 text-white border-white/20"
                          >
                            {new Date(releaseDate).getFullYear()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-accent/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
