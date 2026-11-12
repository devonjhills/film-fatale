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

const MAX_STREAM = 5;
const MAX_RENT = 3;

/**
 * Where a title can be watched in the US, as one bar along the bottom of the
 * detail header: subscription services, then rent or buy, each as a logo
 * and name, with a link to every option at the end.
 */
export function WhereToWatch({ providers, loading = false, className }: WhereToWatchProps) {
  const stream = streamingServices([...(providers?.flatrate ?? []), ...(providers?.ads ?? [])]).slice(
    0,
    MAX_STREAM,
  );
  const streamNames = new Set(stream.map((service) => service.name));
  const rentOrBuy = streamingServices([...(providers?.rent ?? []), ...(providers?.buy ?? [])])
    .filter((service) => !streamNames.has(service.name))
    .slice(0, MAX_RENT);
  const empty = stream.length === 0 && rentOrBuy.length === 0;

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
      ) : empty ? (
        <p className="text-sm text-ink-muted">Not streaming in the US right now.</p>
      ) : (
        <>
          <ServiceGroup label="Stream" services={stream} />
          <ServiceGroup label="Rent or buy" services={rentOrBuy} />
        </>
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

function ServiceGroup({ label, services }: { label: string; services: StreamingService[] }) {
  if (!services.length) return null;

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <span className="text-2xs font-medium text-ink-muted">{label}</span>
      <ul className="flex flex-wrap gap-1.5">
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
    </div>
  );
}
