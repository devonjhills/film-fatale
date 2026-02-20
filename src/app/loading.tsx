import {
  HeroSectionSkeleton,
  MediaSectionSkeleton,
} from "@/components/ui/optimized-skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero — no extra wrapper, matches RotatingHeroSection */}
      <HeroSectionSkeleton />

      {/* Content sections — matches page.tsx container exactly */}
      <div className="container mx-auto px-4 space-y-20 pb-24">
        <MediaSectionSkeleton cardCount={12} />

        <div className="h-px bg-border w-full opacity-20" />

        <MediaSectionSkeleton cardCount={12} />
      </div>
    </div>
  );
}
