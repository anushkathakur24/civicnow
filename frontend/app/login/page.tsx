"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      router.push("/profile");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-20">
      <h1 className="mb-8 font-serif text-display-sm font-medium text-ink">Log in</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button disabled={busy} className="w-full py-3">
          {busy ? "Logging in…" : "Log in"}
        </Button>
      </form>
      <p className="mt-5 text-sm text-ink/55">
        No account? <Link href="/register" className="text-accent-dark hover:underline">Register</Link>
      </p>
    </div>
  );
}
