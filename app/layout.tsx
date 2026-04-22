import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Metaxon™ Protocol — Get Instant Access",
  description: "A structured system for optimizing cognitive performance. Trusted by 2,000+ high-performance professionals.",
  robots: "noindex, nofollow", // Keep checkout page private from SEO
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
