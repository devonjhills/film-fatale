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
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/components/providers/auth-provider";
import { Icons } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Movies" },
  { href: "/tv", label: "TV Shows" },
];

export function Navigation() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Detect scroll to add stronger glass effect when scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "glass-strong border-b border-border/30 elevation-2"
          : "bg-background/80 backdrop-blur-md border-b border-border/20",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center w-full relative">
          {/* Left: Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="flex items-center text-foreground hover:no-underline group"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Image
                  src="/logo.png"
                  alt="FilmFatale"
                  width={48}
                  height={48}
                  className="h-12 w-12"
                  priority
                />
              </motion.div>
            </Link>
          </div>

          {/* Center: Nav links */}
          <div className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-1">
              {navLinks.map((link) => (
                <NextLink
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive(link.href)
                      ? "text-primary"
                      : "hover:bg-muted hover:text-foreground",
                  )}
                >
                  {link.label}
                  {/* Active underline indicator */}
                  {isActive(link.href) && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-1 left-4 right-4 h-0.5 bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </NextLink>
              ))}
              {user && (
                <NextLink
                  href="/library"
                  className={cn(
                    "relative inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive("/library")
                      ? "text-primary"
                      : "hover:bg-muted hover:text-foreground",
                  )}
                >
                  My Library
                  {isActive("/library") && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-1 left-4 right-4 h-0.5 bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </NextLink>
              )}
            </div>
          </div>

          {/* Right: Search + controls */}
          <div className="flex items-center space-x-2 flex-shrink-0 ml-auto">
            {/* Desktop search */}
            <form onSubmit={handleSearch} className="relative w-48 hidden md:flex">
              <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-10 w-full"
              />
            </form>

            {/* Mobile search icon */}
            <NextLink href="/search" className="md:hidden flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Search"
                className="flex-shrink-0"
              >
                <Icons.Search className="h-5 w-5" />
              </Button>
            </NextLink>

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden flex-shrink-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileMenuOpen ? (
                  <motion.span
                    key="close"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Icons.X className="h-7 w-7" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Icons.Menu className="h-7 w-7" />
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>

            {/* Auth Dropdown */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="cursor-pointer flex-shrink-0"
                >
                  {user ? (
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold ring-2 ring-primary/30">
                      {user.email
                        ? user.email.charAt(0).toUpperCase()
                        : user.name
                          ? user.name.charAt(0).toUpperCase()
                          : "U"}
                    </div>
                  ) : (
                    <Icons.User className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 p-2 glass-strong elevation-3 border-border/40"
                sideOffset={8}
              >
                {user ? (
                  <>
                    <DropdownMenuLabel className="flex items-center gap-3 py-3">
                      <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold ring-2 ring-primary/30 flex-shrink-0">
                        {user.email
                          ? user.email.charAt(0).toUpperCase()
                          : user.name
                            ? user.name.charAt(0).toUpperCase()
                            : "U"}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium truncate">
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
                      className="flex items-center py-2.5 cursor-pointer rounded-md"
                    >
                      <Icons.Bookmark className="h-4 w-4 mr-3 text-muted-foreground" />
                      <span>My Library</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="flex items-center py-2.5 text-destructive cursor-pointer rounded-md"
                    >
                      <Icons.LogOut className="h-4 w-4 mr-3" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem
                    onClick={() => router.push("/signin")}
                    className="flex items-center py-2.5 cursor-pointer rounded-md"
                  >
                    <Icons.User className="h-4 w-4 mr-3 text-muted-foreground" />
                    <span>Sign In</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme toggle */}
            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              className="flex-shrink-0"
            >
              {!mounted ? (
                <div className="h-5 w-5" />
              ) : (
                <motion.div
                  key={theme}
                  initial={{ opacity: 0, scale: 0.7, rotate: -30 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === "dark" ? (
                    <Icons.Sun className="h-5 w-5" />
                  ) : (
                    <Icons.Moon className="h-5 w-5" />
                  )}
                </motion.div>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="md:hidden overflow-hidden border-t border-border/30"
            >
              <div className="flex flex-col space-y-1 py-4">
                {/* Mobile Search */}
                <div className="px-2 pb-3">
                  <form onSubmit={handleSearch} className="relative">
                    <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search movies, TV shows..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 h-10 w-full"
                    />
                  </form>
                </div>

                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.2 }}
                  >
                    <NextLink
                      href={link.href}
                      className={cn(
                        "block px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-muted rounded-md mx-2",
                        isActive(link.href) && "text-primary bg-primary/5",
                      )}
                    >
                      {link.label}
                    </NextLink>
                  </motion.div>
                ))}

                {user && (
                  <motion.div
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.12, duration: 0.2 }}
                  >
                    <NextLink
                      href="/library"
                      className={cn(
                        "block px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-muted rounded-md mx-2",
                        isActive("/library") && "text-primary bg-primary/5",
                      )}
                    >
                      My Library
                    </NextLink>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
