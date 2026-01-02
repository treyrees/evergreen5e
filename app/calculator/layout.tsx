import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "D&D 5e Magic Item Balance Calculator",
  description: "Calculate if your homebrew magic item is balanced. Input damage, AC, charges, and abilities to get a score and suggested rarity. Compare against 67 official SRD items instantly.",
  alternates: {
    canonical: "/calculator",
  },
  openGraph: {
    title: "D&D 5e Magic Item Balance Calculator | Evergreen5e",
    description: "Free homebrew balance checker. Calculate your item's score, get a suggested rarity, and compare against official SRD items.",
    url: "https://evergreen5e.vercel.app/calculator",
  },
};

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
