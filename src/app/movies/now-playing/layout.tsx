import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Now Playing Movies",
  description:
    "Browse movies currently playing in theaters, with ratings, cast, trailers, and streaming availability.",
  alternates: { canonical: "/movies/now-playing" },
  openGraph: {
    title: "Now Playing Movies",
    description:
      "Browse movies currently playing in theaters, with ratings, cast, trailers, and streaming availability.",
    url: "/movies/now-playing",
  },
};

export default function NowPlayingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
