import { SiteLogo } from "@/components/layout/site-logo";
import Link from "@/components/ui/app-link";

const links = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/library", label: "Owner", nofollow: true },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="site-container grid gap-8 py-10 text-sm text-ink-muted md:grid-cols-[1fr_auto] md:items-end">
        <SiteLogo withName />

        <div className="flex flex-col gap-4 md:items-end">
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                rel={link.nofollow ? "nofollow" : undefined}
                className="text-sm transition-colors duration-150 hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-xs">
            © {new Date().getFullYear()} Film Fatale
            <span className="mx-2 text-line-strong" aria-hidden="true">/</span>
            <Link
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-150 hover:text-ink"
            >
              Data by TMDB
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
