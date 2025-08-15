import Link from "next/link";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ViewAllButtonProps {
  href: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
}

export function ViewAllButton({
  href,
  className,
  variant = "default",
  size = "sm",
}: ViewAllButtonProps) {
  return (
    <Button
      asChild
      variant={variant}
      size={size}
      className={cn("gap-2", className)}
    >
      <Link href={href}>
        <span>View All</span>
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </Button>
  );
}
