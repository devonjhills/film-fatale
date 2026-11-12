import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The site mark and name. The one place the logo is drawn, so a new logo
 * only needs swapping here (and in /public for social images).
 */
export function SiteLogo({ withName = false, className }: { withName?: boolean; className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Image src="/logo.png" alt="" width={32} height={32} className="size-8" priority />
      {withName && (
        <span className="hidden font-serif text-xl font-medium text-ink sm:block">Film Fatale</span>
      )}
    </span>
  );
}
