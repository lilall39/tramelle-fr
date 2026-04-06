import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Jost, Prata } from "next/font/google";
import { FirebaseAnalytics } from "@/components/analytics/firebase-analytics";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AuthProvider } from "@/contexts/auth-context";
import { brand, getSiteUrl, siteName } from "@/lib/site";
import "./globals.css";

const prata = Prata({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-prata",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const siteUrl = getSiteUrl();

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F1E8" },
    { media: "(prefers-color-scheme: dark)", color: "#1c2320" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — outils, articles & billets`,
    template: `%s — ${siteName}`,
  },
  description: `${brand.subtitle}. ${brand.heroTitle} Des textes et des outils en français, sans promesse miracle.`,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName,
    title: siteName,
    description: `${brand.subtitle} — ${brand.heroTitle}`,
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: "Outils, articles et billets — en français.",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico" },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${prata.variable} ${jost.variable} ${jetbrainsMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <a
          href="#contenu-principal"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-paper focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-accent"
        >
          Aller au contenu
        </a>
        <AuthProvider>
          <SiteHeader />
          <main id="contenu-principal" className="flex-1">
            {children}
          </main>
        </AuthProvider>
        <SiteFooter />
        <FirebaseAnalytics />
      </body>
    </html>
  );
}
