import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import NavBar from "@/components/NavBar";
import JourneyStrip from "@/components/JourneyStrip";

// Self-hosted by Next at build time (no runtime font-fetching, no layout
// shift). Fraunces carries the big editorial headline moments (the "premium,
// calm" register); Inter stays the workhorse UI/body face for everything
// that needs to disappear and just be legible.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  weight: ["400", "500", "600"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://civicnow.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CivicNow — Know More. Do More.",
    template: "%s | CivicNow",
  },
  description:
    "Every Issue. Every Indian. Every Action Matters. CivicNow tracks India's most urgent civic issues and matches you to one real, verified action — for your role, your time, your city.",
  openGraph: {
    title: "CivicNow — Know More. Do More.",
    description:
      "Every issue deserves more than awareness. Track what's happening, see what's changed, take one real action.",
    url: SITE_URL,
    siteName: "CivicNow",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CivicNow — Know More. Do More.",
    description: "Every issue deserves more than awareness. Understand. Track. Act.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        <AuthProvider>
          <NavBar />
          <main>{children}</main>
          <footer className="mt-24 border-t border-line py-10 text-center text-xs text-ink/40">
            <p className="mb-1 font-serif text-sm font-medium tracking-tight text-ink/60">
              Know More. Do More.
            </p>
            <p className="mb-4 text-[11px] uppercase tracking-[0.15em] text-ink/35">
              For Every Issue. For Every Indian.
            </p>
            <JourneyStrip className="mb-5" />
            <p className="mx-auto mb-3 max-w-md">
              CivicNow is an independent civic-information project. Not affiliated with any government body, party, or NGO named on this site.
            </p>
            <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
              <Link href="/about" className="transition-colors hover:text-ink/70">About</Link>
              <Link href="/manifesto" className="transition-colors hover:text-ink/70">Our Manifesto</Link>
              <Link href="/methodology" className="transition-colors hover:text-ink/70">Methodology</Link>
              <Link href="/ngos/apply" className="transition-colors hover:text-ink/70">List your NGO</Link>
              <a
                href="https://github.com/anushkathakur24/civicnow"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-ink/70"
              >
                GitHub
              </a>
            </nav>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
