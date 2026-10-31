"use client";

import { useSyncExternalStore } from "react";
import { Share } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

const subscribe = () => () => {};
const canShare = () => typeof navigator.share === "function";

/**
 * Opens the system share sheet. Shown only on small screens with Web Share
 * support; on desktop, the address bar already does this job.
 */
export function ShareButton({ title }: { title: string }) {
  const supported = useSyncExternalStore(subscribe, canShare, () => false);
  if (!supported) return null;

  return (
    <Button
      variant="outline"
      size="lg"
      className="md:hidden"
      onClick={() => {
        navigator.share({ title, url: window.location.href }).catch(() => {
          // Dismissing the share sheet rejects; nothing to do.
        });
      }}
    >
      <Share aria-hidden="true" />
      Share
    </Button>
  );
}
