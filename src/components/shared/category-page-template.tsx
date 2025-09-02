"use client";

import { MediaGrid } from "./media-grid";
import { PaginatedContent } from "@/components/ui/paginated-content";
import { BreadcrumbNavigation } from "@/components/ui/breadcrumb-navigation";
import { BackNavigation } from "@/components/ui/back-navigation";
import { usePaginatedData } from "@/hooks/usePaginatedData";

interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  vote_average: number;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
}

interface CategoryPageTemplateProps {
  title: string;
  description?: string;
  mediaType: "movie" | "tv";
  data: MediaItem[];
  isLoading: boolean;
  error: Error | null;
  totalPages: number;
  totalResults: number;
  breadcrumbParent?: string;
  breadcrumbParentHref?: string;
  useDataHook: (page: number) => {
    data: MediaItem[];
    isLoading: boolean;
    isError: Error | null;
    totalPages: number;
    totalResults: number;
  };
}

export function CategoryPageTemplate({
  title,
  description,
  mediaType,
  breadcrumbParent = "Home",
  breadcrumbParentHref = "/",
  useDataHook,
}: Omit<
  CategoryPageTemplateProps,
  "data" | "isLoading" | "error" | "totalPages" | "totalResults"
>) {
  const { currentPage, handlePageChange } = usePaginatedData();
  const { data, isLoading, isError, totalPages, totalResults } =
    useDataHook(currentPage);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <div className="container mx-auto px-4 pt-6 pb-4">
        <div className="flex items-center justify-between gap-4">
          <BreadcrumbNavigation
            items={[
              { label: breadcrumbParent, href: breadcrumbParentHref },
              { label: title, current: true },
            ]}
          />
          <BackNavigation fallbackHref={breadcrumbParentHref} />
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            {title}
          </h1>
          {description && (
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
              {description}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Grid */}
          <MediaGrid
            items={data}
            mediaType={mediaType}
            isLoading={isLoading}
            error={isError}
            cardSize="md"
            showYear={true}
            showRating={true}
          />

          {/* Pagination */}
          {!isLoading && !isError && totalPages > 1 && (
            <PaginatedContent
              currentPage={currentPage}
              totalPages={totalPages}
              totalResults={totalResults}
              onPageChange={handlePageChange}
              className="pt-8"
            />
          )}
        </div>
      </div>
    </div>
  );
}
