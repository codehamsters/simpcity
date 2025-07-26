import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Community",
  name: "SimpCity Leaderboard",
  url: "https://simpcity.vercel.app",
  description:
    "A friendly community leaderboard showcasing members of SimpCity, a welcoming group for friendly environment.",
  image: "https://simpcity.vercel.app/simpcity-logo.png",
  sameAs: ["https://instagram.com/simpcity.gc"],
};

export const metadata: Metadata = {
  title: "SimpCity Leaderboard",
  description:
    "Leaderboard of Members of SimpCity - A friendly community for groups",
  keywords: [
    "SimpCity",
    "Leaderboard",
    "Members",
    "Friendly Communities",
    "Groups",
  ],
  authors: [{ name: "Rohan Bansal", url: "https://instagram.com/onyrohanss" }],
  creator: "Rohan Bansal",
  openGraph: {
    title: "SimpCity Leaderboard",
    description: "Leaderboard of Members of SimpCity - A friendly group",
    url: "https://simpcity.vercel.app",
    siteName: "SimpCity Leaderboard",
    images: [
      {
        url: "https://simpcity.vercel.app/simpcity-logo.png",
        width: 1200,
        height: 630,
        alt: "SimpCity Leaderboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@simpcity_gc",
    creator: "@onyrohanss",
    title: "SimpCity Leaderboard",
    description: "Leaderboard of Members of SimpCity - A friendly group",
    images: [
      {
        url: "https://simpcity.vercel.app/simpcity-logo.png",
        width: 1200,
        height: 630,
        alt: "SimpCity Leaderboard",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
