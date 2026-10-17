"use client";

import { cn } from "@/lib/utils";

interface OptimizedSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "shimmer" | "pulse" | "wave";
  speed?: "slow" | "normal" | "fast";
}

function OptimizedSkeleton({
  className,
  variant = "shimmer",
  speed = "normal",
  ...props
}: OptimizedSkeletonProps) {
  const variants = {
    default: "animate-pulse bg-muted",
    shimmer: "animate-pulse bg-muted",
    pulse: "animate-pulse bg-muted",
    wave: "animate-pulse bg-muted",
  };

  const speeds = {
    slow: "[animation-duration:2s]",
    normal: "[animation-duration:1.5s]",
    fast: "[animation-duration:1s]",
  };

  return (
    <div
      className={cn("rounded-md", variants[variant], speeds[speed], className)}
      {...props}
    />
  );
}

// Mirrors MediaCard: 2:3 poster, title, then year and rating.
function MediaCardSkeleton() {
  return (
    <div className="poster-card">
      <OptimizedSkeleton className="aspect-[2/3] w-full rounded-none" />
      <div className="poster-card-body">
        <OptimizedSkeleton className="h-3.5 w-4/5 rounded-sm" />
        <OptimizedSkeleton className="mt-1 h-3 w-1/3 rounded-sm" />
      </div>
    </div>
  );
}

// Mirrors RotatingHeroSection: min-h-[34rem] md:min-h-[42rem], content at bottom-left
function HeroSectionSkeleton() {
  return (
    <div className="relative h-[34rem] md:h-[42rem] overflow-hidden">
      {/* Full background shimmer */}
      <OptimizedSkeleton
        variant="shimmer"
        speed="slow"
        className="absolute inset-0 rounded-none"
      />

      {/* Gradient overlays matching the real hero */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Content anchored at bottom-left, matching real hero layout */}
      <div className="absolute inset-0 flex items-end p-6 md:p-12">
        <div className="site-container">
          <div className="max-w-4xl space-y-4">
            {/* Title skeleton */}
            <div className="space-y-2">
              <OptimizedSkeleton className="h-10 md:h-14 lg:h-16 w-2/3 bg-white/15" variant="shimmer" />
              <OptimizedSkeleton className="h-10 md:h-14 lg:h-16 w-1/2 bg-white/15" variant="shimmer" />
            </div>
            {/* Badges */}
            <div className="flex gap-3">
              <OptimizedSkeleton className="h-6 w-16 rounded-full bg-white/15" variant="shimmer" />
              <OptimizedSkeleton className="h-6 w-12 rounded-full bg-white/15" variant="shimmer" />
            </div>
            {/* Buttons */}
            <div className="flex gap-3">
              <OptimizedSkeleton className="h-10 w-32 bg-white/15" variant="shimmer" />
              <OptimizedSkeleton className="h-10 w-28 bg-white/15" variant="shimmer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mirrors MediaSection: title row with a rule, then the shared poster grid.
function MediaSectionSkeleton({ cardCount = 16 }: { cardCount?: number }) {
  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between border-b border-border pb-3">
        <OptimizedSkeleton className="h-8 w-44 rounded-sm md:h-9 md:w-56" />
        <OptimizedSkeleton className="h-4 w-14 rounded-sm" />
      </div>

      <div className="poster-grid poster-grid-two-rows">
        {Array.from({ length: cardCount }).map((_, i) => (
          <MediaCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export {
  OptimizedSkeleton,
  MediaCardSkeleton,
  HeroSectionSkeleton,
  MediaSectionSkeleton,
};
