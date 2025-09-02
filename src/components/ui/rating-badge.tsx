import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingBadgeProps {
  rating: number | string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "overlay" | "inline" | "subtle";
}

export function RatingBadge({
  rating,
  className,
  size = "sm",
  variant = "overlay",
}: RatingBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-2.5 py-1.5",
    lg: "text-base px-3 py-2",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  const variantClasses = {
    overlay: "bg-foreground/90 text-background backdrop-blur-sm shadow-lg",
    inline: "bg-muted/80 text-foreground border border-border/50",
    subtle: "bg-transparent text-foreground/80",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md font-medium transition-colors",
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
    >
      <Star className={cn(iconSizes[size], "fill-current")} />
      <span className="font-semibold">{rating}</span>
    </div>
  );
}
