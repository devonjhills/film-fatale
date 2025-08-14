"use client";

import { ViewingHistoryItem } from "@/lib/types";
import { ViewingHistoryCard } from "./viewing-history-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

interface ViewingHistoryGridProps {
  items: ViewingHistoryItem[];
  loading: boolean;
  onRefresh: () => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  mediaTypeFilter: "movie" | "tv" | "all";
}

export function ViewingHistoryGrid({
  items,
  loading,
  onRefresh,
  page,
  totalPages,
  onPageChange,
  mediaTypeFilter,
}: ViewingHistoryGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="bg-muted rounded-md w-16 sm:w-20 aspect-[2/3] flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="bg-muted h-4 rounded w-3/4"></div>
                <div className="bg-muted h-3 rounded w-1/2"></div>
                <div className="bg-muted h-3 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-gradient-to-br from-muted/50 to-background/95 backdrop-blur-sm border border-border rounded-xl p-12 text-center shadow-sm">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <svg
              className="h-10 w-10 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-serif font-semibold">
              Your Library Awaits
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              No items match your current filters. Try adjusting your search
              criteria or explore new content to add to your library.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="default"
              asChild
              className="bg-primary/95 backdrop-blur-sm hover:bg-primary"
            >
              <a href="/discover">Discover Content</a>
            </Button>
            <Button
              onClick={onRefresh}
              variant="outline"
              className="bg-background/90 backdrop-blur-sm border-border/70 hover:bg-background"
            >
              Refresh Library
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Group items by media type when showing all types
  const shouldGroupByMediaType = mediaTypeFilter === "all";
  const movieItems = shouldGroupByMediaType
    ? items.filter((item) => item.media_type === "movie")
    : [];
  const tvItems = shouldGroupByMediaType
    ? items.filter((item) => item.media_type === "tv")
    : [];

  const renderGrid = (items: ViewingHistoryItem[], title?: string) => (
    <div className="space-y-6">
      {title && (
        <div className="flex items-center gap-3 pb-2 border-b border-border/30">
          <div className="bg-background/85 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-border/40 shadow-sm">
            <h2 className="text-xl font-serif font-bold">{title}</h2>
          </div>
          <Badge
            variant="outline"
            className="px-2 py-1 bg-background/90 backdrop-blur-sm border-border/50"
          >
            {items.length}
          </Badge>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((item) => (
          <ViewingHistoryCard key={item.id} item={item} onUpdate={onRefresh} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {shouldGroupByMediaType ? (
        <>
          {movieItems.length > 0 && renderGrid(movieItems, "Movies")}
          {tvItems.length > 0 && renderGrid(tvItems, "TV Shows")}
          {movieItems.length === 0 && tvItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No items found for the current filters.
            </div>
          )}
        </>
      ) : (
        renderGrid(items)
      )}

      {totalPages > 1 && (
        <div className="bg-muted/60 backdrop-blur-sm rounded-lg p-6 border border-border shadow-sm">
          <div className="flex justify-center items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="gap-2"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className="w-10 h-9"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="gap-2"
            >
              Next
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
