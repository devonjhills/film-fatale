import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The site mark and name. The one place the logo is drawn, so a new logo
 * only needs swapping here (and in /public for social images).
 */
export function SiteLogo({
  withName = false,
  hideNameOnPhones = false,
  className,
}: {
  withName?: boolean;
  hideNameOnPhones?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Image src="/logo.png" alt="" width={32} height={32} className="size-8" priority />
      {withName && (
        <span className={cn("font-serif text-xl font-medium text-ink", hideNameOnPhones && "hidden sm:block")}>
          Film Fatale
        </span>
      )}
    </span>
  );
}
