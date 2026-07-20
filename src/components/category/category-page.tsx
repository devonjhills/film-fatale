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
      <header className="noir-page-header">
        <div className="site-container relative z-10 py-12 md:py-18">
          <div className="mb-8 flex items-center justify-between gap-4">
            <BreadcrumbNavigation
              items={[
                { label: breadcrumbParent, href: breadcrumbParentHref },
                { label: title, current: true },
              ]}
            />
            <BackNavigation fallbackHref={breadcrumbParentHref} />
          </div>
          <p className="dossier-label mb-5">{mediaType === "movie" ? "Film archive" : "Television archive"}</p>
          <h1 className="page-title">
            {title}
          </h1>
          {description && (
            <p className="page-lede mt-6">
              {description}
            </p>
          )}
        </div>
      </header>

      <div className="site-container py-12 md:py-16">
        <div className="space-y-10">
          <MediaGrid
            items={data}
            mediaType={mediaType}
            isLoading={isLoading}
            error={error}
            cardSize="md"
            showYear={true}
            showRating={true}
            priorityCount={6}
          />

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
