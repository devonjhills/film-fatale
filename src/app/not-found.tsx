import Link from "next/link";
import { Film } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center py-16">
      <div className="mx-4 max-w-lg space-y-6 text-center">
        <Film className="mx-auto size-10 text-muted-foreground" aria-hidden="true" />

        <div className="space-y-2">
          <h1 className="font-serif text-4xl font-medium md:text-5xl">Page not found</h1>
          <p className="text-muted-foreground">
            This link may be old or mistyped. Search for the title instead.
          </p>
        </div>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/">Go to Discover</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search">Search</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
