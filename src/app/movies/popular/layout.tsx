import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Popular Movies",
  description:
    "Discover popular movies trending now and explore ratings, cast, trailers, and where to watch.",
  alternates: { canonical: "/movies/popular" },
  openGraph: {
    title: "Popular Movies",
    description:
      "Discover popular movies trending now and explore ratings, cast, trailers, and where to watch.",
    url: "/movies/popular",
  },
};

export default function PopularMoviesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
