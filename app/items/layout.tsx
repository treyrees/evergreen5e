import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "67 Official SRD Magic Items with Balance Scores",
  description: "Browse all 67 official D&D 5e SRD magic items with calculated balance scores. See how WotC balanced weapons, armor, and wondrous items. Use as reference for your homebrew.",
  alternates: {
    canonical: "/items",
  },
  openGraph: {
    title: "Official SRD Magic Items Database | Evergreen5e",
    description: "Browse 67 official D&D 5e magic items with balance scores. Perfect reference for creating balanced homebrew.",
    url: "https://evergreen5e.vercel.app/items",
  },
};

export default function ItemsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
