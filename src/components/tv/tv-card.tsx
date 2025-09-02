import { MediaCard } from "@/components/shared/media-card";
import type { TVShow } from "@/lib/types";

interface TVCardProps {
  tvShow: TVShow;
  className?: string;
  size?: "sm" | "md" | "lg";
  showYear?: boolean;
  showRating?: boolean;
}

export function TVCard(props: TVCardProps) {
  return (
    <MediaCard
      item={props.tvShow}
      mediaType="tv"
      className={props.className}
      size={props.size}
      showYear={props.showYear}
      showRating={props.showRating}
    />
  );
}
