"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function NavBar() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="glass sticky top-0 z-50 border-b border-line/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-baseline gap-2.5">
          <span className="font-serif text-lg font-medium tracking-tight text-ink">CivicNow</span>
          <span className="hidden text-[11px] font-medium uppercase tracking-[0.15em] text-ink/35 sm:inline">
            Know More. Do More.
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-ink/65 sm:gap-6">
          {/* Secondary links collapse on small screens so the mobile header
              stays uncluttered — the hero and footer already surface these
              paths, so nothing is unreachable, just quieter on mobile. */}
          <Link href="/leaderboard" className="hidden transition-colors hover:text-ink sm:inline">Leaderboard</Link>
          <Link href="/ngos" className="hidden transition-colors hover:text-ink sm:inline">NGOs</Link>
          <Link href="/about" className="hidden transition-colors hover:text-ink sm:inline">About</Link>
          {!loading && user && (
            <Link href="/profile" className="transition-colors hover:text-ink">My Profile</Link>
          )}
          {!loading && !user && (
            <>
              <Link href="/login" className="transition-colors hover:text-ink">Log in</Link>
              <Link
                href="/register"
                className="rounded-full bg-ink px-3.5 py-2 text-white transition-opacity hover:opacity-85 sm:px-4"
              >
                Join CivicNow
              </Link>
            </>
          )}
          {!loading && user && (
            <button onClick={logout} className="transition-colors hover:text-ink">
              Log out
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
