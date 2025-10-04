import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Problem Notes - Résolvez vos problèmes de manière structurée",
  description: "Organisez vos idées, tâches et liens pour résoudre efficacement vos problèmes complexes. Interface moderne avec drag & drop, export/import JSON et sauvegarde automatique.",
  keywords: ["notes", "problèmes", "organisation", "productivité", "résolution", "brainstorming"],
  authors: [{ name: "Problem Notes" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" }
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} antialiased min-h-screen bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
