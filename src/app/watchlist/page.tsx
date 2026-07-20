"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { Bookmark } from "@/components/ui/icons";

export default function WatchlistPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to library page with "Plan to Watch" filter
    if (!loading) {
      if (user) {
        router.replace("/library?status=plan_to_watch");
      } else {
        router.replace("/admin");
      }
    }
  }, [user, loading, router]);

  // Show loading state while redirecting
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="surface-panel ticket-edge max-w-md space-y-5 px-8 py-12 text-center">
        <Bookmark className="mx-auto h-14 w-14 animate-pulse text-primary" weight="duotone" />
        <p className="eyebrow">Private collection</p>
        <h1 className="font-serif text-4xl font-medium tracking-[-0.03em]">Opening your library…</h1>
        <p className="text-muted-foreground">
          Your watchlist is now part of your movie library.
        </p>
      </div>
    </div>
  );
}
