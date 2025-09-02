"use client";

import { MediaGrid } from "@/components/shared/media-grid";
import { PaginatedContent } from "@/components/ui/paginated-content";
import { BreadcrumbNavigation } from "@/components/ui/breadcrumb-navigation";
import { BackNavigation } from "@/components/ui/back-navigation";

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

interface CategoryPageProps {
  title: string;
  description?: string;
  mediaType: "movie" | "tv";
  data: MediaItem[];
  isLoading: boolean;
  error: Error | null;
  totalPages: number;
  totalResults: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  breadcrumbParent?: string;
  breadcrumbParentHref?: string;
}

export function CategoryPage({
  title,
  description,
  mediaType,
  data,
  isLoading,
  error,
  totalPages,
  totalResults,
  currentPage,
  onPageChange,
  breadcrumbParent = "Home",
  breadcrumbParentHref = "/",
}: CategoryPageProps) {
  // Combine local page change handler with external handler
  const handlePageChange = (page: number) => {
    onPageChange(page);
  };

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
            error={error}
            cardSize="md"
            showYear={true}
            showRating={true}
          />

          {/* Pagination */}
          {!isLoading && !error && totalPages > 1 && (
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
