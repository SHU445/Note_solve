import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SEO_CONFIG } from "@/lib/seo-config";
import { StructuredData } from "@/components/StructuredData";

const inter = Inter({ subsets: ["latin"] });

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" }
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SEO_CONFIG.baseUrl),
  title: {
    default: "Problem Notes - Résolvez vos problèmes de manière structurée",
    template: "%s | Problem Notes"
  },
  description: SEO_CONFIG.siteDescription,
  keywords: SEO_CONFIG.keywords,
  authors: [{ name: SEO_CONFIG.siteName }],
  creator: SEO_CONFIG.siteName,
  publisher: SEO_CONFIG.siteName,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: SEO_CONFIG.baseUrl,
    siteName: SEO_CONFIG.siteName,
    title: 'Problem Notes - Résolvez vos problèmes de manière structurée',
    description: SEO_CONFIG.siteDescription,
    images: [
      {
        url: SEO_CONFIG.ogImage,
        width: 1200,
        height: 630,
        alt: 'Problem Notes - Organisation et résolution de problèmes',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Problem Notes - Résolvez vos problèmes de manière structurée',
    description: SEO_CONFIG.siteDescription,
    images: [SEO_CONFIG.ogImage],
    creator: SEO_CONFIG.twitterHandle,
  },
  alternates: {
    canonical: SEO_CONFIG.baseUrl,
  },
  category: 'productivity',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <StructuredData />
      </head>
      <body className={`${inter.className} antialiased min-h-screen bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
