"use client";

import { CategoryPage } from "@/components/category/category-page";
import { useTopRatedMovies } from "@/lib/hooks/api-hooks";
import { usePaginatedData } from "@/hooks/usePaginatedData";

export default function TopRatedMoviesPage() {
  const { currentPage, handlePageChange } = usePaginatedData();
  const { movies, isLoading, isError, totalPages, totalResults } =
    useTopRatedMovies(currentPage);

  return (
    <CategoryPage
      title="Top rated movies"
      description="The highest-rated films, as voted by TMDB members."
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
