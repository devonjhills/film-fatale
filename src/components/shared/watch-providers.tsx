import Image from "next/image";
import { ExternalLink } from "@/components/ui/icons";
import { getImageUrl } from "@/lib/api";
import { streamingServices } from "@/lib/watch-providers";
import { cn } from "@/lib/utils";
import type { WatchProviderRegion } from "@/lib/types";

interface WhereToWatchProps {
  providers?: WatchProviderRegion;
  /** Still waiting on the providers request. */
  loading?: boolean;
  className?: string;
}

const MAX_SERVICES = 4;

/**
 * Where a title can be streamed in the US, as a compact box under the score
 * in the detail header: each subscription service as a logo and name, then
 * a link to every option. Rent and buy are left out; nearly every film can
 * be rented or bought, so listing them says nothing.
 */
export function WhereToWatch({ providers, loading = false, className }: WhereToWatchProps) {
  const all = streamingServices([...(providers?.flatrate ?? []), ...(providers?.ads ?? [])]);
  const services = all.slice(0, MAX_SERVICES);
  const more = all.length - services.length;

  return (
    <section
      aria-labelledby="where-to-watch"
      className={cn("rounded-lg border border-line bg-surface-1 px-4 py-3", className)}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="where-to-watch" className="text-2xs font-medium text-ink-muted">
          Where to watch
        </h2>
        {!loading && providers?.link && (
          <a
            href={providers.link}
            target="_blank"
            rel="noopener noreferrer"
            className="-my-3 inline-flex min-h-11 items-center gap-1 text-2xs text-ink-muted transition-colors duration-150 hover:text-ink"
          >
            All options
            <ExternalLink className="size-3" aria-hidden="true" />
            <span className="sr-only"> on JustWatch (opens in a new tab)</span>
          </a>
        )}
      </div>

      {loading ? (
        <div className="mt-2 space-y-1.5" aria-busy="true">
          <div className="h-8 w-3/4 animate-pulse rounded-md bg-surface-2" />
          <div className="h-8 w-1/2 animate-pulse rounded-md bg-surface-2" />
        </div>
      ) : services.length === 0 ? (
        <p className="mt-1.5 text-sm text-ink">Not streaming right now</p>
      ) : (
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2 lg:flex-col">
          {services.map((service) => (
            <li key={service.name} className="flex min-w-0 items-center gap-2.5 text-sm font-medium text-ink">
              <Image
                src={getImageUrl(service.logo_path, "logo", "w92")}
                alt=""
                width={28}
                height={28}
                className="size-7 shrink-0 rounded-[6px] border border-line"
              />
              <span className="truncate">{service.name}</span>
            </li>
          ))}
          {more > 0 && <li className="text-ui text-ink-muted">and {more} more</li>}
        </ul>
      )}
    </section>
  );
}
