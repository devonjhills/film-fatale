import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const TONES = {
  default: "border-line bg-surface-2 text-ink",
  mint: "border-mint/35 text-mint",
};

/** A small rounded label: a status, a certification or a badge. */
export function Chip({
  tone = "default",
  className,
  children,
}: {
  tone?: keyof typeof TONES;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center whitespace-nowrap rounded-full border px-2.5 text-xs font-medium",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
