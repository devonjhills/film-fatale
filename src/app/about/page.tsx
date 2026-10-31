import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Film Fatale is a place to browse movies and TV shows, see who made them and find where to watch, using data from TMDB.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <div className="site-container py-10 md:py-14">
      <article className="max-w-2xl">
        <h1 className="page-title">About Film Fatale</h1>
        <div className="reading-text mt-6 space-y-5">
          <p>
            Film Fatale is a place to browse movies and TV shows: what&apos;s in
            theaters, what&apos;s on this week and what people rate highest. Each
            title shows its cast and crew, trailer, seasons and the services
            streaming it in the US.
          </p>
          <p>
            Browse by list on the{" "}
            <Link href="/movies/popular" className="underline underline-offset-4 hover:text-muted-foreground">
              Movies
            </Link>{" "}
            and{" "}
            <Link href="/tv" className="underline underline-offset-4 hover:text-muted-foreground">
              TV
            </Link>{" "}
            pages, narrow a list by genre or decade, or{" "}
            <Link href="/search" className="underline underline-offset-4 hover:text-muted-foreground">
              search
            </Link>{" "}
            for a title or person.
          </p>
        </div>

        <p className="mt-10 border-t border-border pt-6 text-sm leading-6 text-muted-foreground">
          Movie and TV data comes from{" "}
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline underline-offset-4 hover:text-muted-foreground"
          >
            The Movie Database (TMDB)
          </a>
          . Film Fatale uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </article>
    </div>
  );
}
