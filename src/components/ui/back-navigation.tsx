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
    <div className="rounded-md border border-border/70 bg-background/85">
      <Button
        variant={variant}
        size={size}
        onClick={handleBack}
        className={cn(
          "gap-2 rounded-sm border-0 bg-transparent font-serif transition-colors duration-150 hover:bg-accent hover:text-primary",
          className,
        )}
      >
        <Icons.ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Back</span>
      </Button>
    </div>
  );
}
