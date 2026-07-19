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
import { Icons } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Discover", exact: true },
  { href: "/movies/popular", label: "Movies" },
  { href: "/tv", label: "TV" },
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

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/96">
      <div className="site-container flex h-16 items-center gap-5">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5 rounded-sm"
          aria-label="Film Fatale home"
        >
          <Image
            src="/logo.png"
            alt=""
            width={40}
            height={40}
            className="size-10 rounded-full border border-border/80 bg-foreground"
            priority
          />
          <span className="hidden font-serif text-xl font-semibold tracking-[-0.025em] text-foreground sm:block">
            Film <span className="italic text-primary">Fatale</span>
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
              aria-current={isActive(link.href, link.exact) ? "page" : undefined}
              className={cn(
                "relative flex min-h-11 items-center rounded-sm px-3 text-sm font-medium text-muted-foreground transition-colors duration-100 hover:text-foreground",
                isActive(link.href, link.exact) &&
                  "text-foreground after:absolute after:inset-x-3 after:-bottom-[11px] after:h-0.5 after:bg-primary",
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
                "relative flex min-h-11 items-center rounded-sm px-3 text-sm font-medium text-muted-foreground transition-colors duration-100 hover:text-foreground",
                pathname.startsWith("/library") &&
                  "text-foreground after:absolute after:inset-x-3 after:-bottom-[11px] after:h-0.5 after:bg-primary",
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
            <Icons.Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search films, shows, people"
              aria-label="Search films, shows, and people"
              className="h-10 bg-card/80 pl-10"
            />
          </form>

          <Button variant="ghost" size="icon" asChild className="lg:hidden">
            <Link href="/search" aria-label="Search">
              <Icons.Search aria-hidden="true" />
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
                  <span className="flex size-8 items-center justify-center rounded-full border border-primary/50 bg-primary/15 text-sm font-semibold text-foreground">
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
                  <Icons.Bookmark aria-hidden="true" />
                  Library
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={signOut}
                  className="text-destructive focus:text-destructive"
                >
                  <Icons.LogOut aria-hidden="true" />
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
              <Icons.X aria-hidden="true" />
            ) : (
              <Icons.Menu aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="border-t border-border/70 bg-background px-4 pb-5 pt-3 md:hidden"
        >
          <div className="mx-auto flex max-w-lg flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href, link.exact) ? "page" : undefined}
                className={cn(
                  "flex min-h-12 items-center rounded-md px-4 text-base font-medium text-muted-foreground",
                  isActive(link.href, link.exact) && "bg-accent text-foreground",
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
                  "flex min-h-12 items-center rounded-md px-4 text-base font-medium text-muted-foreground",
                  pathname.startsWith("/library") && "bg-accent text-foreground",
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
