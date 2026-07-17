"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import RandomLetterSwap from "./RandomLetterSwap";

export default function NavBar() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight text-ink">
          <RandomLetterSwap text="CivicNow" />
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium text-ink/80">
          <Link href="/leaderboard" className="hover:text-ink">Leaderboard</Link>
          <Link href="/ngos" className="hover:text-ink">NGOs</Link>
          {!loading && user && (
            <Link href="/profile" className="hover:text-ink">My Profile</Link>
          )}
          {!loading && !user && (
            <>
              <Link href="/login" className="hover:text-ink">Log in</Link>
              <Link
                href="/register"
                className="rounded-full bg-saffron px-4 py-1.5 text-white hover:opacity-90"
              >
                Join CivicNow
              </Link>
            </>
          )}
          {!loading && user && (
            <button onClick={logout} className="text-ink/60 hover:text-ink">
              Log out
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
