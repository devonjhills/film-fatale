import { Star } from "@/components/ui/icons";
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
    overlay: "bg-black/80 text-white",
    inline: "border border-border bg-secondary text-foreground",
    subtle: "bg-transparent text-foreground",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-sm font-medium tabular-nums",
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
    >
      <Star className={iconSizes[size]} weight="fill" aria-hidden="true" />
      <span className="font-semibold">{rating}</span>
    </div>
  );
}
