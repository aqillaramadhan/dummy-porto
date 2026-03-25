import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aqilla — AI & Data Alchemist · Portfolio 2026",
  description:
    "Mahasiswa Artificial Intelligence dan Data Analyst. Memimpin Ceteris Paribus dalam berbagai inovasi.",
  openGraph: {
    title: "Aqilla — Digital Renaissance Portfolio",
    description: "AI & Data Science · Crafting the Digital Renaissance.",
    type: "website",
  },
};

/**
 * Fonts are loaded via next/font/google in page.tsx (Playfair Display + Inter).
 * next/font self-hosts the fonts and injects CSS variables automatically —
 * no <link> tags or @import needed here.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}