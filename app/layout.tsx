import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Surplus Solutions Sourcing Opportunity Tool",
  description: "Search public biotech and pharma sourcing signals by geography."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
