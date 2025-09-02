"use client";

import { useState } from "react";
import { ViewingHistoryItem, WatchStatus } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star } from "lucide-react";

interface StatusUpdateDialogProps {
  item: ViewingHistoryItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

const statusOptions = [
  { value: "plan_to_watch", label: "Want to Watch" },
  { value: "watching", label: "Currently Watching" },
  { value: "completed", label: "Watched" },
] as const;

export function StatusUpdateDialog({
  item,
  open,
  onOpenChange,
  onUpdate,
}: StatusUpdateDialogProps) {
  const [status, setStatus] = useState<WatchStatus>(item.status);
  const [rating, setRating] = useState<number>(item.rating || 0);
  const [notes, setNotes] = useState(item.notes || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/viewing-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tmdb_id: item.tmdb_id,
          media_type: item.media_type,
          title: item.title,
          poster_path: item.poster_path,
          overview: item.overview,
          release_date: item.release_date,
          vote_average: item.vote_average,
          status,
          rating: rating > 0 ? rating : null,
          notes: notes.trim() || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      onUpdate();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingClick = (newRating: number) => {
    setRating(rating === newRating ? 0 : newRating);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Status</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="status">Watch Status</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as WatchStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Your Personal Rating</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Rate this title out of 10 stars
            </p>
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: 10 }, (_, i) => {
                const starValue = i + 1;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleRatingClick(starValue)}
                    className="p-1 hover:bg-muted rounded"
                    title={`Rate ${starValue} star${starValue !== 1 ? "s" : ""}`}
                  >
                    <Star
                      className={`h-5 w-5 ${
                        starValue <= rating
                          ? "fill-accent text-accent"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                );
              })}
              {rating > 0 ? (
                <span className="ml-2 text-sm font-medium">{rating}/10</span>
              ) : (
                <span className="ml-2 text-sm text-muted-foreground">
                  No rating
                </span>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Personal Notes</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Add your thoughts, opinions, or reminders
            </p>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you think? Any memorable quotes or scenes? Worth rewatching?"
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Updating..." : "Update"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
