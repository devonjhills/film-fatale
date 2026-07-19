import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top Rated TV Shows",
  description:
    "Explore top-rated TV series with detailed season, cast, rating, and viewing information.",
  alternates: { canonical: "/tv/top-rated" },
  openGraph: {
    title: "Top Rated TV Shows",
    description:
      "Explore top-rated TV series with detailed season, cast, rating, and viewing information.",
    url: "/tv/top-rated",
  },
};

export default function TopRatedTVLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
