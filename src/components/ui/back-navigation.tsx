"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

interface BackNavigationProps {
  fallbackHref?: string;
  className?: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg";
}

export function BackNavigation({
  fallbackHref = "/",
  className,
  variant = "ghost",
  size = "default",
}: BackNavigationProps) {
  const router = useRouter();

  const handleBack = () => {
    // Check if there's browser history to go back to
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      // Fallback to provided href
      router.push(fallbackHref);
    }
  };

  return (
    <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-full shadow-sm">
      <Button
        variant={variant}
        size={size}
        onClick={handleBack}
        className={cn(
          "gap-2 font-serif border-0 bg-transparent hover:bg-background/60 hover:text-primary transition-all duration-300 rounded-full",
          className,
        )}
      >
        <Icons.ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Back</span>
      </Button>
    </div>
  );
}
