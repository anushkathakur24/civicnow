"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { PERSONAS } from "@/lib/personas";
import { Button } from "@/components/ui/Button";

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

  const inputClass =
    "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent";

  return (
    <div className="mx-auto max-w-sm px-5 py-20">
      <h1 className="mb-2 font-serif text-display-sm font-medium text-ink">Join CivicNow</h1>
      <p className="mb-8 text-sm text-ink/55">
        Note: to prevent score-farming, new accounts can start submitting actions after 24 hours and email verification.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          required
          placeholder="Display name"
          value={form.display_name}
          onChange={(e) => update("display_name", e.target.value)}
          className={inputClass}
        />
        <input
          required
          placeholder="Username"
          pattern="[a-zA-Z0-9_]+"
          value={form.username}
          onChange={(e) => update("username", e.target.value)}
          className={inputClass}
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          className={inputClass}
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="Password (min 8 characters)"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          className={inputClass}
        />
        <select
          value={form.persona_id}
          onChange={(e) => update("persona_id", e.target.value)}
          className={inputClass}
        >
          {PERSONAS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button disabled={busy} className="w-full py-3">
          {busy ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <p className="mt-5 text-sm text-ink/55">
        Already have an account? <Link href="/login" className="text-accent-dark hover:underline">Log in</Link>
      </p>
    </div>
  );
}
