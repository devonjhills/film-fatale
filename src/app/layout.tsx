import type { Metadata } from "next";
import { Inter, Crimson_Pro, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { BackgroundProvider } from "@/components/providers/background-provider";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { TooltipProvider } from "@/components/ui/tooltip";

// Enhanced Inter for superior readability and modern aesthetics
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap", // Performance optimization
});

// Crimson Pro - Elegant serif with better readability, perfect for film noir aesthetic
const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  style: ["normal", "italic"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${crimsonPro.variable} ${jetbrains.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              <BackgroundProvider />
              <Navigation />
              <main id="main-content" className="flex-1 pt-16">
                {children}
              </main>
              <Footer />
            </TooltipProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
