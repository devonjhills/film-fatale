import Image from "next/image";
import { getImageUrl } from "@/lib/api";
import { streamingServices } from "@/lib/watch-providers";
import { cn } from "@/lib/utils";
import type { WatchProviderRegion } from "@/lib/types";

interface StreamingOnProps {
  providers?: WatchProviderRegion;
  className?: string;
}

/**
 * Base streaming services (no storefront channels or plan tiers) and a link
 * to every option. Unlabelled: the fact row it sits in says "Stream on".
 */
export function StreamingOn({ providers, className }: StreamingOnProps) {
  const services = streamingServices(providers?.flatrate);
  if (!services.length) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <ul className="flex flex-wrap gap-1.5">
        {services.map((service) => (
          <li
            key={service.name}
            className="flex h-7 items-center gap-1.5 rounded-md border border-line bg-surface-2 pl-1 pr-2 text-ui"
          >
            <Image
              src={getImageUrl(service.logo_path, "logo", "w92")}
              alt=""
              width={20}
              height={20}
              className="size-5 rounded-[3px]"
            />
            {service.name}
          </li>
        ))}
      </ul>
      {providers?.link && (
        <a
          href={providers.link}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 text-ui text-ink-muted underline underline-offset-4 hover:text-ink"
        >
          All options
        </a>
      )}
    </div>
  );
}
