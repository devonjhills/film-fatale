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
import { Moon, Sun, LogOut, User, Bookmark, Menu, X } from "lucide-react";

export function Navigation() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full border-b glass-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between w-full">
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

          {/* Center: Navigation Links */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-1">
              <NextLink
                href="/"
                className="inline-flex h-10 w-max items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Movies
              </NextLink>
              <NextLink
                href="/tv"
                className="inline-flex h-10 w-max items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                TV Shows
              </NextLink>
              <NextLink
                href="/search"
                className="inline-flex h-10 w-max items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Search
              </NextLink>
              {user && (
                <NextLink
                  href="/library"
                  className="inline-flex h-10 w-max items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  My Library
                </NextLink>
              )}
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="lg"
              className="h-12 w-12 p-0 rounded-lg md:hidden"
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
                <Button
                  variant="ghost"
                  size="lg"
                  className="h-12 w-12 p-0 rounded-lg cursor-pointer hover:bg-primary/10"
                >
                  {user ? (
                    <div className="relative">
                      {/* User Avatar with initials */}
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold border-2 border-primary/20">
                        {user.email
                          ? user.email.charAt(0).toUpperCase()
                          : user.name
                            ? user.name.charAt(0).toUpperCase()
                            : "U"}
                      </div>
                      {/* Online indicator */}
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                    </div>
                  ) : (
                    <User className="h-7 w-7" />
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
                      className="flex items-center py-2.5 cursor-pointer hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary rounded-md transition-colors"
                    >
                      <Bookmark className="h-4 w-4 mr-3" />
                      <span className="font-medium">My Library</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="flex items-center py-2.5 text-destructive hover:text-destructive focus:text-destructive cursor-pointer hover:bg-destructive/10 focus:bg-destructive/10 rounded-md transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      <span className="font-medium">Sign Out</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem
                    onClick={() => router.push("/signin")}
                    className="flex items-center py-2.5 cursor-pointer hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary rounded-md transition-colors"
                  >
                    <User className="h-4 w-4 mr-3" />
                    <span className="font-medium">Sign In</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="lg"
              className="h-12 w-12 p-0 rounded-lg"
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
            <div className="flex flex-col space-y-2">
              <NextLink
                href="/"
                className="block px-4 py-3 text-sm font-medium hover:bg-primary/10 hover:text-primary rounded-lg mx-2 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Movies
              </NextLink>
              <NextLink
                href="/tv"
                className="block px-4 py-3 text-sm font-medium hover:bg-primary/10 hover:text-primary rounded-lg mx-2 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                TV Shows
              </NextLink>
              <NextLink
                href="/search"
                className="block px-4 py-3 text-sm font-medium hover:bg-primary/10 hover:text-primary rounded-lg mx-2 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Search
              </NextLink>
              {user && (
                <NextLink
                  href="/library"
                  className="block px-4 py-3 text-sm font-medium hover:bg-primary/10 hover:text-primary rounded-lg mx-2 transition-colors"
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
