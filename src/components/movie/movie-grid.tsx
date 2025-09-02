import { MediaGrid } from "@/components/shared/media-grid";
import type { Movie, FormattedMovie } from "@/lib/types";

interface MovieGridProps {
  movies: (Movie | FormattedMovie)[];
  isLoading?: boolean;
  error?: Error | null;
  className?: string;
  cardSize?: "sm" | "md" | "lg";
  showYear?: boolean;
  showRating?: boolean;
  emptyMessage?: string;
}

export function MovieGrid(props: MovieGridProps) {
  return (
    <MediaGrid
      items={props.movies}
      mediaType="movie"
      isLoading={props.isLoading}
      error={props.error}
      className={props.className}
      cardSize={props.cardSize}
      showYear={props.showYear}
      showRating={props.showRating}
    />
  );
}
