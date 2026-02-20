"use client";

import { ViewingHistoryItem } from "@/lib/types";
import { ViewingHistoryCard } from "./viewing-history-card";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CurrentlyWatchingSectionProps {
  items: ViewingHistoryItem[];
  loading: boolean;
  onRefresh: () => void;
}

export function CurrentlyWatchingSection({
  items,
  loading,
  onRefresh,
}: CurrentlyWatchingSectionProps) {
  const watchingItems = items.filter((item) => item.status === "watching");
  const tvShows = watchingItems.filter((item) => item.media_type === "tv");
  const movies = watchingItems.filter((item) => item.media_type === "movie");

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Icons.Clock className="h-5 w-5" />
            Currently Watching
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="flex gap-4 p-4">
                  <div className="bg-muted rounded-md w-16 sm:w-20 aspect-[2/3] flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="bg-muted h-4 rounded w-3/4"></div>
                    <div className="bg-muted h-3 rounded w-1/2"></div>
                    <div className="bg-muted h-3 rounded w-2/3"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (watchingItems.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Icons.Play className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">
              Start Your Viewing Journey
            </h3>
            <p className="text-muted-foreground">
              Begin tracking your movie and TV show progress. Add items to your
              library and mark them as &quot;Currently Watching&quot; to see
              them here.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="default" asChild>
              <a href="/search">Discover Movies & Shows</a>
            </Button>
            <Button variant="outline" onClick={onRefresh}>
              Refresh Library
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Icons.Clock className="h-6 w-6 text-primary" />
            Currently Watching
          </h2>
          <Badge variant="secondary" className="px-3 py-1">
            {watchingItems.length}{" "}
            {watchingItems.length === 1 ? "item" : "items"}
          </Badge>
        </div>
        <Button variant="default" size="sm" onClick={onRefresh}>
          Refresh
        </Button>
      </div>

      {/* TV Shows with Episode Progress */}
      {tvShows.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">TV Shows</h3>
            <Badge variant="outline" className="text-xs">
              {tvShows.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {tvShows.map((item) => (
              <ViewingHistoryCard
                key={item.id}
                item={item}
                onUpdate={onRefresh}
              />
            ))}
          </div>
        </div>
      )}

      {/* Movies */}
      {movies.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Movies</h3>
            <Badge variant="outline" className="text-xs">
              {movies.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {movies.map((item) => (
              <ViewingHistoryCard
                key={item.id}
                item={item}
                onUpdate={onRefresh}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
