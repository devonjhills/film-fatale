import Image from "next/image";
import Link from "next/link";
import { Film } from "@/components/ui/icons";
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
            className="rounded-md object-cover"
            sizes="80px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted rounded-md">
            <Film className="h-6 w-6 text-muted-foreground" weight="duotone" />
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
              "transition-colors duration-100",
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
            "group flex space-x-4 overflow-hidden border border-border/60 bg-card/70 p-4 transition-colors duration-100 hover:border-primary/55 hover:bg-card",
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
        "group flex space-x-4 rounded-md border border-border/60 bg-card/70 p-4 transition-colors duration-100 hover:border-primary/55 hover:bg-card",
        "min-h-[120px] items-center w-full",
        className,
      )}
    >
      {content}
    </Link>
  );
}
