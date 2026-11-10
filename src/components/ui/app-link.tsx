"use client";

import NextLink from "next/link";
import { forwardRef, useState, type ComponentProps } from "react";

type AppLinkProps = ComponentProps<typeof NextLink>;

/**
 * next/link that only prefetches once someone shows intent (hover, keyboard
 * focus or touch), instead of prefetching every link that scrolls into view.
 * Each prefetch is a Worker request, and viewport prefetching made every page
 * view (including bot traffic) cost several requests for the nav, footer and
 * poster grids. Pattern from the Next.js "prefetch on hover" docs.
 */
export const AppLink = forwardRef<HTMLAnchorElement, AppLinkProps>(
  function AppLink(
    { prefetch, onMouseEnter, onFocus, onTouchStart, ...props },
    ref,
  ) {
    const [active, setActive] = useState(false);
    const resolvedPrefetch = prefetch === false ? false : active ? prefetch ?? null : false;

    return (
      <NextLink
        ref={ref}
        {...props}
        prefetch={resolvedPrefetch}
        onMouseEnter={(event) => {
          setActive(true);
          onMouseEnter?.(event);
        }}
        onFocus={(event) => {
          setActive(true);
          onFocus?.(event);
        }}
        onTouchStart={(event) => {
          setActive(true);
          onTouchStart?.(event);
        }}
      />
    );
  },
);

export default AppLink;
