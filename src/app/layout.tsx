import type { Metadata } from "next";
import { Archivo, Bodoni_Moda } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";
import { TONE_SCRIPT } from "@/lib/tone";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: "Film Fatale | Discover Movies & TV Shows",
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  openGraph: {
    title: "Film Fatale | Discover Movies & TV Shows",
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: SITE_NAME,
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Film Fatale",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Film Fatale | Discover Movies & TV Shows",
    description: SITE_DESCRIPTION,
    images: ["/logo.png"],
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
    <html lang="en-US" data-tone="noir" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: TONE_SCRIPT }} />
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
      </head>
      <body
        className={`${archivo.variable} ${bodoni.variable} min-h-screen flex flex-col`}
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
