"use client";

import { MediaGrid } from "@/components/shared/media-grid";
import { CATEGORY_PAGE_SIZE } from "@/lib/hooks/api-hooks";
import { PaginatedContent } from "@/components/ui/paginated-content";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const CATEGORIES = {
  movie: [
    { href: "/movies/now-playing", label: "Now playing" },
    { href: "/movies/popular", label: "Popular" },
    { href: "/movies/top-rated", label: "Top rated" },
  ],
  tv: [
    { href: "/tv/on-the-air", label: "On the air" },
    { href: "/tv/popular", label: "Popular" },
    { href: "/tv/top-rated", label: "Top rated" },
  ],
};

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
}: CategoryPageProps) {
  const pathname = usePathname();
  // Combine local page change handler with external handler
  const handlePageChange = (page: number) => {
    onPageChange(page);
  };

  return (
    <div className="min-h-screen">
      <header className="page-header">
        <div className="site-container py-10 md:py-14">
          <h1 className="page-title">
            {title}
          </h1>
          {description && (
            <p className="page-lede mt-4">
              {description}
            </p>
          )}
          <nav aria-label={mediaType === "movie" ? "Movie lists" : "TV lists"} className="mt-8">
            <ul className="flex flex-wrap gap-2">
              {CATEGORIES[mediaType].map((category) => {
                const current = pathname === category.href;
                return (
                  <li key={category.href}>
                    <Link
                      href={category.href}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "flex min-h-10 items-center rounded-sm border px-4 text-sm font-medium transition-colors",
                        current
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input text-muted-foreground hover:border-foreground/60 hover:text-foreground",
                      )}
                    >
                      {category.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </header>

      <div className="site-container py-10 md:py-14">
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
              pageSize={CATEGORY_PAGE_SIZE}
              className="pt-8"
            />
          )}
        </div>
      </div>
    </div>
  );
}
