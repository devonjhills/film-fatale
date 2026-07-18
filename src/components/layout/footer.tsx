import Image from "next/image";
import Link from "next/link";

const links = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function Footer() {
  return (
    <footer className="relative z-20 mt-auto border-t border-border/70 bg-background/80">
      <div className="site-container flex flex-col gap-5 py-7 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt=""
            width={32}
            height={32}
            className="size-8 rounded-full opacity-80"
          />
          <p>
            © {new Date().getFullYear()} Film Fatale
            <span className="mx-2 text-border" aria-hidden="true">
              /
            </span>
            A private cinema companion
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <nav aria-label="Footer navigation" className="flex gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <span className="hidden text-border sm:inline" aria-hidden="true">
            /
          </span>
          <Link
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            Data by TMDB
          </Link>
        </div>
      </div>
    </footer>
  );
}
