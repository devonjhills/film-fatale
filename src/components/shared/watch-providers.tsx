import Image from "next/image";
import { getImageUrl } from "@/lib/api";
import { streamingServices } from "@/lib/watch-providers";
import { cn } from "@/lib/utils";
import type { WatchProviderRegion } from "@/lib/types";

interface StreamingOnProps {
  providers?: WatchProviderRegion;
  className?: string;
}

/** "Stream on" list of base services (no storefront channels or plan tiers). */
export function StreamingOn({ providers, className }: StreamingOnProps) {
  const services = streamingServices(providers?.flatrate);
  if (!services.length) return null;

  return (
    <div className={cn("border-t border-border pt-4", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm text-muted-foreground">Stream on</p>
        {providers?.link && (
          <a
            href={providers.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            All options
          </a>
        )}
      </div>
      <ul className="mt-3 flex flex-wrap gap-2">
        {services.map((service) => (
          <li
            key={service.name}
            className="flex items-center gap-2 rounded-sm border border-input py-1 pl-1 pr-2.5 text-sm"
          >
            <Image
              src={getImageUrl(service.logo_path, "logo", "w92")}
              alt=""
              width={24}
              height={24}
              className="size-6 rounded-[3px]"
            />
            {service.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
