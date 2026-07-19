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
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Bookmark className="mx-auto h-16 w-16 animate-pulse text-muted-foreground" weight="duotone" />
        <h1 className="text-2xl font-bold">Redirecting to your library...</h1>
        <p className="text-muted-foreground">
          Your watchlist is now part of your movie library.
        </p>
      </div>
    </div>
  );
}
