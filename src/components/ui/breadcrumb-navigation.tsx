"use client";

import * as React from "react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function BreadcrumbNavigation({
  items,
  className,
}: BreadcrumbNavigationProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="rounded-sm border border-border/75 bg-background/76 px-4 py-2 shadow-[0_1px_0_oklch(1_0_0/0.025)_inset] backdrop-blur-sm">
      <Breadcrumb className={className}>
        <BreadcrumbList>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const isCurrent = item.current || isLast;

            return (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {isCurrent ? (
                    <BreadcrumbPage className="text-xs font-bold uppercase tracking-[0.07em]">
                      {item.label}
                    </BreadcrumbPage>
                  ) : item.href ? (
                    <BreadcrumbLink asChild>
                      <Link
                        href={item.href}
                        className="text-xs font-bold uppercase tracking-[0.07em] transition-colors duration-150 hover:text-primary"
                      >
                        {item.label}
                      </Link>
                    </BreadcrumbLink>
                  ) : (
                    <span className="text-xs font-bold uppercase tracking-[0.07em]">{item.label}</span>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
