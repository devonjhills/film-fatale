"use client";

import { useState, useEffect, useCallback } from "react";
import { Icons } from "@/components/ui/icons";
import { useMultiSearch } from "@/lib/hooks/api-hooks";
import { debounce } from "@/lib/utils";
import { SearchResults } from "./search-results";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BreadcrumbNavigation } from "@/components/ui/breadcrumb-navigation";
import { BackNavigation } from "@/components/ui/back-navigation";

interface BrowsePageProps {
  initialQuery?: string;
}

type MediaTypeFilter = "all" | "movie" | "tv" | "person";
type SortOption = "relevance" | "popularity" | "rating" | "release_date";

interface SortOptionType {
  value: SortOption;
  label: string;
}

const mediaTypeOptions = [
  { value: "all" as MediaTypeFilter, label: "All Results" },
  { value: "movie" as MediaTypeFilter, label: "Movies" },
  { value: "tv" as MediaTypeFilter, label: "TV Shows" },
  { value: "person" as MediaTypeFilter, label: "People" },
];

const sortOptions: SortOptionType[] = [
  { value: "relevance", label: "Most Relevant" },
  { value: "popularity", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
  { value: "release_date", label: "Newest First" },
];

export function BrowsePage({ initialQuery = "" }: BrowsePageProps) {
  // Search state
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // Filter state
  const [mediaTypeFilter, setMediaTypeFilter] =
    useState<MediaTypeFilter>("all");
  const [sortBy, setSortBy] = useState<SortOptionType>(sortOptions[0]);

  // Debounce search query
  const debouncedSearch = useCallback((searchQuery: string) => {
    const debouncedFn = debounce((query: string) => {
      setDebouncedQuery(query);
      // Update URL without triggering a navigation
      if (query) {
        const url = new URL(window.location.href);
        url.searchParams.set("q", query);
        window.history.replaceState({}, "", url.toString());
      } else {
        const url = new URL(window.location.href);
        url.searchParams.delete("q");
        window.history.replaceState({}, "", url.toString());
      }
    }, 500);
    debouncedFn(searchQuery);
  }, []);

  // Update debounced query when query changes
  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const handleClearSearch = () => {
    setQuery("");
    setDebouncedQuery("");
  };

  const handleResetFilters = () => {
    setMediaTypeFilter("all");
    setSortBy(sortOptions[0]);
  };

  // API hooks
  const {
    results: searchResults,
    isLoading: searchLoading,
    isError: searchError,
  } = useMultiSearch(debouncedQuery);

  // Filter and sort results
  const filteredResults = searchResults
    ? {
        movieResults:
          mediaTypeFilter === "all" || mediaTypeFilter === "movie"
            ? searchResults.movieResults || []
            : [],
        tvResults:
          mediaTypeFilter === "all" || mediaTypeFilter === "tv"
            ? searchResults.tvResults || []
            : [],
        peopleResults:
          mediaTypeFilter === "all" || mediaTypeFilter === "person"
            ? searchResults.peopleResults || []
            : [],
      }
    : null;

  // Calculate totals
  const totalSearchResults = filteredResults
    ? (filteredResults.movieResults?.length || 0) +
      (filteredResults.tvResults?.length || 0) +
      (filteredResults.peopleResults?.length || 0)
    : 0;

  const hasActiveFilters =
    mediaTypeFilter !== "all" || sortBy.value !== "relevance";

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <div className="container mx-auto px-4 pt-6 pb-4">
        <div className="flex items-center justify-between gap-4">
          <BreadcrumbNavigation items={[{ label: "Search", current: true }]} />
          <BackNavigation fallbackHref="/" />
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold">
            Search Movies, TV Shows & People
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover your next favorite entertainment from our comprehensive
            database
          </p>
        </div>

        {/* Search Input */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Search Box */}
              <div className="relative">
                <Icons.Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for movies, TV shows, people..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background pl-12 pr-12 py-4 text-lg placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                />
                {query && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear search"
                  >
                    <Icons.X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Icons.SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Filters</h3>
                  </div>
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetFilters}
                    >
                      Reset Filters
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Media Type Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground">
                      Media Type
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {mediaTypeOptions.map((option) => (
                        <Button
                          key={option.value}
                          variant={
                            mediaTypeFilter === option.value
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => setMediaTypeFilter(option.value)}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Sort By */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground">
                      Sort By
                    </label>
                    <Select
                      value={sortBy.value}
                      onValueChange={(value) => {
                        const option = sortOptions.find(
                          (o) => o.value === value,
                        );
                        if (option) setSortBy(option);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sortOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {debouncedQuery && (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">
                Search Results for &quot;{debouncedQuery}&quot;
              </h2>
              {!searchLoading && (
                <Badge variant="secondary" className="px-2 py-1">
                  {totalSearchResults} result
                  {totalSearchResults !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>

            {/* Search Results */}
            {searchLoading ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Searching...</p>
                </CardContent>
              </Card>
            ) : searchError ? (
              <Card className="border-destructive">
                <CardContent className="p-12 text-center">
                  <div className="text-destructive mb-2 text-2xl">⚠️</div>
                  <h3 className="text-lg font-semibold mb-2">Search Error</h3>
                  <p className="text-muted-foreground">
                    Something went wrong while searching. Please try again.
                  </p>
                </CardContent>
              </Card>
            ) : totalSearchResults === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold mb-2">
                    No Results Found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {hasActiveFilters
                      ? "Try adjusting your filters or search terms"
                      : "Try different keywords or check your spelling"}
                  </p>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={handleResetFilters}>
                      Clear Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <SearchResults results={filteredResults} sortBy={sortBy.value} />
            )}
          </div>
        )}

        {/* Empty State */}
        {!debouncedQuery && (
          <Card>
            <CardContent className="p-12 text-center">
              <Icons.Search className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
              <h2 className="text-2xl font-semibold mb-3">Start Your Search</h2>
              <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
                Enter a movie title, TV show, or person&apos;s name to discover
                your next favorite entertainment
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
