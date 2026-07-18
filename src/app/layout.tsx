import type { Metadata } from "next";
import { Inter, Crimson_Pro } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-ui",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://www.filmfatale.app"),
  title: {
    default: "FilmFatale - Discover Movies and TV Shows",
    template: "%s | FilmFatale",
  },
  description:
    "Discover your next favorite movie or TV show with FilmFatale. Create your personal library, track your watching progress, and explore our comprehensive database powered by TMDB.",
  keywords: [
    "movies",
    "tv shows",
    "entertainment",
    "watch",
    "discover",
    "film",
    "television",
    "movie database",
    "watchlist",
    "tracking",
    "streaming",
    "cinema",
  ],
  authors: [{ name: "FilmFatale" }],
  creator: "FilmFatale",
  publisher: "FilmFatale",
  openGraph: {
    title: "FilmFatale - Discover Movies and TV Shows",
    description:
      "Discover your next favorite movie or TV show with FilmFatale. Create your personal library and track your watching progress.",
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "FilmFatale",
  },
  twitter: {
    card: "summary_large_image",
    title: "FilmFatale - Discover Movies and TV Shows",
    description:
      "Discover your next favorite movie or TV show with FilmFatale. Create your personal library and track your watching progress.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
      </head>
      <body
        className={`${inter.variable} ${crimsonPro.variable} min-h-screen flex flex-col`}
      >
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <AuthProvider>
          <TooltipProvider>
            <Navigation />
            <main id="main-content" className="flex flex-1 flex-col pt-16">
              {children}
            </main>
            <Footer />
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
