"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

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
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="space-y-4">
          <AlertTriangle className="h-24 w-24 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold text-destructive">
            Something went wrong!
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

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Try again</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center space-x-2 px-6 py-3 border border-input rounded-lg hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Go home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
