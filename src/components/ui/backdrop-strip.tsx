import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * A title's backdrop as a short framed strip, dimmed evenly so it reads as
 * background. Nothing sits over it and its edges never fade.
 */
export function BackdropStrip({ src, className }: { src: string | null; className?: string }) {
  if (!src) return null;

  return (
    <div
      className={cn(
        "relative aspect-[5/2] overflow-hidden rounded-lg border border-line bg-surface-1 sm:aspect-[4/1]",
        className,
      )}
    >
      <Image
        src={src}
        alt=""
        fill
        priority
        fetchPriority="high"
        sizes="(max-width: 1440px) 100vw, 1440px"
        className="object-cover object-[center_25%] brightness-[.45] saturate-[.85]"
      />
    </div>
  );
}
