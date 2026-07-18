"use client";

import { WatchStatus } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface ViewingHistoryFiltersProps {
  filters: {
    status: WatchStatus | "all";
    mediaType: "movie" | "tv" | "all";
  };
  onFiltersChange: (filters: {
    status: WatchStatus | "all";
    mediaType: "movie" | "tv" | "all";
  }) => void;
  hideStatus?: boolean;
}

const statusOptions = [
  { value: "watching", label: "Currently Watching" },
  { value: "plan_to_watch", label: "Want to Watch" },
  { value: "completed", label: "Watched" },
  { value: "all", label: "All Statuses" },
] as const;

const mediaTypeOptions = [
  { value: "all", label: "All Types" },
  { value: "movie", label: "Movies" },
  { value: "tv", label: "TV Shows" },
] as const;

export function ViewingHistoryFilters({
  filters,
  onFiltersChange,
  hideStatus = false,
}: ViewingHistoryFiltersProps) {
  const handleClearFilters = () => {
    onFiltersChange({
      status: hideStatus ? filters.status : "all",
      mediaType: "all",
    });
  };

  const hasActiveFilters =
    (!hideStatus && filters.status !== "all") || filters.mediaType !== "all";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-semibold">Filter Library</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear All
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {!hideStatus && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Status:
            </span>
            <Select
              value={filters.status}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  status: value as WatchStatus | "all",
                })
              }
            >
              <SelectTrigger className="h-9 w-44">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Type:
          </span>
          <Select
            value={filters.mediaType}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                mediaType: value as "movie" | "tv" | "all",
              })
            }
          >
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              {mediaTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
