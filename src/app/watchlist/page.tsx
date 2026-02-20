"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { Icons } from "@/components/ui/icons";

export default function WatchlistPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to library page with "Plan to Watch" filter
    if (!loading) {
      if (user) {
        router.replace("/library?status=plan_to_watch");
      } else {
        router.replace("/signin?redirect=/library?status=plan_to_watch");
      }
    }
  }, [user, loading, router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Icons.Bookmark className="h-16 w-16 mx-auto text-muted-foreground animate-pulse" />
        <h1 className="text-2xl font-bold">Redirecting to your library...</h1>
        <p className="text-muted-foreground">
          Your watchlist is now part of your movie library.
        </p>
      </div>
    </div>
  );
}
