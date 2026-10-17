"use client";

import { useState } from "react";
import type { ViewingHistoryItem, WatchStatus } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, MoreHorizontal } from "@/components/ui/icons";
import { removeLibraryItem, saveLibraryItem } from "@/lib/hooks/use-library";
import { RatingDialog } from "./rating-dialog";
import { cn } from "@/lib/utils";

export const STATUS_LABELS: Record<WatchStatus, string> = {
  watching: "Watching",
  plan_to_watch: "Want to watch",
  completed: "Watched",
};

const STATUS_ORDER: WatchStatus[] = ["plan_to_watch", "watching", "completed"];

interface ItemMenuProps {
  item: ViewingHistoryItem;
  onChange: () => void;
  className?: string;
}

/** Move between lists, rate, or remove. */
export function ItemMenu({ item, onChange, className }: ItemMenuProps) {
  const [ratingOpen, setRatingOpen] = useState(false);

  const setStatus = async (status: WatchStatus) => {
    if (status === item.status) return;
    try {
      await saveLibraryItem(item, { status });
      onChange();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const remove = async () => {
    const message =
      item.media_type === "tv"
        ? `Remove ${item.title} and its episode progress from your library?`
        : `Remove ${item.title} from your library?`;
    if (!window.confirm(message)) return;
    try {
      await removeLibraryItem(item);
      onChange();
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Options for ${item.title}`}
          className={cn(
            "flex size-9 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
            className,
          )}
        >
          <MoreHorizontal className="size-5" weight="bold" aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-48">
          {STATUS_ORDER.map((status) => (
            <DropdownMenuItem key={status} onSelect={() => setStatus(status)} className="gap-2">
              <Check
                className={cn("size-4", status !== item.status && "invisible")}
                weight="bold"
                aria-hidden="true"
              />
              {STATUS_LABELS[status]}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setRatingOpen(true)} className="pl-8">
            {item.rating ? "Edit rating and notes" : "Rate and add notes"}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={remove} className="pl-8 text-destructive focus:text-destructive">
            Remove from library
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {ratingOpen && (
        <RatingDialog item={item} open={ratingOpen} onOpenChange={setRatingOpen} onSaved={onChange} />
      )}
    </>
  );
}
