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

        {/* Ko-fi support footer */}
        <footer className="mt-16 pb-6 text-center">
          <a
            href="https://ko-fi.com/tacardidm"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
              aria-hidden="true"
            >
              {/* Elixir/potion bottle icon */}
              <path d="M9 2v2H8a1 1 0 00-1 1v1.5a1.5 1.5 0 001.5 1.5h.5v1.17A6.5 6.5 0 005 15.5V19a3 3 0 003 3h8a3 3 0 003-3v-3.5a6.5 6.5 0 00-4-6.33V9h.5a1.5 1.5 0 001.5-1.5V6a1 1 0 00-1-1h-1V2H9zm1 7.83V9h4v.83a6.5 6.5 0 012 2.17H8a6.5 6.5 0 012-2.17zM8 14h8v5a1 1 0 01-1 1H9a1 1 0 01-1-1v-5z" />
            </svg>
            Support this project
          </a>
        </footer>
      </body>
    </html>
  );
}
