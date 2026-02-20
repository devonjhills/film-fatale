import Link from "next/link";
import { Icons } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="space-y-4">
          <Icons.Film className="h-24 w-24 text-muted-foreground mx-auto" />
          <h1 className="text-6xl font-bold text-primary">404</h1>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center justify-center px-6 py-3 border border-input rounded-lg hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-colors"
          >
            Search Movies
          </Link>
        </div>
      </div>
    </div>
  );
}
