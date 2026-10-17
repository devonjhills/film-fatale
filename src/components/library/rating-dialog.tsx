"use client";

import { useState } from "react";
import type { ViewingHistoryItem } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "@/components/ui/icons";
import { saveLibraryItem } from "@/lib/hooks/use-library";
import { cn } from "@/lib/utils";

interface RatingDialogProps {
  item: ViewingHistoryItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function RatingDialog({ item, open, onOpenChange, onSaved }: RatingDialogProps) {
  const [rating, setRating] = useState(item.rating || 0);
  const [notes, setNotes] = useState(item.notes || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await saveLibraryItem(item, {
        status: item.status,
        rating: rating > 0 ? rating : null,
        notes: notes.trim() || null,
      });
      onSaved();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving rating:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-medium">{item.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <fieldset>
            <legend className="text-sm font-medium">Your rating</legend>
            <div className="mt-2 flex items-center">
              {Array.from({ length: 10 }, (_, i) => {
                const value = i + 1;
                const filled = value <= rating;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(rating === value ? 0 : value)}
                    aria-label={`${value} out of 10`}
                    aria-pressed={rating === value}
                    className="flex size-8 items-center justify-center rounded-sm hover:bg-muted"
                  >
                    <Star
                      weight={filled ? "fill" : "regular"}
                      className={cn("size-5", filled ? "text-foreground" : "text-muted-foreground")}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
              <span className="ml-3 text-sm tabular-nums text-muted-foreground">
                {rating > 0 ? `${rating}/10` : "None"}
              </span>
            </div>
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor={`notes-${item.id}`}>Notes</Label>
            <Textarea
              id={`notes-${item.id}`}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
