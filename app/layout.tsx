import type { Metadata } from "next";
import { Cinzel, DM_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from "@/components/Providers";
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

const siteUrl = "https://evergreen5e.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "Evergreen5e - D&D 5e Magic Item Balance Calculator",
    template: "%s | Evergreen5e",
  },
  description: "Is your homebrew magic item balanced? Check it instantly with our free D&D 5e balance calculator. Compare against 67 official SRD items using transparent, math-based formulas.",
  keywords: [
    "D&D 5e",
    "homebrew balance",
    "magic item calculator",
    "is my item balanced",
    "D&D homebrew",
    "5e magic items",
    "homebrew magic item",
    "D&D item rarity",
    "balance calculator",
    "SRD items",
    "dungeons and dragons",
    "homebrew tool",
  ],
  authors: [{ name: "Evergreen5e" }],
  creator: "Evergreen5e",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Evergreen5e",
    title: "Is Your Homebrew Balanced? | D&D 5e Magic Item Calculator",
    description: "Free tool to check if your D&D 5e homebrew magic item is balanced. Compare against 67 official SRD items with transparent math-based formulas. No AI, no guesswork.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Evergreen5e - D&D 5e Magic Item Balance Calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Is Your Homebrew Balanced? | D&D 5e Magic Item Calculator",
    description: "Free tool to check if your D&D 5e homebrew magic item is balanced. Compare against 67 official SRD items.",
    images: ["/og-image.png"],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cinzel.variable} ${dmSans.variable}`}>
      <body className="antialiased">
        <Providers>
          {/* Ambient drifting motes */}
          <div className="ambient-motes" aria-hidden="true">
            <div className="mote" />
            <div className="mote" />
            <div className="mote" />
            <div className="mote" />
            <div className="mote" />
          </div>
          {children}

          {/* Footer */}
          <footer className="mt-16 pb-6 text-center space-y-3">
          <p className="text-xs text-gray-500">
            Your inputs stay here. Evergreen5e doesn&apos;t use AI chatbots to deliver answers.
          </p>
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
            Buy the forgemaster another mead!
            </a>
          </footer>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
