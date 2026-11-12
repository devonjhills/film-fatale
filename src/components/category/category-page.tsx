import type { Metadata } from "next";
import Link from "@/components/ui/app-link";
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
import { Panel, PanelNote } from "@/components/ui/panel";
import { segmentVariants } from "@/components/ui/segmented-control";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

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
      <header>
        <div className="site-container pt-8 md:pt-12">
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
                        className={segmentVariants({ selected: current })}
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

      <div className="site-container space-y-5 py-6 md:space-y-6 md:py-8">
        {result === null ? (
          <EmptyState title="This list didn't load" description="Refresh the page to try again." />
        ) : result.items.length === 0 ? (
          <EmptyState
            title="Nothing here"
            description={`No ${genreName ? `${genreName.toLowerCase()} ` : ""}${noun}${
              filters.decade ? ` from the ${filters.decade}s` : ""
            } in this list.`}
          >
            <Button variant="outline" asChild>
              <Link href={listHref(media, slug)}>Clear filters</Link>
            </Button>
          </EmptyState>
        ) : (
          <>
            <Panel
              title={[list.title, genreName, filters.decade && `${filters.decade}s`].filter(Boolean).join(" · ")}
              aside={
                result.totalPages > 1 && (
                  <PanelNote>
                    Page {filters.page} of {result.totalPages}
                  </PanelNote>
                )
              }
            >
              <MediaGrid items={result.items} mediaType={media} priorityCount={6} />
            </Panel>
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
