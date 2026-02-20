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
    shimmer: "shimmer rounded-md",
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

// Mirrors MediaCard exactly: aspect-[2/3] poster + text below
function MediaCardSkeleton({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-full max-w-[160px] mx-auto",
    md: "w-full max-w-[170px] mx-auto",
    lg: "w-full max-w-[180px] mx-auto",
  };

  return (
    <div className={cn(sizeClasses[size], "h-full")}>
      <div className="space-y-3 h-full flex flex-col">
        {/* Poster — exact aspect ratio match */}
        <div className="relative aspect-[2/3] overflow-hidden rounded-md flex-shrink-0">
          <OptimizedSkeleton variant="shimmer" className="absolute inset-0 rounded-md" />
          {/* Rating badge position */}
          <div className="absolute top-2 right-2">
            <OptimizedSkeleton className="h-5 w-10 rounded" variant="shimmer" />
          </div>
        </div>

        {/* Title + year — below the poster, same as real card */}
        <div className="space-y-1.5 flex-grow">
          <OptimizedSkeleton className="h-[14px] w-full" variant="shimmer" />
          <OptimizedSkeleton className="h-[14px] w-3/4" variant="shimmer" />
          <OptimizedSkeleton className="h-[11px] w-1/3 mt-0.5" variant="shimmer" />
        </div>
      </div>
    </div>
  );
}

// Mirrors RotatingHeroSection exactly: h-[420px] md:h-[620px] lg:h-[720px], content at bottom-left
function HeroSectionSkeleton() {
  return (
    <div className="relative h-[420px] md:h-[620px] lg:h-[720px] overflow-hidden">
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
        <div className="container mx-auto">
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

// Grid columns match MediaGrid defaults: grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6
function MediaSectionSkeleton({ cardCount = 6 }: { cardCount?: number }) {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Section header — matches MediaSection header layout */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <OptimizedSkeleton className="h-8 w-44 md:h-9 md:w-56" variant="shimmer" />
          <OptimizedSkeleton className="h-6 w-20 rounded-full" variant="shimmer" />
        </div>
        <OptimizedSkeleton className="h-9 w-24 rounded-md" variant="shimmer" />
      </div>

      {/* Cards grid — same breakpoints as MediaGrid default columns */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 sm:gap-5 md:gap-6 lg:gap-8 justify-items-center">
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
