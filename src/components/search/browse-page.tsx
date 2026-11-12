"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "@/components/ui/icons";
import { useMultiSearch } from "@/lib/hooks/api-hooks";
import { SearchResults } from "./search-results";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { fieldClass } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MediaCardSkeleton } from "@/components/ui/poster-skeleton";

interface BrowsePageProps {
  initialQuery?: string;
}

type MediaTypeFilter = "all" | "movie" | "tv" | "person";

const mediaTypeOptions: { value: MediaTypeFilter; label: string; noun: string }[] = [
  { value: "all", label: "All", noun: "results" },
  { value: "movie", label: "Movies", noun: "movies" },
  { value: "tv", label: "TV", noun: "TV shows" },
  { value: "person", label: "People", noun: "people" },
];

export function BrowsePage({ initialQuery = "" }: BrowsePageProps) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [mediaTypeFilter, setMediaTypeFilter] =
    useState<MediaTypeFilter>("all");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextQuery = query.trim();
      setDebouncedQuery(nextQuery);
      const url = new URL(window.location.href);
      if (nextQuery) url.searchParams.set("q", nextQuery);
      else url.searchParams.delete("q");
      window.history.replaceState({}, "", url);
    }, 200);

    return () => window.clearTimeout(timer);
  }, [query]);

  const {
    results: searchResults,
    isLoading,
    isError,
  } = useMultiSearch(debouncedQuery);

  const filteredResults = useMemo(() => {
    if (!searchResults) return null;
    return {
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
    };
  }, [mediaTypeFilter, searchResults]);

  const resultCount = filteredResults
    ? filteredResults.movieResults.length +
      filteredResults.tvResults.length +
      filteredResults.peopleResults.length
    : 0;

  return (
    <div className="min-h-screen">
      <header>
        <div className="site-container pt-8 md:pt-12">
          <h1 className="page-title">Search</h1>

          <div className="relative mt-5 max-w-3xl">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Movies, shows and people"
              aria-label="Search movies, TV shows and people"
              className={cn(fieldClass, "custom-search-clear min-h-14 py-3 pl-12 pr-14 text-lg")}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-md text-ink-muted hover:bg-surface-2 hover:text-ink"
                aria-label="Clear search"
              >
                <X aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="site-container py-6 md:py-8">
        {debouncedQuery ? (
          <>
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm text-muted-foreground">
                  Results for <span className="font-medium text-foreground">“{debouncedQuery}”</span>
                </h2>
                <p className="sr-only" aria-live="polite">
                  {isLoading
                    ? "Searching"
                    : `${resultCount} result${resultCount === 1 ? "" : "s"} found`}
                </p>
              </div>
              <SegmentedControl
                label="Filter search results"
                size="sm"
                options={mediaTypeOptions}
                value={mediaTypeFilter}
                onChange={setMediaTypeFilter}
              />
            </div>

            {isLoading ? (
              <div className="poster-grid" aria-busy="true" aria-label="Loading search results">
                {Array.from({ length: 8 }).map((_, index) => (
                  <MediaCardSkeleton key={index} />
                ))}
              </div>
            ) : isError ? (
              <SearchMessage>Search isn&apos;t responding. Check your connection and try again.</SearchMessage>
            ) : resultCount === 0 || !filteredResults ? (
              <SearchMessage>
                No {mediaTypeOptions.find((option) => option.value === mediaTypeFilter)?.noun} for “{debouncedQuery}”. Check the spelling, or try fewer words.
              </SearchMessage>
            ) : (
              <SearchResults results={filteredResults} />
            )}
          </>
        ) : (
          <SearchMessage>Type a title or a person&apos;s name.</SearchMessage>
        )}
      </div>
    </div>
  );
}

function SearchMessage({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-line bg-surface-1 px-6 py-14 text-center text-ink-muted">{children}</p>
  );
}
