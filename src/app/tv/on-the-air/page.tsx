"use client";

import { CategoryPage } from "@/components/category/category-page";
import { useOnTheAirTVShows } from "@/lib/hooks/api-hooks";
import { usePaginatedData } from "@/hooks/usePaginatedData";

export default function OnTheAirTVShowsPage() {
  const { currentPage, handlePageChange } = usePaginatedData();
  const { tvShows, isLoading, isError, totalPages, totalResults } =
    useOnTheAirTVShows(currentPage);

  return (
    <CategoryPage
      title="On the air"
      description="Shows with new episodes airing now."
      mediaType="tv"
      data={tvShows}
      isLoading={isLoading}
      error={isError}
      totalPages={totalPages}
      totalResults={totalResults}
      currentPage={currentPage}
      onPageChange={handlePageChange}
    />
  );
}
