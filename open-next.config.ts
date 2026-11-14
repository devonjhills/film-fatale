import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";
import memoryQueue from "@opennextjs/cloudflare/overrides/queue/memory-queue";

// The Workers Free plan allows about 10 ms of CPU per request, and rendering a
// page takes several times that. So rendered pages and TMDB responses are kept
// in KV (with the edge cache in front), and a cached page is served without
// starting Next's renderer at all. Stale pages refresh in the background
// through a request the Worker makes to itself (WORKER_SELF_REFERENCE).
export default defineCloudflareConfig({
  incrementalCache: withRegionalCache(kvIncrementalCache, { mode: "long-lived" }),
  queue: memoryQueue,
  enableCacheInterception: true,
});
