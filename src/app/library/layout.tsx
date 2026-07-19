import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Private Library",
  robots: { index: false, follow: false },
};

export default function LibraryLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
