import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import memoryQueue from "@opennextjs/cloudflare/overrides/queue/memory-queue";
import edgeIncrementalCache from "./src/lib/edge-incremental-cache";

// The Workers Free plan allows about 10 ms of CPU per request, and rendering a
// page takes several times that. So rendered pages and TMDB responses are kept
// in the Cache API (see src/lib/edge-incremental-cache.ts for why not KV), and
// a cached page is served without starting Next's renderer at all. Stale pages
// refresh in the background through a request the Worker makes to itself
// (WORKER_SELF_REFERENCE).
export default defineCloudflareConfig({
  incrementalCache: edgeIncrementalCache,
  queue: memoryQueue,
  enableCacheInterception: true,
});
