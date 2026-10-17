"use client";

import { CategoryPage } from "@/components/category/category-page";
import { useTopRatedTVShows } from "@/lib/hooks/api-hooks";
import { usePaginatedData } from "@/hooks/usePaginatedData";

export default function TopRatedTVShowsPage() {
  const { currentPage, handlePageChange } = usePaginatedData();
  const { tvShows, isLoading, isError, totalPages, totalResults } =
    useTopRatedTVShows(currentPage);

  return (
    <CategoryPage
      title="Top rated shows"
      description="The highest-rated series, as voted by TMDB members."
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
