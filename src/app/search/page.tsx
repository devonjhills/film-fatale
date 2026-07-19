import type { Metadata } from "next";
import { SearchPageClient } from "@/components/search/search-page-client";

export const metadata: Metadata = {
  title: "Search Movies, TV Shows & People",
  description:
    "Search movies, TV shows, actors, directors, and creators across the Film Fatale catalog.",
  alternates: {
    canonical: "/search",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function Search() {
  return <SearchPageClient />;
}
