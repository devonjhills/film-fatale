"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function BackgroundProvider() {
  const pathname = usePathname();

  useEffect(() => {
    const isDetailPage =
      pathname.startsWith("/movie/") || pathname.startsWith("/tv/");
    const isSeasonPage = pathname.match(/^\/tv\/[^/]+\/season\/[^/]+/);

    // Apply sophisticated noir background pattern for non-detail pages or season pages
    if (!isDetailPage || isSeasonPage) {
      document.body.style.background = `
        radial-gradient(ellipse 120% 80% at 30% 0%, hsl(var(--primary) / 0.08) 0%, transparent 50%),
        radial-gradient(ellipse 100% 60% at 70% 100%, hsl(var(--accent) / 0.06) 0%, transparent 60%),
        linear-gradient(135deg, hsl(var(--muted) / 0.3) 0%, transparent 40%, hsl(var(--muted) / 0.2) 100%),
        hsl(var(--background))
      `;
    } else {
      document.body.style.background = "";
    }

    return () => {
      document.body.style.background = "";
    };
  }, [pathname]);

  return null;
}
