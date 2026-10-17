"use client";

import { CategoryPage } from "@/components/category/category-page";
import { usePopularMovies } from "@/lib/hooks/api-hooks";
import { usePaginatedData } from "@/hooks/usePaginatedData";

export default function PopularMoviesPage() {
  const { currentPage, handlePageChange } = usePaginatedData();
  const { movies, isLoading, isError, totalPages, totalResults } =
    usePopularMovies(currentPage);

  return (
    <CategoryPage
      title="Popular movies"
      description="What people are watching right now."
      mediaType="movie"
      data={movies}
      isLoading={isLoading}
      error={isError}
      totalPages={totalPages}
      totalResults={totalResults}
      currentPage={currentPage}
      onPageChange={handlePageChange}
    />
  );
}
