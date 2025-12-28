import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Evergreen 5e - Magic Item Balance Calculator",
  description: "D&D 5e magic item rarity calculator based on combat power and ribbon features",
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
