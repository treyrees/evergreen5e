import type { Metadata } from "next";
import { Cinzel, DM_Sans } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cinzel",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HomebrewQA - D&D 5e Magic Item Balance Calculator",
  description: "Balance custom D&D 5e magic items using deterministic formulas. No AI or LLMs - pure math-based calculations with SRD anchor comparisons.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cinzel.variable} ${dmSans.variable}`}>
      <body className="antialiased">
        {/* Ambient drifting motes */}
        <div className="ambient-motes" aria-hidden="true">
          <div className="mote" />
          <div className="mote" />
          <div className="mote" />
          <div className="mote" />
          <div className="mote" />
        </div>
        {children}
      </body>
    </html>
  );
}
