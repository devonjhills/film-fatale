import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Popular TV Shows",
  description:
    "Discover popular TV series trending now and explore seasons, cast, ratings, and where to watch.",
  alternates: { canonical: "/tv/popular" },
  openGraph: {
    title: "Popular TV Shows",
    description:
      "Discover popular TV series trending now and explore seasons, cast, ratings, and where to watch.",
    url: "/tv/popular",
  },
};

export default function PopularTVLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
