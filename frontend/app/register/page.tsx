"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { PERSONAS } from "@/lib/personas";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
    display_name: "",
    persona_id: "citizen",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await register(form);
      router.push("/profile");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-2 text-2xl font-bold text-ink">Join CivicNow</h1>
      <p className="mb-6 text-sm text-ink/60">
        Note: to prevent score-farming, new accounts can start submitting actions after 24 hours and email verification.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          required
          placeholder="Display name"
          value={form.display_name}
          onChange={(e) => update("display_name", e.target.value)}
          className="w-full rounded-lg border border-black/15 px-3 py-2"
        />
        <input
          required
          placeholder="Username"
          pattern="[a-zA-Z0-9_]+"
          value={form.username}
          onChange={(e) => update("username", e.target.value)}
          className="w-full rounded-lg border border-black/15 px-3 py-2"
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          className="w-full rounded-lg border border-black/15 px-3 py-2"
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="Password (min 8 characters)"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          className="w-full rounded-lg border border-black/15 px-3 py-2"
        />
        <select
          value={form.persona_id}
          onChange={(e) => update("persona_id", e.target.value)}
          className="w-full rounded-lg border border-black/15 px-3 py-2"
        >
          {PERSONAS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={busy}
          className="w-full rounded-full bg-saffron py-2.5 font-medium text-white disabled:opacity-50"
        >
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-sm text-ink/60">
        Already have an account? <Link href="/login" className="text-teal hover:underline">Log in</Link>
      </p>
    </div>
  );
}
