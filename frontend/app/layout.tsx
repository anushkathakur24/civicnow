import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import NavBar from "@/components/NavBar";

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
    default: "CivicNow — Turn awareness into verified civic action",
    template: "%s | CivicNow",
  },
  description:
    "Track India's most urgent civic issues and take real, verified action — matched to your role, time, and budget. Earn a fraud-resistant Impact Score for what you actually do.",
  openGraph: {
    title: "CivicNow — Turn awareness into verified civic action",
    description:
      "Track India's most urgent civic issues and take real, verified action — matched to your role, time, and budget.",
    url: SITE_URL,
    siteName: "CivicNow",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CivicNow — Turn awareness into verified civic action",
    description: "Track India's civic issues. Take verified action. Build a real Impact Score.",
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
            CivicNow is an independent civic-information project. Not affiliated with any government body, party, or NGO named on this site.
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
