"use client";

import { useEffect } from "react";
import { AlertTriangle, Home, RotateCcw } from "@/components/ui/icons";
import Link from "next/link";
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
      <div className="surface-panel ticket-edge mx-4 max-w-lg space-y-7 px-8 py-14 text-center">
        <div className="space-y-4">
          <AlertTriangle className="mx-auto size-12 text-destructive" weight="duotone" />
          <h1 className="font-serif text-5xl font-medium tracking-[-0.035em]">
            The picture went dark
          </h1>
        </div>

        <div className="space-y-2">
          <p className="text-muted-foreground">
            An unexpected error occurred while loading this page.
          </p>
          {process.env.NODE_ENV === "development" && (
            <details className="text-left mt-4">
              <summary className="cursor-pointer text-sm font-medium">
                Error details (development only)
              </summary>
              <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-auto whitespace-pre-wrap">
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
