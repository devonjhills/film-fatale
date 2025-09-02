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
    default: "animate-pulse bg-primary/10",
    shimmer:
      "relative overflow-hidden bg-primary/10 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
    pulse:
      "animate-pulse bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 bg-[length:200%_100%] animate-[gradient_1.5s_ease-in-out_infinite]",
    wave: "bg-primary/10 animate-[wave_1.5s_ease-in-out_infinite]",
  };

  const speeds = {
    slow: "[animation-duration:2s]",
    normal: "[animation-duration:1.5s]",
    fast: "[animation-duration:1s]",
  };

  return (
    <div
      className={cn("rounded-md", variants[variant], speeds[speed], className)}
      style={{
        backgroundSize: variant === "pulse" ? "200% 100%" : undefined,
      }}
      {...props}
    />
  );
}

// Film noir inspired skeleton for compact cards
function MediaCardSkeleton({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-[160px] h-[280px]",
    md: "w-[180px] h-[310px]",
    lg: "w-[200px] h-[340px]",
  };

  return (
    <div className={cn("group", sizeClasses[size])}>
      <div className="relative overflow-hidden rounded-lg shadow-lg bg-muted/50">
        {/* Poster skeleton with noir overlay */}
        <OptimizedSkeleton variant="shimmer" className="aspect-[2/3] w-full" />

        {/* Noir gradient overlay skeleton */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Rating skeleton */}
        <div className="absolute top-2 right-2">
          <OptimizedSkeleton
            className="h-6 w-12 rounded-md bg-muted"
            variant="shimmer"
          />
        </div>

        {/* Text overlay skeleton at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-3">
          <OptimizedSkeleton
            className="h-4 w-full mb-1 bg-muted"
            variant="shimmer"
          />
          <OptimizedSkeleton
            className="h-3 w-1/2 bg-amber-200/20"
            variant="shimmer"
          />
        </div>
      </div>
    </div>
  );
}

function HeroSectionSkeleton() {
  return (
    <div className="relative h-96 md:h-[500px] overflow-hidden bg-muted/20">
      {/* Background image skeleton */}
      <OptimizedSkeleton
        variant="shimmer"
        className="absolute inset-0"
        speed="slow"
      />

      {/* Content overlay skeleton */}
      <div className="absolute inset-0 flex items-center justify-center p-12 z-10">
        <div className="container mx-auto">
          <div className="bg-background/80 backdrop-blur-sm rounded-lg p-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-8">
              {/* Poster skeleton */}
              <OptimizedSkeleton
                className="w-36 md:w-48 aspect-[2/3] rounded-lg flex-shrink-0"
                variant="shimmer"
              />

              {/* Content skeleton */}
              <div className="flex-1 space-y-4">
                <OptimizedSkeleton
                  className="h-12 md:h-16 w-3/4"
                  variant="shimmer"
                />
                <div className="flex gap-3">
                  <OptimizedSkeleton className="h-6 w-16" variant="shimmer" />
                  <OptimizedSkeleton className="h-6 w-12" variant="shimmer" />
                </div>
                <div className="space-y-2">
                  <OptimizedSkeleton className="h-4 w-full" variant="shimmer" />
                  <OptimizedSkeleton className="h-4 w-5/6" variant="shimmer" />
                  <OptimizedSkeleton className="h-4 w-2/3" variant="shimmer" />
                </div>
                <OptimizedSkeleton className="h-10 w-32" variant="shimmer" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MediaSectionSkeleton({ cardCount = 6 }: { cardCount?: number }) {
  return (
    <div className="space-y-6">
      {/* Section header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <OptimizedSkeleton className="h-8 w-48" variant="shimmer" />
          <OptimizedSkeleton className="h-6 w-20" variant="shimmer" />
        </div>
        <OptimizedSkeleton className="h-6 w-16" variant="shimmer" />
      </div>

      {/* Cards grid skeleton - film noir layout max 6 columns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 justify-items-center px-2">
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
