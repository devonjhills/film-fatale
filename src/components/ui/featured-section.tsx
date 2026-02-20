import Image from "next/image";
import Link from "next/link";
import { Icons } from "@/components/ui/icons";
import { cn, formatVoteAverage } from "@/lib/utils";
import { getImageUrl } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { RatingBadge } from "@/components/ui/rating-badge";
import { Card } from "@/components/ui/card";
import { ViewAllButton } from "@/components/ui/view-all-button";
import { InViewAnimation } from "@/components/ui/progressive-loader";
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
      {/* Header */}
      <InViewAnimation animation="fadeUp">
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold tracking-tight">
              {title}
            </h2>
            {showTrending && (
              <Badge variant="secondary" className="gap-1">
                <Icons.Pin className="h-3 w-3 fill-current" />
                Trending
              </Badge>
            )}
          </div>
          {viewAllHref && <ViewAllButton href={viewAllHref} />}
        </div>
      </InViewAnimation>

      {/* Grid */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {featuredItems.map((item, index) => {
          const itemTitle =
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
            <InViewAnimation
              key={item.id}
              animation="fadeUp"
              delay={index * 80}
            >
              <Link href={`/${mediaType}/${item.id}`}>
                <Card className="group transition-all duration-300 hover:scale-[1.02] hover:elevation-3 h-[280px] overflow-hidden border-border/50">
                  <div className="relative h-full">
                    {backdropUrl ? (
                      <Image
                        src={backdropUrl}
                        alt={itemTitle}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        priority={index < 3}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                        <Icons.Film className="h-12 w-12 opacity-40" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/30 to-transparent" />

                    {/* Content overlay */}
                    <div className="absolute inset-0 flex flex-col justify-end p-5">
                      <div className="space-y-2.5">
                        <h3 className="font-serif font-semibold text-xl text-white leading-tight line-clamp-2 text-shadow">
                          {itemTitle}
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
                              className="text-xs glass border-white/20 text-white"
                            >
                              {new Date(releaseDate).getFullYear()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Red hover shimmer */}
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
                  </div>
                </Card>
              </Link>
            </InViewAnimation>
          );
        })}
      </div>
    </section>
  );
}
