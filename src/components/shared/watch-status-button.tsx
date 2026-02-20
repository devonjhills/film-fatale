"use client";

import { useState, useEffect } from "react";
import { WatchStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icons } from "@/components/ui/icons";

interface WatchStatusButtonProps {
  tmdb_id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path?: string | null;
  overview?: string;
  release_date?: string;
  vote_average?: number;
  size?: "sm" | "default" | "lg";
}

const statusOptions = [
  {
    value: "plan_to_watch",
    label: "Plan to Watch",
    icon: Icons.Clock,
    color: "text-muted-foreground",
  },
  {
    value: "watching",
    label: "Watching",
    icon: Icons.Play,
    color: "text-primary",
  },
  {
    value: "completed",
    label: "Completed",
    icon: Icons.Check,
    color: "text-green-600",
  },
] as const;

export function WatchStatusButton({
  tmdb_id,
  media_type,
  title,
  poster_path,
  overview = "",
  release_date = "",
  vote_average = 0,
  size = "default",
}: WatchStatusButtonProps) {
  const [currentStatus, setCurrentStatus] = useState<WatchStatus | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if item is already in viewing history
    const checkStatus = async () => {
      try {
        const response = await fetch(
          `/api/viewing-history?tmdb_id=${tmdb_id}&media_type=${media_type}&limit=1`,
        );
        if (response.ok) {
          const data = await response.json();
          if (data.items.length > 0) {
            setCurrentStatus(data.items[0].status);
          }
        }
      } catch (error) {
        console.error("Error checking viewing status:", error);
      }
    };

    checkStatus();
  }, [tmdb_id, media_type]);

  const handleStatusChange = async (status: WatchStatus) => {
    if (loading) return;

    try {
      setLoading(true);

      const response = await fetch("/api/viewing-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tmdb_id,
          media_type,
          title,
          poster_path,
          overview,
          release_date,
          vote_average,
          status,
        }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      setCurrentStatus(status);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const response = await fetch(
        `/api/viewing-history?tmdb_id=${tmdb_id}&media_type=${media_type}`,
        { method: "DELETE" },
      );

      if (!response.ok) throw new Error("Failed to remove from history");

      setCurrentStatus(null);
    } catch (error) {
      console.error("Error removing from history:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentOption = statusOptions.find(
    (option) => option.value === currentStatus,
  );
  const CurrentIcon = currentOption?.icon || Icons.Clock;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={currentStatus ? "secondary" : "outline"}
          size={size}
          disabled={loading}
          className="gap-2"
        >
          <CurrentIcon className="h-4 w-4" />
          {loading ? "Updating..." : currentOption?.label || "Add to List"}
          <Icons.ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {statusOptions.map((option) => {
          const OptionIcon = option.icon;
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleStatusChange(option.value as WatchStatus)}
              className="gap-2"
            >
              <OptionIcon className={`h-4 w-4 ${option.color}`} />
              {option.label}
              {currentStatus === option.value && (
                <span className="ml-auto text-xs text-primary">✓</span>
              )}
            </DropdownMenuItem>
          );
        })}

        {currentStatus && (
          <>
            <div className="border-t my-1" />
            <DropdownMenuItem
              onClick={handleRemove}
              className="text-destructive gap-2"
            >
              <Icons.X className="h-4 w-4" />
              Remove from History
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
