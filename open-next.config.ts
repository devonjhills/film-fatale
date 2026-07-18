import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// OpenNext's platform defaults are sufficient for this private app. Runtime
// bindings and required secrets are declared in wrangler.jsonc.
export default defineCloudflareConfig();
