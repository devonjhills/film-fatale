"use client";

import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";

import { ViewingHistoryItem } from "@/lib/types";
import { ViewingHistoryCard } from "./viewing-history-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "@/components/ui/icons";

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
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="surface-panel flex gap-4 p-4">
              <div className="bg-muted rounded-md w-20 aspect-[2/3] flex-shrink-0"></div>
              <div className="flex-1 space-y-3">
                <div className="space-y-2">
                  <div className="bg-muted h-4 rounded w-full"></div>
                  <div className="bg-muted h-4 rounded w-3/4"></div>
                  <div className="bg-muted h-3 rounded w-1/2"></div>
                </div>
                <div className="flex gap-2">
                  <div className="bg-muted h-3 rounded w-16"></div>
                  <div className="bg-muted h-3 rounded w-20"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Nothing here yet"
        description="Add films and shows from their pages and they'll appear in this list."
      >
        <Button asChild>
          <Link href="/">Go to Discover</Link>
        </Button>
      </EmptyState>
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
        <div className="flex items-center gap-3 pb-2 border-b">
          <h2 className="text-xl font-bold">{title}</h2>
          <Badge variant="outline" className="px-2 py-1">
            {items.length}
          </Badge>
        </div>
      )}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
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
          {tvItems.length > 0 && renderGrid(tvItems, "TV shows")}
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
        <Card className="p-6">
          <div className="flex justify-center items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
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
                    aria-label={`Go to page ${pageNum}`}
                    aria-current={page === pageNum ? "page" : undefined}
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
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
