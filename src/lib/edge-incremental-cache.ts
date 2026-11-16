import type {
  CacheEntryType,
  CacheValue,
  IncrementalCache,
  WithLastModified,
} from "@opennextjs/aws/types/overrides.js";

/**
 * OpenNext's page and fetch cache, kept in Cloudflare's Cache API.
 *
 * KV's free tier allows 1,000 writes a day for the whole account, and crawlers
 * opening thousands of new pages used that up by mid-afternoon, which also
 * broke deploys (they pre-fill KV). The Cache API has no daily limits. It is
 * per data centre and can evict entries, which suits a site with one main
 * reader: their nearby data centre keeps their pages, and a miss only means
 * the page renders again. Next decides freshness from `lastModified`, so
 * entries are kept long and stale ones refresh in the background.
 */

const KEEP_SECONDS = 30 * 86400;

type Entry<CacheType extends CacheEntryType> = WithLastModified<CacheValue<CacheType>>;

let opened: Promise<Cache> | undefined;
const store = () => (opened ??= caches.open("opennext-incremental-cache"));

function urlFor(key: string, cacheType: CacheEntryType = "cache") {
  const buildId = process.env.OPEN_NEXT_BUILD_ID ?? "no-build-id";
  return `https://incremental-cache.internal/${buildId}/${cacheType}/${encodeURIComponent(key)}`;
}

class EdgeIncrementalCache implements IncrementalCache {
  readonly name = "edge-incremental-cache";

  async get<CacheType extends CacheEntryType = "cache">(
    key: string,
    cacheType?: CacheType,
  ): Promise<Entry<CacheType> | null> {
    try {
      const response = await (await store()).match(urlFor(key, cacheType));
      return response ? ((await response.json()) as Entry<CacheType>) : null;
    } catch (error) {
      console.error("Edge cache read failed", error);
      return null;
    }
  }

  async set<CacheType extends CacheEntryType = "cache">(
    key: string,
    value: CacheValue<CacheType>,
    cacheType?: CacheType,
  ): Promise<void> {
    try {
      // Date.now() in a Worker is the time of the last I/O, close enough here.
      const body = JSON.stringify({ value, lastModified: Date.now() });
      await (await store()).put(
        urlFor(key, cacheType),
        new Response(body, { headers: { "cache-control": `max-age=${KEEP_SECONDS}` } }),
      );
    } catch (error) {
      console.error("Edge cache write failed", error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await (await store()).delete(urlFor(key));
    } catch (error) {
      console.error("Edge cache delete failed", error);
    }
  }
}

export default new EdgeIncrementalCache();
