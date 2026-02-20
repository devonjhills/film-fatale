import Image from "next/image";
import Link from "next/link";
import { Icons } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getImageUrl } from "@/lib/api";

interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  release_date?: string;
  first_air_date?: string;
}

interface MediaCardHorizontalProps {
  item: MediaItem;
  mediaType: "movie" | "tv";
  className?: string;
  character?: string;
  showCard?: boolean;
}

export function MediaCardHorizontal({
  item,
  mediaType,
  className,
  character,
  showCard = true,
}: MediaCardHorizontalProps) {
  const imageUrl = getImageUrl(item.poster_path || null, "poster", "w154");
  const title = item.title || item.name || "";
  const releaseDate = item.release_date || item.first_air_date;

  const content = (
    <>
      {/* Poster - Larger for better visibility */}
      <div className="relative w-20 h-28 flex-shrink-0">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover rounded-md transition-transform duration-300 group-hover:scale-105"
            sizes="80px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted rounded-md">
            <Icons.Film className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Content - Film noir typography */}
      <div className="flex-1 space-y-3 min-w-0 flex flex-col justify-center px-2">
        <div className="space-y-2">
          <h4
            className={cn(
              "font-serif font-semibold text-base leading-tight line-clamp-2 tracking-wide",
              showCard ? "hover:text-primary" : "group-hover:text-primary",
              "transition-colors duration-300",
            )}
          >
            {title}
          </h4>

          {character && (
            <p className="text-sm text-muted-foreground line-clamp-1 italic">
              <span className="font-medium not-italic">as</span> {character}
            </p>
          )}
        </div>

        {releaseDate && (
          <p className="text-sm text-muted-foreground font-medium">
            {new Date(releaseDate).getFullYear()}
          </p>
        )}
      </div>
    </>
  );

  if (showCard) {
    return (
      <Link href={`/${mediaType}/${item.id}`} className={className}>
        <Card
          className={cn(
            "flex space-x-4 p-4 border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:shadow-lg hover:scale-[1.02] hover:border-primary/30 group",
            "min-h-[120px] w-full",
          )}
        >
          {content}
        </Card>
      </Link>
    );
  }

  return (
    <Link
      href={`/${mediaType}/${item.id}`}
      className={cn(
        "group flex space-x-4 p-4 rounded-lg bg-background/30 backdrop-blur-sm border border-border/30 hover:bg-background/60 hover:border-primary/40 transition-all duration-500",
        "min-h-[120px] items-center w-full",
        className,
      )}
    >
      {content}
    </Link>
  );
}
