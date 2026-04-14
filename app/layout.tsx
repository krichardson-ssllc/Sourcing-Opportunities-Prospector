import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Opportunity Finder",
  description: "Search public-source geographic opportunity signals for sales reps."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
