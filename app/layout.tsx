import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Evergreen 5e - Encyclopedic Magic Item Balancing",
  description: "Balance custom D&D 5e magic items with educational anchor references from the SRD. Learn why items have certain rarities through direct comparison to known balanced items.",
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
