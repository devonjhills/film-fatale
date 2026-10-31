import Link from "next/link";
import { ChevronLeft, ChevronRight } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

interface PageLinksProps {
  currentPage: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}

/** First, last and two pages either side of the current one, with gaps. */
function visiblePages(current: number, total: number): (number | "gap")[] {
  const pages: (number | "gap")[] = [];
  for (let page = 1; page <= total; page++) {
    if (page === 1 || page === total || Math.abs(page - current) <= 2) {
      pages.push(page);
    } else if (pages.at(-1) !== "gap") {
      pages.push("gap");
    }
  }
  return pages;
}

const itemClass =
  "flex min-h-10 min-w-10 items-center justify-center gap-1 rounded-sm px-3 text-sm font-medium transition-colors";

/** Pagination as plain links, so every page has its own URL. */
export function PageLinks({ currentPage, totalPages, hrefFor }: PageLinksProps) {
  if (totalPages <= 1) return null;

  const previous = currentPage > 1 ? currentPage - 1 : null;
  const next = currentPage < totalPages ? currentPage + 1 : null;

  return (
    <nav aria-label="Pages" className="flex justify-center pt-4">
      <ul className="flex flex-wrap items-center justify-center gap-1">
        <li>
          {previous ? (
            <Link href={hrefFor(previous)} className={cn(itemClass, "text-muted-foreground hover:bg-accent hover:text-foreground")}>
              <ChevronLeft className="size-4" aria-hidden="true" />
              Previous
            </Link>
          ) : null}
        </li>
        {visiblePages(currentPage, totalPages).map((page, index) => (
          <li key={page === "gap" ? `gap-${index}` : page} className="hidden sm:block">
            {page === "gap" ? (
              <span className="px-1 text-muted-foreground" aria-hidden="true">
                …
              </span>
            ) : (
              <Link
                href={hrefFor(page)}
                aria-current={page === currentPage ? "page" : undefined}
                aria-label={`Page ${page}`}
                className={cn(
                  itemClass,
                  "tabular-nums",
                  page === currentPage
                    ? "border border-input text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {page}
              </Link>
            )}
          </li>
        ))}
        <li className="px-3 text-sm tabular-nums text-muted-foreground sm:hidden">
          Page {currentPage} of {totalPages}
        </li>
        <li>
          {next ? (
            <Link href={hrefFor(next)} className={cn(itemClass, "text-muted-foreground hover:bg-accent hover:text-foreground")}>
              Next
              <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          ) : null}
        </li>
      </ul>
    </nav>
  );
}
