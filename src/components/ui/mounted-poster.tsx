import Image from "next/image";
import { Film, MonitorPlay, User } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

const FALLBACK_ICONS = { movie: Film, tv: MonitorPlay, person: User };

interface MountedPosterProps {
  src: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  fallback: "movie" | "tv" | "person";
  className?: string;
}

/**
 * A poster in a page-coloured mat with a hairline edge, so it reads as a
 * print set apart from whatever sits behind it.
 */
export function MountedPoster({ src, alt, sizes, priority = false, fallback, className }: MountedPosterProps) {
  const Icon = FALLBACK_ICONS[fallback];

  return (
    <div className={cn("relative z-10 rounded-[9px] border border-line bg-page p-1.5", className)}>
      <div className="relative aspect-[2/3] overflow-hidden rounded-sm bg-surface-2">
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Icon className="size-1/4 text-ink-muted/50" aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  );
}
