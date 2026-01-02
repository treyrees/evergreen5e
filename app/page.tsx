import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Is Your Homebrew Balanced? | Free D&D 5e Magic Item Calculator",
  description: "Check if your D&D 5e homebrew magic item is balanced. Compare against 67 official SRD items using transparent formulas. Free, instant results, no signup required.",
  alternates: {
    canonical: "/",
  },
};

// JSON-LD structured data for rich search results
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Evergreen5e Magic Item Balance Calculator",
  description: "Free tool to check if your D&D 5e homebrew magic item is balanced by comparing against official SRD items",
  url: "https://evergreen5e.vercel.app",
  applicationCategory: "GameApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Calculate magic item balance scores",
    "Compare against 67 official SRD items",
    "Suggest appropriate rarity tier",
    "Transparent math-based formulas",
    "No AI or guesswork",
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="flex-1 flex flex-col items-center justify-center max-w-xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-white">
            Is Your Homebrew Balanced?
          </h1>
          <p className="text-xl text-slate-400">
            Compare your homebrew against official SRD items using reverse-engineered formulas. Transparent math, instant results, no guesswork.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 pt-4">
          <Link
            href="/calculator"
            className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-lg px-10 py-4 rounded-lg transition-colors shadow-lg hover:shadow-xl min-w-[200px]"
          >
            Balance My Item
            <span className="ml-2">→</span>
          </Link>
          <Link
            href="/items"
            className="text-sm text-slate-500 hover:text-slate-400 transition-colors"
          >
            Explore 67 official items →
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}
