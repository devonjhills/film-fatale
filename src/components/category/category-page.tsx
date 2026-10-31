import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MediaGrid } from "@/components/shared/media-grid";
import { BrowseFilterControls } from "@/components/category/browse-filters";
import { PageLinks } from "@/components/category/page-links";
import {
  BROWSE_LISTS,
  browseHref,
  decadeOptions,
  fetchBrowsePage,
  genreOptions,
  getBrowseList,
  listHref,
  parseBrowseFilters,
  type MediaType,
} from "@/lib/browse";
import { GENRE_NAMES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export function categoryMetadata(media: MediaType, slug: string): Metadata {
  const list = getBrowseList(media, slug);
  const path = listHref(media, slug);
  return {
    title: list.title,
    description: list.description,
    alternates: { canonical: path },
    openGraph: { title: list.title, description: list.description, url: path },
  };
}

interface CategoryPageProps {
  media: MediaType;
  slug: string;
  searchParams: SearchParams;
}

/** A browsable list (popular, top rated, …) with genre and decade filters. */
export async function CategoryPage({ media, slug, searchParams }: CategoryPageProps) {
  const list = getBrowseList(media, slug);
  const filters = parseBrowseFilters(media, list, await searchParams);
  const result = await fetchBrowsePage(media, list, filters).catch(() => null);
  if (result && filters.page > 1 && filters.page > result.totalPages && result.totalPages > 0) {
    notFound();
  }

  const genreName = filters.genre
    ? GENRE_NAMES[media][filters.genre as keyof (typeof GENRE_NAMES)[typeof media]]
    : null;
  const noun = media === "movie" ? "movies" : "shows";

  return (
    <div className="min-h-screen">
      <header className="page-header">
        <div className="site-container py-8 md:py-10">
          <h1 className="page-title">{list.title}</h1>
          <p className="page-lede mt-2">{list.description}</p>

          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <nav aria-label={media === "movie" ? "Movie lists" : "TV lists"}>
              <ul className="flex flex-wrap gap-2">
                {BROWSE_LISTS[media].map((entry) => {
                  const current = entry.slug === slug;
                  return (
                    <li key={entry.slug}>
                      <Link
                        href={browseHref(media, entry.slug, {
                          genre: filters.genre,
                          decade: entry.current ? undefined : filters.decade,
                        })}
                        aria-current={current ? "page" : undefined}
                        className={cn(
                          "flex min-h-10 items-center rounded-sm border px-4 text-sm font-medium transition-colors",
                          current
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input text-muted-foreground hover:border-foreground/60 hover:text-foreground",
                        )}
                      >
                        {entry.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <BrowseFilterControls
              media={media}
              genres={genreOptions(media)}
              decades={list.current ? [] : decadeOptions()}
              genre={filters.genre}
              decade={filters.decade}
            />
          </div>
        </div>
      </header>

      <div className="site-container space-y-10 py-8 md:py-10">
        {result === null ? (
          <p className="py-16 text-center text-muted-foreground">
            This list didn&apos;t load. Refresh the page to try again.
          </p>
        ) : result.items.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-muted-foreground">
              No {genreName ? `${genreName.toLowerCase()} ` : ""}
              {noun}
              {filters.decade ? ` from the ${filters.decade}s` : ""} in this list.
            </p>
            <Link
              href={listHref(media, slug)}
              className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline"
            >
              Clear filters
            </Link>
          </div>
        ) : (
          <>
            <MediaGrid items={result.items} mediaType={media} priorityCount={6} />
            <PageLinks
              currentPage={filters.page}
              totalPages={result.totalPages}
              hrefFor={(page) => browseHref(media, slug, { ...filters, page })}
            />
          </>
        )}
      </div>
    </div>
  );
}
