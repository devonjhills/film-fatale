"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

interface BrowseFilterControlsProps {
  media: "movie" | "tv";
  genres: { id: number; name: string }[];
  /** Empty for lists of what's out now, which hides the decade filter. */
  decades: number[];
  genre?: number;
  decade?: number;
}

/** Genre and decade selects; each change loads page 1 of the filtered list. */
export function BrowseFilterControls({
  media,
  genres,
  decades,
  genre,
  decade,
}: BrowseFilterControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const update = (key: "genre" | "decade", value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    const query = params.toString();
    startTransition(() => router.push(query ? `${pathname}?${query}` : pathname));
  };

  return (
    <div
      className={cn("flex flex-wrap items-center gap-2 transition-opacity", pending && "opacity-60")}
      aria-busy={pending}
    >
      <FilterSelect
        label="Genre"
        value={genre ? String(genre) : ""}
        onChange={(value) => update("genre", value)}
      >
        <option value="">All genres</option>
        {genres.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </FilterSelect>

      {decades.length > 0 && (
        <FilterSelect
          label="Decade"
          value={decade ? String(decade) : ""}
          onChange={(value) => update("decade", value)}
        >
          <option value="">Any year</option>
          {decades.map((option) => (
            <option key={option} value={option}>
              {option}s
            </option>
          ))}
        </FilterSelect>
      )}

      {(genre || decade) && (
        <button
          type="button"
          onClick={() => startTransition(() => router.push(pathname))}
          className="min-h-10 px-2 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Clear
          <span className="sr-only"> {media === "movie" ? "movie" : "show"} filters</span>
        </button>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "min-h-10 appearance-none rounded-sm border bg-card py-2 pl-3.5 pr-9 text-sm transition-colors focus:border-ring",
          value ? "border-primary text-foreground" : "border-input text-muted-foreground hover:text-foreground",
        )}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
    </label>
  );
}
