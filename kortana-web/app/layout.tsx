import type { Metadata, Viewport } from "next";
import { Outfit, Space_Grotesk } from "next/font/google";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

const BASE_URL = "https://kortana.xyz";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Kortana | Industrial-Grade Layer 1 Blockchain",
    template: "%s | Kortana Blockchain",
  },
  description:
    "Kortana is an EVM-compatible Layer 1 blockchain with 2-second block times, sub-2s BFT finality, 50,000+ TPS, and 500 Billion DNR total supply. Built for high-frequency finance and institutional DeFi.",
  keywords: [
    "Kortana",
    "DNR token",
    "Layer 1 blockchain",
    "EVM compatible",
    "DeFi blockchain",
    "Delegated Proof of History",
    "DPoH consensus",
    "Quorlin VM",
    "smart contracts",
    "fast finality blockchain",
    "institutional blockchain",
    "Chain ID 9002",
    "500 billion DNR",
    "Kortana mainnet",
    "kortana testnet",
  ],
  authors: [{ name: "Kortana Foundation", url: BASE_URL }],
  creator: "Kortana Foundation",
  publisher: "Kortana Foundation",
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
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Kortana Blockchain",
    title: "Kortana | Industrial-Grade Layer 1 Blockchain",
    description:
      "EVM-compatible L1 with 2s block times, sub-2s BFT finality, 50,000+ TPS. Chain ID: 9002. Native token: DNR. Built for institutional finance.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kortana Blockchain — Industrial-Grade Layer 1",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@KortanaChain",
    creator: "@KortanaChain",
    title: "Kortana | Industrial-Grade Layer 1 Blockchain",
    description:
      "EVM-compatible L1 with 2s blocks, 50,000+ TPS, and 500B DNR supply. Chain ID 9002. Built for institutional DeFi.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#05071a" },
    { media: "(prefers-color-scheme: light)", color: "#05071a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${spaceGrotesk.variable} antialiased bg-deep-space text-white font-sans`}
        suppressHydrationWarning
      >
        <Navbar />
        <main className="min-h-screen pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
