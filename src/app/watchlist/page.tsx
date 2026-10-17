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
      <div className="max-w-md space-y-4 text-center">
        <Bookmark className="mx-auto size-10 animate-pulse text-muted-foreground" aria-hidden="true" />
        <h1 className="font-serif text-4xl font-medium">Opening your library…</h1>
        <p className="text-muted-foreground">
          Your watchlist is now part of your movie library.
        </p>
      </div>
    </div>
  );
}
