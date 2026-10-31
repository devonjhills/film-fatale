import { Skeleton } from "@/components/ui/skeleton";

// Mirrors MediaCard: 2:3 poster, title, then year and rating.
function MediaCardSkeleton() {
  return (
    <div className="poster-card">
      <Skeleton className="aspect-[2/3] w-full rounded-none" />
      <div className="poster-card-body">
        <Skeleton className="h-3.5 w-4/5 rounded-sm" />
        <Skeleton className="mt-1 h-3 w-1/3 rounded-sm" />
      </div>
    </div>
  );
}

// Mirrors a list page: title and lede over a full grid.
function PosterPageSkeleton() {
  return (
    <div className="min-h-screen" aria-busy="true">
      <div className="page-header">
        <div className="site-container space-y-3 py-8 md:py-10">
          <Skeleton className="h-9 w-56 rounded-sm md:h-11" />
          <Skeleton className="h-4 w-72 max-w-full rounded-sm" />
        </div>
      </div>
      <div className="site-container py-8 md:py-10">
        <div className="poster-grid">
          {Array.from({ length: 16 }).map((_, i) => (
            <MediaCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export { MediaCardSkeleton, PosterPageSkeleton };
