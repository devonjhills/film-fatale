import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import NextLink from "next/link";
import { type ClassValue } from "clsx";

interface LinkProps
  extends Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    "href" | "className"
  > {
  href: string;
  variant?: "default" | "nav" | "button" | "ghost" | "accent";
  size?: "sm" | "md" | "lg";
  external?: boolean;
  className?: ClassValue;
  children: React.ReactNode;
  disabled?: boolean;
  prefetch?: boolean;
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      href,
      variant = "default",
      size = "md",
      external = false,
      className,
      children,
      disabled,
      prefetch,
      target,
      rel,
      ...props
    },
    ref,
  ) => {
    // Auto-detect external links if not explicitly set
    const isExternal =
      external || href.startsWith("http") || href.startsWith("mailto:");

    // Default rel attributes for external links
    const defaultRel = isExternal ? "noopener noreferrer" : undefined;
    const finalRel = rel || defaultRel;
    const finalTarget = target || (isExternal ? "_blank" : undefined);

    const baseClasses = cn(
      // Base styles
      "cursor-pointer transition-[color,background-color,border-color,opacity] duration-150",
      "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
      // Ensure minimum touch target for button-like links
      variant === "button" && "min-h-[44px]",
      // Variant styles
      {
        // Default link
        "font-medium text-primary underline-offset-4 hover:text-foreground hover:underline":
          variant === "default",

        // Navigation link with underline animation
        "text-xs font-bold uppercase tracking-[0.09em] text-muted-foreground hover:text-primary":
          variant === "nav",

        // Button-like link
        "inline-flex items-center justify-center rounded-sm border border-primary bg-primary font-bold text-primary-foreground hover:border-foreground hover:bg-foreground":
          variant === "button",

        // Ghost button link
        "inline-flex items-center justify-center rounded-sm border border-transparent font-bold text-muted-foreground hover:border-border hover:bg-accent hover:text-foreground":
          variant === "ghost",

        // Accent colored link
        "font-semibold text-primary underline-offset-4 hover:text-foreground hover:underline":
          variant === "accent",
      },
      // Size variants for button-like links
      variant === "button" || variant === "ghost"
        ? {
            "h-11 px-3 text-sm gap-2": size === "sm",
            "h-12 px-4 py-3 gap-2": size === "md",
            "h-14 px-6 text-lg gap-3": size === "lg",
          }
        : {},
      className,
    );

    // Common props for both internal and external links
    const commonProps = {
      className: baseClasses,
      ref,
      target: finalTarget,
      rel: finalRel,
      "aria-disabled": disabled,
      ...props,
    };

    if (disabled) {
      return (
        <span
          className={cn(baseClasses, "cursor-not-allowed")}
          aria-disabled="true"
        >
          {children}
        </span>
      );
    }

    // Use NextLink for internal links, regular anchor for external
    if (isExternal) {
      return (
        <a href={href} {...commonProps}>
          {children}
        </a>
      );
    }

    return (
      <NextLink href={href} prefetch={prefetch} {...commonProps}>
        {children}
      </NextLink>
    );
  },
);
Link.displayName = "Link";

export { Link };
export type { LinkProps };
