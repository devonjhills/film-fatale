"use client";

import { useState } from "react";
import { ViewingHistoryItem } from "@/lib/types";
import { getImageUrl } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StatusUpdateDialog } from "./status-update-dialog";
import { EpisodeProgress } from "./episode-progress";
import Link from "next/link";
import Image from "next/image";

interface ViewingHistoryCardProps {
  item: ViewingHistoryItem;
  onUpdate: () => void;
}

const statusColors = {
  watching: "bg-primary/10 text-primary",
  completed: "bg-accent/10 text-accent-foreground",
  plan_to_watch: "bg-muted text-muted-foreground",
};

const statusLabels = {
  watching: "Currently Watching",
  completed: "Watched",
  plan_to_watch: "Want to Watch",
};

export function ViewingHistoryCard({
  item,
  onUpdate,
}: ViewingHistoryCardProps) {
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  const getValidImageUrl = (posterPath: string | null): string | null => {
    if (!posterPath || posterPath.trim() === "") return null;
    const imageUrl = getImageUrl(posterPath, "poster", "w185");
    return imageUrl && imageUrl.trim() !== "" ? imageUrl : null;
  };

  const handleRemove = async () => {
    try {
      const response = await fetch(
        `/api/viewing-history?tmdb_id=${item.tmdb_id}&media_type=${item.media_type}`,
        { method: "DELETE" },
      );

      if (!response.ok) throw new Error("Failed to remove item");
      onUpdate();
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  return (
    <>
      <Card className="group glass overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
        <div className="flex gap-4 p-4">
          {/* Poster Section */}
          <div className="relative flex-shrink-0">
            <Link
              href={`/${item.media_type}/${item.tmdb_id}`}
              className="block w-20 aspect-[2/3] relative"
            >
              <div className="relative w-full h-full rounded-md overflow-hidden">
                {(() => {
                  const validImageUrl = getValidImageUrl(item.poster_path);
                  return validImageUrl ? (
                    <Image
                      src={validImageUrl}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="80px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
                      <span className="text-xs text-muted-foreground font-medium text-center text-sm">
                        No Image
                      </span>
                    </div>
                  );
                })()}
              </div>
            </Link>
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            {/* Header Section */}
            <div className="space-y-3">
              {/* Title and Action Buttons */}
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={`/${item.media_type}/${item.tmdb_id}`}
                  className="block hover:text-primary transition-colors flex-1 min-w-0"
                >
                  <h3 className="font-semibold text-lg line-clamp-2 leading-tight">
                    {item.title}
                  </h3>
                </Link>

                {/* Action Buttons */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => setShowStatusDialog(true)}
                      >
                        <Icons.Edit3 className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Update status, rating & notes</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={handleRemove}
                      >
                        <Icons.Trash2 className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Remove from library</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Media Type and Status */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground font-medium text-sm">
                  {item.media_type === "movie" ? "Movie" : "TV Show"}
                </span>
                <Badge
                  className={`${statusColors[item.status]} text-xs px-2 py-1 font-medium`}
                >
                  {statusLabels[item.status]}
                </Badge>
              </div>

              {/* Ratings and Metadata */}
              <div className="flex items-center flex-wrap gap-3">
                {item.rating && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 cursor-default">
                        <Icons.Star className="h-4 w-4 fill-accent text-accent" />
                        <span className="text-sm font-semibold">
                          {item.rating}/10
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Your rating</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {item.vote_average && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 text-muted-foreground cursor-default">
                        <span className="text-sm font-medium">TMDB</span>
                        <span className="text-sm">
                          {Math.round(item.vote_average * 10) / 10}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>TMDB score</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {item.watch_count > 1 && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Icons.RotateCcw className="h-4 w-4" />
                    <span className="font-medium text-sm">
                      {item.watch_count}x
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Section */}
            <div className="space-y-2 mt-2">
              {/* Episode Progress for TV Shows */}
              {item.media_type === "tv" && item.episode_progress && (
                <EpisodeProgress
                  progress={item.episode_progress}
                  tmdbId={item.tmdb_id}
                  onEpisodeUpdate={onUpdate}
                />
              )}

              {/* Notes Section */}
              {item.notes && (
                <div className="border-t pt-2">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Icons.StickyNote className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2 text-sm">{item.notes}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <StatusUpdateDialog
        item={item}
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        onUpdate={() => {
          onUpdate();
          setShowStatusDialog(false);
        }}
      />
    </>
  );
}
