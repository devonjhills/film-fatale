import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  children?: ReactNode;
}

/** A quiet, centered message for empty lists, with the next step as its action. */
export function EmptyState({ title, description, children }: EmptyStateProps) {
  return (
    <div className="border-y border-border px-6 py-16 text-center">
      <h2 className="font-serif text-2xl font-medium">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">{description}</p>
      {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}
