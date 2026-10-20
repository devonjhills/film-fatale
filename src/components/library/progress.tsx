import type { ShowProgress } from "@/lib/types";
import { cn } from "@/lib/utils";

const episodeLabel = (ref: { season_number: number; episode_number: number }) =>
  `S${ref.season_number} E${ref.episode_number}`;

/** Where you are in a show, in a few words. */
export function progressSummary(progress: ShowProgress) {
  if (progress.aired_episodes === 0) return "Not aired yet";
  if (progress.next_episode) return `Next up ${episodeLabel(progress.next_episode)}`;
  return progress.ended ? "Finished" : "Caught up";
}

export function newEpisodesLabel(progress: ShowProgress) {
  if (!progress.has_new) return null;
  return progress.remaining > 0 ? `${progress.remaining} new` : "New episodes";
}

export { episodeLabel };

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-1 w-full overflow-hidden rounded-full bg-muted", className)}
    >
      <div className="h-full bg-mint" style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}
