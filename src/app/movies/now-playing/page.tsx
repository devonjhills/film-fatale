"use client";

import { CategoryPage } from "@/components/category/category-page";
import { useNowPlayingMovies } from "@/lib/hooks/api-hooks";
import { usePaginatedData } from "@/hooks/usePaginatedData";

export default function NowPlayingMoviesPage() {
  const { currentPage, handlePageChange } = usePaginatedData();
  const { movies, isLoading, isError, totalPages, totalResults } =
    useNowPlayingMovies(currentPage);

  return (
    <CategoryPage
      title="Now Playing Movies"
      description="Check out the latest movies currently playing in theaters near you."
      mediaType="movie"
      data={movies}
      isLoading={isLoading}
      error={isError}
      totalPages={totalPages}
      totalResults={totalResults}
      currentPage={currentPage}
      onPageChange={handlePageChange}
      breadcrumbParent="Movies"
      breadcrumbParentHref="/"
    />
  );
}
