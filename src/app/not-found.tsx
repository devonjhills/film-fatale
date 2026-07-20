import Link from "next/link";
import { Film } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center py-16">
      <div className="surface-panel ticket-edge mx-4 max-w-lg space-y-7 px-8 py-14 text-center">
        <div className="space-y-4">
          <Film className="mx-auto size-14 text-primary" weight="duotone" />
          <p className="eyebrow">Case number 404</p>
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-5xl font-medium tracking-[-0.035em]">This reel is missing</h1>
          <p className="text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
        </div>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/">Back to discover</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search">Search the archive</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
