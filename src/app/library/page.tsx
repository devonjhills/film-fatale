"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { ViewingHistoryItem, WatchStatus } from "@/lib/types";
import { ViewingHistoryGrid } from "@/components/library/viewing-history-grid";
import { ViewingHistoryFilters } from "@/components/library/viewing-history-filters";
import { CurrentlyWatchingSection } from "@/components/library/currently-watching-section";
import { useAuth } from "@/hooks/useAuth";
import { redirect } from "next/navigation";
import { BreadcrumbNavigation } from "@/components/ui/breadcrumb-navigation";
import { BackNavigation } from "@/components/ui/back-navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function MyLibraryPage() {
  const { user, loading: isLoading } = useAuth();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab") || searchParams.get("status");
  const initialTab =
    requestedTab &&
    ["watching", "plan_to_watch", "completed", "all"].includes(requestedTab)
      ? requestedTab
      : "watching";
  const requestedMediaType = searchParams.get("media_type");
  const initialMediaType =
    requestedMediaType === "movie" || requestedMediaType === "tv"
      ? requestedMediaType
      : "all";
  const [viewingHistory, setViewingHistory] = useState<ViewingHistoryItem[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: initialTab as WatchStatus | "all",
    mediaType: initialMediaType as "movie" | "tv" | "all",
  });
  const [activeTab, setActiveTab] = useState(initialTab);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Redirect if not authenticated
  if (!isLoading && !user) {
    redirect("/signin");
  }

  const fetchViewingHistory = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filters.status !== "all") params.append("status", filters.status);
      if (filters.mediaType !== "all")
        params.append("media_type", filters.mediaType);
      params.append("page", page.toString());
      params.append("limit", "20");

      const response = await fetch(`/api/viewing-history?${params}`);
      if (!response.ok) throw new Error("Failed to fetch viewing history");

      const data = await response.json();
      setViewingHistory(data.items);
      setTotalPages(data.totalPages);
      setError(null);
    } catch (error) {
      console.error("Error fetching viewing history:", error);
      setError("Failed to load viewing history");
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.mediaType, page]);

  useEffect(() => {
    if (!user) return;
    const timer = window.setTimeout(() => {
      void fetchViewingHistory();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [user, fetchViewingHistory]);

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setFilters({
      status: value as WatchStatus | "all",
      mediaType: "all",
    });
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="site-container py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="noir-page-header">
        <div className="site-container py-10 md:py-14">
          <div className="mb-8 flex items-center justify-between gap-4">
            <BreadcrumbNavigation
              items={[{ label: "My Library", current: true }]}
            />
            <BackNavigation fallbackHref="/" />
          </div>

          <div>
            <p className="eyebrow mb-4">Private collection</p>
            <h1 className="font-serif text-4xl font-semibold tracking-[-0.035em] sm:text-5xl md:text-6xl">
              My Library
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              Pick up where you left off, keep a watchlist, and remember every
              story worth keeping.
            </p>
          </div>
        </div>
      </header>

      <div className="site-container py-10 md:py-14">
        <div className="space-y-8">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <div className="overflow-x-auto pb-1">
              <TabsList className="grid min-w-[32rem] grid-cols-4 sm:min-w-0 sm:max-w-2xl">
                <TabsTrigger value="watching">
                  Watching
                </TabsTrigger>
                <TabsTrigger value="plan_to_watch">
                  Want to watch
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Watched
                </TabsTrigger>
                <TabsTrigger value="all">
                  All
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="mt-8">
              {error ? (
                <Card className="border-destructive">
                  <CardContent className="p-8 text-center">
                    <div className="space-y-3">
                      <p className="text-destructive font-medium">{error}</p>
                      <Button
                        onClick={fetchViewingHistory}
                        variant="outline"
                        size="sm"
                      >
                        Try again
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : activeTab === "watching" ? (
                <CurrentlyWatchingSection
                  items={viewingHistory}
                  loading={loading}
                  onRefresh={fetchViewingHistory}
                />
              ) : (
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-5">
                      <ViewingHistoryFilters
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        hideStatus
                      />
                    </CardContent>
                  </Card>
                  <ViewingHistoryGrid
                    items={viewingHistory}
                    loading={loading}
                    onRefresh={fetchViewingHistory}
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    mediaTypeFilter={filters.mediaType}
                  />
                </div>
              )}
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
