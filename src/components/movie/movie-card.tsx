import { MediaCard } from "@/components/shared/media-card";
import type { Movie, FormattedMovie } from "@/lib/types";

interface MovieCardProps {
  movie: Movie | FormattedMovie;
  className?: string;
  size?: "sm" | "md" | "lg";
  showYear?: boolean;
  showRating?: boolean;
  priority?: boolean;
}

export function MovieCard(props: MovieCardProps) {
  return (
    <MediaCard
      item={props.movie}
      mediaType="movie"
      className={props.className}
      size={props.size}
      showYear={props.showYear}
      showRating={props.showRating}
      priority={props.priority}
    />
  );
}
