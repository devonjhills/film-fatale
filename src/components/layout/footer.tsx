import Image from "next/image";
import Link from "next/link";

const links = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/admin", label: "Owner", nofollow: true },
];

export function Footer() {
  return (
    <footer className="relative z-20 mt-auto overflow-hidden border-t border-border/75 bg-card/40">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/70 via-border to-transparent" />
      <div className="site-container grid gap-8 py-10 text-sm text-muted-foreground md:grid-cols-[1fr_auto] md:items-end">
        <div className="flex items-center gap-4">
          <Image
            src="/logo.png"
            alt=""
            width={44}
            height={44}
            className="size-11 rounded-full border border-border bg-foreground"
          />
          <div>
            <p className="font-serif text-lg font-semibold tracking-[-0.02em] text-foreground">
              Film <span className="italic text-primary">Fatale</span>
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.12em]">
              A private cinema companion
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:items-end">
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                rel={link.nofollow ? "nofollow" : undefined}
                className="text-xs font-bold uppercase tracking-[0.08em] transition-colors duration-150 hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-xs">
            © {new Date().getFullYear()} Film Fatale
            <span className="mx-2 text-border" aria-hidden="true">/</span>
            <Link
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-150 hover:text-foreground"
            >
              Data by TMDB
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
