import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Private Watchlist",
  robots: { index: false, follow: false },
};

export default function WatchlistLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
