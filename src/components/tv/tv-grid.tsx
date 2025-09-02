import { MediaGrid } from "@/components/shared/media-grid";
import type { TVShow } from "@/lib/types";

interface TVGridProps {
  tvShows: TVShow[];
  isLoading?: boolean;
  error?: Error | null;
  className?: string;
  cardSize?: "sm" | "md" | "lg";
  showYear?: boolean;
  showRating?: boolean;
  emptyMessage?: string;
}

export function TVGrid(props: TVGridProps) {
  return (
    <MediaGrid
      items={props.tvShows}
      mediaType="tv"
      isLoading={props.isLoading}
      error={props.error}
      className={props.className}
      cardSize={props.cardSize}
      showYear={props.showYear}
      showRating={props.showRating}
    />
  );
}
