import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Start with OpenNext's platform defaults. Durable cache and D1 bindings are
// added in later migration stages, after the base Worker build is verified.
export default defineCloudflareConfig();
