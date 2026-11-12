import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PanelProps {
  /** Label in the title bar. Without one, the panel has no title bar. */
  title?: string;
  /** Right side of the title bar: a quiet link, a count or compact controls. */
  aside?: ReactNode;
  className?: string;
  /** Padding and layout for the body; "p-3 sm:p-4" by default. */
  bodyClassName?: string;
  /** "p" when the label shouldn't be a heading, e.g. above a page's own h1. */
  titleAs?: "h2" | "p";
  children: ReactNode;
}

/**
 * A page section: a surface one step above the page with a hairline edge,
 * topped by a slim title bar like an editor pane.
 */
export function Panel({ title, aside, className, bodyClassName, titleAs: Title = "h2", children }: PanelProps) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={title ? headingId : undefined}
      className={cn("min-w-0 overflow-hidden rounded-lg border border-line bg-surface-1", className)}
    >
      {title && (
        <div className="flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-line bg-surface-2 px-3 py-2 sm:px-4">
          <Title id={headingId} className="min-w-0 break-words text-ui font-semibold text-ink">
            {title}
          </Title>
          {aside && <div className="flex shrink-0 items-center gap-2">{aside}</div>}
        </div>
      )}
      <div className={cn("p-3 sm:p-4", bodyClassName)}>{children}</div>
    </section>
  );
}

/** A quiet link for a panel's title bar, e.g. "See all". */
export const panelLinkClass =
  "-my-3 flex min-h-11 items-center text-ui text-ink-muted transition-colors duration-150 hover:text-ink";

/** A count or short note for a panel's title bar. */
export function PanelNote({ children }: { children: ReactNode }) {
  return <span className="text-ui tabular-nums text-ink-muted">{children}</span>;
}
