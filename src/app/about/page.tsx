import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Bookmark,
  Clapperboard,
  ExternalLink,
  Search,
} from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "About",
  description:
    "Film Fatale is a sharply edited movie and television discovery companion powered by data from TMDB.",
  alternates: {
    canonical: "/about",
  },
};

const features = [
  {
    title: "Find the next one",
    copy: "Browse what is playing, what critics love, and the titles hiding in plain sight.",
    icon: Search,
  },
  {
    title: "Keep your dossier",
    copy: "Save a watchlist, record what you finished, and track episodic progress.",
    icon: Bookmark,
  },
  {
    title: "Know the whole story",
    copy: "Cast, trailers, providers, ratings, seasons, and the details that make a title click.",
    icon: Clapperboard,
  },
];

export default function AboutPage() {
  return (
    <div className="site-container py-14 md:py-24">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)] lg:items-start">
        <article>
          <h1 className="display-title max-w-4xl">
            Every great night starts with the right film.
          </h1>
          <p className="page-lede mt-8 md:text-xl">
            Film Fatale is a private cinema companion built for discovery,
            memory, and the pleasure of choosing well. It keeps movies and
            television in one sharply edited place without turning the
            experience into a noisy streaming storefront.
          </p>

          <div className="mt-14 grid gap-px overflow-hidden rounded-sm border border-border bg-border md:grid-cols-3">
            {features.map(({ title, copy, icon: Icon }) => (
              <section key={title} className="bg-background p-7">
                <Icon
                  className="size-5 text-muted-foreground"
                  aria-hidden="true"
                />
                <h2 className="mt-5 font-serif text-2xl font-medium">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {copy}
                </p>
              </section>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/">
                Start discovering
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/library">Open the library</Link>
            </Button>
          </div>
        </article>

        <aside className="surface-panel p-8">
          <Image
            src="/logo.png"
            alt="Film Fatale emblem"
            width={180}
            height={180}
            className="mx-auto size-40 rounded-full bg-foreground sm:size-44"
          />
          <div className="mt-7 border-t border-border pt-6">
            <p className="text-sm leading-6 text-muted-foreground">
              Film and television data is supplied by The Movie Database.
              Film Fatale is not endorsed or certified by TMDB.
            </p>
            <Link
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-foreground underline underline-offset-4 hover:text-muted-foreground"
            >
              Visit TMDB
              <ExternalLink aria-hidden="true" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
