"use client";

import Link from "@/components/ui/app-link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bookmark, LogOut, Menu, Search, X } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { SiteLogo } from "@/components/layout/site-logo";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

/** One link style for the desktop bar and the mobile menu. */
const navLinkClass = (active: boolean, mobile = false) =>
  cn(
    "flex items-center rounded-md px-3 text-sm font-medium transition-colors duration-150",
    mobile ? "min-h-12 px-4 text-base" : "min-h-11",
    active ? "bg-surface-2 text-ink" : "text-ink-muted hover:text-ink",
  );

const navLinks = [
  { href: "/", label: "Discover", match: /^\/$/ },
  // Covers the movie lists (/movies/…) and movie pages (/movie/…).
  { href: "/movies", label: "Movies", match: /^\/movies?(\/|$)/ },
  { href: "/tv", label: "TV", match: /^\/tv(\/|$)/ },
];

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setSearchQuery("");
    setMobileMenuOpen(false);
  };

  const isActive = (href: string, match?: RegExp) =>
    match ? match.test(pathname) : pathname.startsWith(href);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-page">
      <div className="site-container flex h-16 items-center gap-6">
        <Link
          href="/"
          className="flex shrink-0 items-center rounded-md"
          aria-label="Film Fatale home"
        >
          <SiteLogo withName hideNameOnPhones />
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-1 md:flex"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href, link.match) ? "page" : undefined}
              className={navLinkClass(isActive(link.href, link.match))}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <Link
              href="/library"
              aria-current={pathname.startsWith("/library") ? "page" : undefined}
              className={navLinkClass(pathname.startsWith("/library"))}
            >
              Library
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <form
            onSubmit={handleSearch}
            role="search"
            className="relative hidden w-[clamp(12rem,24vw,20rem)] md:block"
          >
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search movies, shows, people"
              aria-label="Search movies, TV shows and people"
              className="h-10 pl-10"
            />
          </form>

          <Button variant="ghost" size="icon" asChild className="md:hidden">
            <Link href="/search" aria-label="Search">
              <Search aria-hidden="true" />
            </Link>
          </Button>

          {user && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open account menu"
                >
                  <span className="flex size-8 items-center justify-center rounded-full border border-line-strong bg-surface-2 text-sm font-semibold text-ink">
                    {(user.name || user.email || "U").charAt(0).toUpperCase()}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2">
                <DropdownMenuLabel className="px-2 py-3">
                  <span className="block text-sm font-medium">
                    {user.name || "Film Fatale"}
                  </span>
                  <span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => router.push("/library")}>
                  <Bookmark aria-hidden="true" />
                  Library
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={signOut}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut aria-hidden="true" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? (
              <X aria-hidden="true" />
            ) : (
              <Menu aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="border-t border-line bg-page px-4 pb-6 pt-4 md:hidden"
        >
          <div className="mx-auto flex max-w-lg flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href, link.match) ? "page" : undefined}
                className={navLinkClass(isActive(link.href, link.match), true)}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <Link
                href="/library"
                onClick={() => setMobileMenuOpen(false)}
                aria-current={pathname.startsWith("/library") ? "page" : undefined}
                className={navLinkClass(pathname.startsWith("/library"), true)}
              >
                Library
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
