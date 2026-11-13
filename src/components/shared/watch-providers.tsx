import Image from "next/image";
import { ExternalLink } from "@/components/ui/icons";
import { getImageUrl } from "@/lib/api";
import { streamingServices, type StreamingService } from "@/lib/watch-providers";
import { cn } from "@/lib/utils";
import type { WatchProviderRegion } from "@/lib/types";

interface WhereToWatchProps {
  providers?: WatchProviderRegion;
  /** Still waiting on the providers request. */
  loading?: boolean;
  className?: string;
}

const MAX_SERVICES = 6;

/**
 * Where a title can be streamed in the US, as one bar along the bottom of the
 * detail header: each subscription service as a logo and name, with a link
 * to every option at the end. Rent and buy are left out; nearly every film
 * can be rented or bought, so listing them says nothing.
 */
export function WhereToWatch({ providers, loading = false, className }: WhereToWatchProps) {
  const services = streamingServices([...(providers?.flatrate ?? []), ...(providers?.ads ?? [])]).slice(
    0,
    MAX_SERVICES,
  );

  return (
    <section
      aria-labelledby="where-to-watch"
      className={cn(
        "flex min-h-16 flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6 lg:px-8",
        className,
      )}
    >
      <h2 id="where-to-watch" className="basis-full text-ui font-semibold text-ink sm:basis-auto">
        Where to watch
      </h2>

      {loading ? (
        <div className="flex gap-2" aria-busy="true">
          <div className="h-9 w-28 animate-pulse rounded-md bg-surface-2" />
          <div className="h-9 w-24 animate-pulse rounded-md bg-surface-2" />
        </div>
      ) : services.length === 0 ? (
        <p className="text-sm text-ink-muted">Not streaming in the US right now.</p>
      ) : (
        <ServiceList services={services} />
      )}

      {!loading && providers?.link && (
        <a
          href={providers.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 text-ui text-ink-muted transition-colors duration-150 hover:text-ink sm:ml-auto"
        >
          All options on JustWatch
          <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
      )}
    </section>
  );
}

function ServiceList({ services }: { services: StreamingService[] }) {
  return (
    <ul className="flex min-w-0 flex-wrap gap-1.5">
      {services.map((service) => (
        <li
          key={service.name}
          className="flex h-9 items-center gap-2 rounded-md border border-line bg-surface-2 pl-1 pr-3 text-ui font-medium text-ink"
        >
          <Image
            src={getImageUrl(service.logo_path, "logo", "w92")}
            alt=""
            width={28}
            height={28}
            className="size-7 shrink-0 rounded-[5px]"
          />
          {service.name}
        </li>
      ))}
    </ul>
  );
}
