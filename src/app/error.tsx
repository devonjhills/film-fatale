"use client";

import { useEffect } from "react";
import { AlertTriangle, Home, RotateCcw } from "@/components/ui/icons";
import Link from "@/components/ui/app-link";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-16">
      <div className="mx-4 w-full max-w-lg space-y-6 rounded-lg border border-line bg-surface-1 px-6 py-12 text-center">
        <div className="space-y-4">
          <AlertTriangle className="mx-auto size-10 text-destructive" aria-hidden="true" />
          <h1 className="font-serif text-4xl font-medium md:text-5xl">
            This page didn&apos;t load
          </h1>
        </div>

        <div className="space-y-2">
          <p className="text-muted-foreground">
            Something failed while loading. Try again, or go back to Discover.
          </p>
          {process.env.NODE_ENV === "development" && (
            <details className="text-left mt-4">
              <summary className="cursor-pointer text-sm font-medium">
                Error details (development only)
              </summary>
              <pre className="mt-2 overflow-auto whitespace-pre-wrap rounded-md bg-surface-2 p-3 text-xs">
                {error.message}
                {error.stack && "\n\n" + error.stack}
              </pre>
            </details>
          )}
        </div>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            <span>Try again</span>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="h-4 w-4" />
              <span>Go home</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
