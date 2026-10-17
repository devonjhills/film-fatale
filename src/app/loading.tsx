import {
  HeroSectionSkeleton,
  MediaSectionSkeleton,
} from "@/components/ui/optimized-skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen">
      <HeroSectionSkeleton />

      <div className="site-container space-y-20 py-16 md:space-y-24 md:py-24">
        <MediaSectionSkeleton cardCount={16} />


        <MediaSectionSkeleton cardCount={16} />
      </div>
    </div>
  );
}
