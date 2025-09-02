import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="relative z-20 border-t border-border bg-background">
      {/* Background Logo */}
      <div className="absolute inset-0 flex items-center justify-start pl-8 opacity-5 pointer-events-none">
        <div className="relative h-56 w-56">
          <Image
            src="/logo.png"
            alt=""
            fill
            sizes="224px"
            className="object-contain"
          />
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-3 gap-8 md:gap-12 justify-items-center">
          {/* Movies */}
          <div className="space-y-3">
            <h3 className="font-semibold">Movies</h3>
            <div className="space-y-2">
              <Link
                href="/movies/popular"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Popular Movies
              </Link>
              <Link
                href="/movies/top-rated"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Top Rated
              </Link>
              <Link
                href="/movies/now-playing"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Now Playing
              </Link>
            </div>
          </div>

          {/* TV Shows */}
          <div className="space-y-3">
            <h3 className="font-semibold">TV Shows</h3>
            <div className="space-y-2">
              <Link
                href="/tv/popular"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Popular Shows
              </Link>
              <Link
                href="/tv/top-rated"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Top Rated
              </Link>
              <Link
                href="/tv/on-the-air"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                On The Air
              </Link>
            </div>
          </div>

          {/* Support & Legal */}
          <div className="space-y-3">
            <h3 className="font-semibold">Support</h3>
            <div className="space-y-2">
              <Link
                href="/about"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                About Us
              </Link>
              <Link
                href="/privacy"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} FilmFatale All rights reserved.
          </div>

          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>Powered by</span>
            <Link
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              <Image
                src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_long_1-8ba2ac31f354005783fab473602c34c3f4fd207150182061e425d366e4f34596.svg"
                alt="The Movie Database (TMDB)"
                width={96}
                height={20}
                className="h-4 w-auto grayscale hover:grayscale-0"
              />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
