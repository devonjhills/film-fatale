"use client";

import Image from "next/image";
import Link from "next/link";
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
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Discover", match: /^\/$/ },
  // Covers the movie lists (/movies/…) and movie pages (/movie/…).
  { href: "/movies/popular", label: "Movies", match: /^\/movies?(\/|$)/ },
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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background">
      <div className="neon-rule absolute inset-x-0 -bottom-px h-px" aria-hidden="true" />
      <div className="site-container flex h-16 items-center gap-6">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-3 rounded-sm"
          aria-label="Film Fatale home"
        >
          <Image
            src="/logo.png"
            alt=""
            width={36}
            height={36}
            className="size-9 rounded-full bg-foreground"
            priority
          />
          <span className="hidden font-serif text-xl font-medium text-foreground sm:block">
            Film Fatale
          </span>
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
              className={cn(
                "relative flex min-h-11 items-center px-3 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground",
                isActive(link.href, link.match) &&
                  "text-foreground after:absolute after:inset-x-3 after:-bottom-[11px] after:h-px after:bg-primary",
              )}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <Link
              href="/library"
              aria-current={pathname.startsWith("/library") ? "page" : undefined}
              className={cn(
                "relative flex min-h-11 items-center px-3 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground",
                pathname.startsWith("/library") &&
                  "text-foreground after:absolute after:inset-x-3 after:-bottom-[11px] after:h-px after:bg-primary",
              )}
            >
              Library
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <form
            onSubmit={handleSearch}
            role="search"
            className="relative hidden w-[clamp(12rem,22vw,20rem)] lg:block"
          >
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search films, shows, people"
              aria-label="Search films, shows, and people"
              className="h-10 bg-card pl-10"
            />
          </form>

          <Button variant="ghost" size="icon" asChild className="lg:hidden">
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
                  <span className="flex size-8 items-center justify-center rounded-full border border-input text-sm font-semibold text-foreground">
                    {(user.name || user.email || "U").charAt(0).toUpperCase()}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="surface-float w-64 p-2">
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
          className="border-t border-border bg-background px-4 pb-6 pt-4 md:hidden"
        >
          <div className="mx-auto flex max-w-lg flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href, link.match) ? "page" : undefined}
                className={cn(
                  "flex min-h-12 items-center border-l-2 border-transparent px-4 text-base font-medium text-muted-foreground",
                  isActive(link.href, link.match) && "border-foreground text-foreground",
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <Link
                href="/library"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex min-h-12 items-center border-l-2 border-transparent px-4 text-base font-medium text-muted-foreground",
                  pathname.startsWith("/library") && "border-foreground text-foreground",
                )}
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
