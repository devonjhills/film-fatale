"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Clapperboard,
  Search,
  X,
  type Icon,
} from "@/components/ui/icons";
import { useMultiSearch } from "@/lib/hooks/api-hooks";
import { SearchResults } from "./search-results";
import { Button } from "@/components/ui/button";
import { BreadcrumbNavigation } from "@/components/ui/breadcrumb-navigation";
import { BackNavigation } from "@/components/ui/back-navigation";

interface BrowsePageProps {
  initialQuery?: string;
}

type MediaTypeFilter = "all" | "movie" | "tv" | "person";

const mediaTypeOptions: { value: MediaTypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "movie", label: "Movies" },
  { value: "tv", label: "TV" },
  { value: "person", label: "People" },
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
      <header className="noir-page-header">
        <div className="site-container py-10 md:py-14">
          <div className="mb-8 flex items-center justify-between gap-4">
            <BreadcrumbNavigation items={[{ label: "Search", current: true }]} />
            <BackNavigation fallbackHref="/" />
          </div>
          <p className="eyebrow mb-4">Search the archive</p>
          <h1 className="font-serif text-4xl font-semibold tracking-[-0.035em] sm:text-5xl md:text-6xl">
            Find your next obsession
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
            Search films, television, and the people behind them.
          </p>

          <div className="relative mt-8 max-w-4xl">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="A title, actor, or director…"
              aria-label="Search films, TV shows, and people"
              className="min-h-16 w-full rounded-md border border-input bg-card/90 py-3 pl-12 pr-14 text-lg text-foreground shadow-[0_18px_50px_oklch(0_0_0/0.25)] placeholder:text-muted-foreground focus:border-ring focus:outline-none md:text-xl"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="Clear search"
              >
                <X aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="site-container py-10 md:py-14">
        {debouncedQuery ? (
          <>
            <div className="mb-10 flex flex-col gap-5 border-b border-border/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Results for</p>
                <h2 className="mt-1 font-serif text-3xl font-semibold">
                  “{debouncedQuery}”
                </h2>
                <p className="sr-only" aria-live="polite">
                  {isLoading
                    ? "Searching"
                    : `${resultCount} result${resultCount === 1 ? "" : "s"} found`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2" aria-label="Filter search results">
                {mediaTypeOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={mediaTypeFilter === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMediaTypeFilter(option.value)}
                    aria-pressed={mediaTypeFilter === option.value}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 gap-4 min-[480px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-6" aria-label="Loading search results">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div key={index} className="aspect-[2/3] animate-pulse rounded-md bg-muted" />
                ))}
              </div>
            ) : isError ? (
              <SearchState
                icon={AlertTriangle}
                title="The search went cold"
                description="Something interrupted the search. Try again in a moment."
              />
            ) : resultCount === 0 ? (
              <SearchState
                icon={Search}
                title="No trace found"
                description="Try another title, a broader name, or a different result type."
              />
            ) : (
              <SearchResults results={filteredResults} />
            )}
          </>
        ) : (
          <SearchState
            icon={Clapperboard}
            title="The archive is waiting"
            description="Start with a title, performer, or filmmaker."
          />
        )}
      </div>
    </div>
  );
}

function SearchState({
  icon: Icon,
  title,
  description,
}: {
  icon: Icon;
  title: string;
  description: string;
}) {
  return (
    <div className="surface-panel mx-auto max-w-xl px-6 py-14 text-center">
      <Icon className="mx-auto size-10 text-primary" aria-hidden="true" />
      <h2 className="mt-5 font-serif text-3xl font-semibold">{title}</h2>
      <p className="mx-auto mt-3 max-w-md leading-7 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
