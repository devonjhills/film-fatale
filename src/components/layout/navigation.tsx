"use client";

import { Link } from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NextLink from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/components/providers/auth-provider";
import {
  Moon,
  Sun,
  LogOut,
  User,
  Bookmark,
  Menu,
  X,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export function Navigation() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const searchUrl = `/search?q=${encodeURIComponent(searchQuery.trim())}`;

      // Close mobile menu if open
      setMobileMenuOpen(false);

      // Always use push to ensure proper navigation and state updates
      router.push(searchUrl);

      setSearchQuery("");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center w-full relative">
          {/* Left: Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="flex items-center text-foreground hover:no-underline"
            >
              <Image
                src="/logo.png"
                alt="FilmFatale"
                width={48}
                height={48}
                className="h-12 w-12"
                priority
              />
            </Link>
          </div>

          {/* Center: Navigation Links - Absolutely centered on page */}
          <div className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-1">
              <NextLink
                href="/"
                className="inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Movies
              </NextLink>
              <NextLink
                href="/tv"
                className="inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                TV Shows
              </NextLink>
              {user && (
                <NextLink
                  href="/library"
                  className="inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  My Library
                </NextLink>
              )}
            </div>
          </div>

          {/* Right: Search and Controls */}
          <div className="flex items-center space-x-2 flex-shrink-0 ml-auto">
            {/* Search Bar - Show on md+ screens */}
            <form
              onSubmit={handleSearch}
              className="relative w-48 hidden md:flex"
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-10 w-full"
              />
            </form>

            {/* Mobile Search Icon - Show on small screens */}
            <NextLink href="/search" className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Search">
                <Search className="h-5 w-5" />
              </Button>
            </NextLink>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-7 w-7" />
              ) : (
                <Menu className="h-7 w-7" />
              )}
            </Button>
            {/* Auth Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="cursor-pointer">
                  {user ? (
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      {user.email
                        ? user.email.charAt(0).toUpperCase()
                        : user.name
                          ? user.name.charAt(0).toUpperCase()
                          : "U"}
                    </div>
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2">
                {user ? (
                  <>
                    <DropdownMenuLabel className="flex items-center gap-3 py-3">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                        {user.email
                          ? user.email.charAt(0).toUpperCase()
                          : user.name
                            ? user.name.charAt(0).toUpperCase()
                            : "U"}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {user.name || "User"}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => router.push("/library")}
                      className="flex items-center py-2 cursor-pointer"
                    >
                      <Bookmark className="h-4 w-4 mr-3" />
                      <span>My Library</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="flex items-center py-2 text-destructive cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem
                    onClick={() => router.push("/signin")}
                    className="flex items-center py-2 cursor-pointer"
                  >
                    <User className="h-4 w-4 mr-3" />
                    <span>Sign In</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
            >
              {!mounted ? (
                // Show a neutral icon during SSR to prevent hydration mismatch
                <div className="h-7 w-7" />
              ) : theme === "dark" ? (
                <Sun className="h-7 w-7 stroke-2" />
              ) : (
                <Moon className="h-7 w-7 stroke-2" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/30 py-4">
            <div className="flex flex-col space-y-3">
              {/* Mobile Search */}
              <div className="px-2">
                <form onSubmit={handleSearch} className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search movies, TV shows..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 h-10 w-full"
                    />
                  </div>
                </form>
              </div>
              <NextLink
                href="/"
                className="block px-4 py-3 text-sm font-medium hover:bg-muted rounded-md mx-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Movies
              </NextLink>
              <NextLink
                href="/tv"
                className="block px-4 py-3 text-sm font-medium hover:bg-muted rounded-md mx-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                TV Shows
              </NextLink>
              {user && (
                <NextLink
                  href="/library"
                  className="block px-4 py-3 text-sm font-medium hover:bg-muted rounded-md mx-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Library
                </NextLink>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
