import type { WatchProvider } from "@/lib/types";

/*
 * TMDB lists every way a title streams, so one show can appear as "Apple TV",
 * "Apple TV Amazon Channel", "Apple TV Roku Premium Channel" and so on. We only
 * want the services themselves: strip storefront-channel and plan-tier suffixes,
 * map known aliases to one brand name, and keep one entry per brand.
 */

const CHANNEL_SUFFIX =
  /\s+(?:on\s+)?(?:amazon(?:\s+prime)?(?:\s+video)?|apple\s+tv|roku(?:\s+premium)?|youtube(?:\s+tv)?|prime\s+video)\s+channels?$/i;
const TIER_SUFFIX =
  /\s+(?:(?:standard|basic|premium)\s+)?with\s+ads$|\s+(?:premium\s+plus|premium|essential|with\s+showtime|kids)$/i;

const BRANDS: [RegExp, string][] = [
  [/^(?:amazon\s+)?prime\s+video$|^amazon\s+video$/i, "Prime Video"],
  [/^(?:hbo\s+)?max$/i, "HBO Max"],
  [/^apple\s+tv(?:\s*\+|\s+plus)?$/i, "Apple TV"],
  [/^paramount(?:\s*\+|\s+plus)$/i, "Paramount+"],
  [/^disney(?:\s*\+|\s+plus)$/i, "Disney+"],
  [/^amc(?:\s*\+|\s+plus)$/i, "AMC+"],
  [/^mgm(?:\s*\+|\s+plus)$/i, "MGM+"],
  [/^peacock(?:\s+tv)?$/i, "Peacock"],
  [/^starz(?:\s+play)?$/i, "Starz"],
];

// Subscription services people pick a streamer by. Live-TV bundles and cable
// network apps (YouTube TV, Spectrum, TNT…) are only shown when a title
// streams nowhere else.
const MAJOR_SERVICES = new Set(
  [
    "Netflix",
    "Hulu",
    "Prime Video",
    "Disney+",
    "HBO Max",
    "Apple TV",
    "Paramount+",
    "Peacock",
    "Starz",
    "MGM+",
    "AMC+",
    "Crunchyroll",
    "Shudder",
    "BritBox",
    "Acorn TV",
    "Criterion Channel",
    "MUBI",
  ].map((name) => name.toLowerCase()),
);

export function baseServiceName(providerName: string): string {
  let name = providerName.trim();
  // Suffixes can stack ("Paramount Plus Premium Amazon Channel").
  for (let i = 0; i < 3; i++) {
    const next = name.replace(CHANNEL_SUFFIX, "").replace(TIER_SUFFIX, "").trim();
    if (next === name) break;
    name = next;
  }
  return BRANDS.find(([pattern]) => pattern.test(name))?.[1] ?? name;
}

export interface StreamingService {
  name: string;
  logo_path: string;
  provider_id: number;
}

/** One entry per streaming service, in TMDB's display order. */
export function streamingServices(providers: WatchProvider[] = []): StreamingService[] {
  const services = new Map<string, StreamingService & { priority: number; direct: boolean }>();

  for (const provider of [...providers].sort((a, b) => a.display_priority - b.display_priority)) {
    const name = baseServiceName(provider.provider_name);
    const direct = !CHANNEL_SUFFIX.test(provider.provider_name);
    const existing = services.get(name.toLowerCase());

    // Prefer the service's own listing (and logo) over a channel resale.
    if (!existing || (direct && !existing.direct)) {
      services.set(name.toLowerCase(), {
        name,
        logo_path: provider.logo_path,
        provider_id: provider.provider_id,
        priority: existing?.priority ?? provider.display_priority,
        direct,
      });
    }
  }

  const all = [...services.values()].sort((a, b) => a.priority - b.priority);
  const major = all.filter((service) => MAJOR_SERVICES.has(service.name.toLowerCase()));

  return (major.length ? major : all).map(({ name, logo_path, provider_id }) => ({
    name,
    logo_path,
    provider_id,
  }));
}
