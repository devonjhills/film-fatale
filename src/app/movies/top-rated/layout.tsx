import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top Rated Movies",
  description:
    "Explore top-rated movies and find detailed cast, crew, trailer, rating, and viewing information.",
  alternates: { canonical: "/movies/top-rated" },
  openGraph: {
    title: "Top Rated Movies",
    description:
      "Explore top-rated movies and find detailed cast, crew, trailer, rating, and viewing information.",
    url: "/movies/top-rated",
  },
};

export default function TopRatedMoviesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
