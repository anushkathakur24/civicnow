import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import NavBar from "@/components/NavBar";

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
    <html lang="en">
      <body className="min-h-screen bg-[#FAFAF8] font-sans text-ink antialiased">
        <AuthProvider>
          <NavBar />
          <main>{children}</main>
          <footer className="mt-16 border-t border-black/10 py-8 text-center text-xs text-ink/50">
            CivicNow is an independent civic-information project. Not affiliated with any government body, party, or NGO named on this site.
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
