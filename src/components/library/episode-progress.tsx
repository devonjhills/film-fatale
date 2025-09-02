"use client";

import { TVShowProgress } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check } from "lucide-react";
import { useState, useEffect } from "react";

interface EpisodeProgressProps {
  progress: TVShowProgress;
  tmdbId: number;
  onEpisodeUpdate?: () => void;
}

export function EpisodeProgress({
  progress,
  tmdbId,
  onEpisodeUpdate,
}: EpisodeProgressProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [animatedWidth, setAnimatedWidth] = useState(0);

  const completionPercentage = progress
    ? Math.round(progress.completion_percentage)
    : 0;

  // Animate progress bar fill on load
  useEffect(() => {
    if (!progress) return;
    const timer = setTimeout(() => {
      setAnimatedWidth(completionPercentage);
    }, 200);
    return () => clearTimeout(timer);
  }, [completionPercentage, progress]);

  const markNextEpisodeWatched = async () => {
    if (!progress.next_episode || isUpdating) return;

    setIsUpdating(true);
    try {
      const response = await fetch("/api/episodes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tmdb_id: tmdbId,
          season_number: progress.next_episode.season_number,
          episode_number: progress.next_episode.episode_number,
          watched: true,
        }),
      });

      if (response.ok && onEpisodeUpdate) {
        onEpisodeUpdate();
      }
    } catch (error) {
      console.error("Error marking episode watched:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!progress) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="space-y-2 mt-2">
        {/* Enhanced Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-serif font-semibold text-foreground">
              Progress
            </span>
            <span className="font-medium text-muted-foreground">
              {progress.watched_episodes}/{progress.total_episodes} episodes
            </span>
          </div>
          <div className="relative h-3 bg-muted/80 rounded-full overflow-hidden shadow-inner border border-border/40">
            <div
              className="h-full bg-primary rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
              style={{ width: `${animatedWidth}%` }}
            >
              {/* Animated shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
            </div>
          </div>
        </div>

        {/* Enhanced Status and Action */}
        {progress.next_episode ? (
          <div className="flex items-center justify-between gap-2">
            <Badge variant="secondary" className="text-xs font-medium">
              Next: S{progress.next_episode.season_number}E
              {progress.next_episode.episode_number}
            </Badge>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={markNextEpisodeWatched}
                  disabled={isUpdating}
                  className="h-7 w-7 p-0 hover:bg-primary/10 hover:border-primary transition-colors duration-200"
                >
                  {isUpdating ? (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Mark S{progress.next_episode.season_number}E
                {progress.next_episode.episode_number} as watched
              </TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <Badge variant="default" className="text-xs font-medium">
            <Check className="h-3 w-3 mr-1" />
            Complete
          </Badge>
        )}

        {/* Season Progress Summary */}
        {progress.total_seasons > 1 && (
          <div className="text-xs text-muted-foreground">
            {
              progress.seasons.filter((s) => s.completion_percentage === 100)
                .length
            }
            /{progress.total_seasons} seasons complete
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
