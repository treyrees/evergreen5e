import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
