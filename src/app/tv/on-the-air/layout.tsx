import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TV Shows On the Air",
  description:
    "Browse TV shows currently airing new episodes, including seasons, cast, ratings, and viewing options.",
  alternates: { canonical: "/tv/on-the-air" },
  openGraph: {
    title: "TV Shows On the Air",
    description:
      "Browse TV shows currently airing new episodes, including seasons, cast, ratings, and viewing options.",
    url: "/tv/on-the-air",
  },
};

export default function OnTheAirLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
