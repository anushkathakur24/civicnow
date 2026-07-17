"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth";
import { api, ScoreBreakdown } from "@/lib/api";
import Reveal from "@/components/ui/Reveal";

function ProfileInner() {
  const { user, refresh } = useAuth();
  const [score, setScore] = useState<ScoreBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [privacyBusy, setPrivacyBusy] = useState<string | null>(null);

  useEffect(() => {
    api
      .myScore()
      .then(setScore)
      .finally(() => setLoading(false));
  }, []);

  async function togglePrivacy(key: "leaderboard_opt_in" | "show_real_name_public", value: boolean) {
    setPrivacyBusy(key);
    try {
      await api.updatePrivacy({ [key]: value });
      await refresh();
    } finally {
      setPrivacyBusy(null);
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <Reveal>
        <h1 className="mb-1 font-serif text-display-sm font-medium text-ink">{user.display_name}</h1>
        <p className="mb-8 text-sm text-ink/55">@{user.username}</p>
      </Reveal>

      {loading ? (
        <div className="animate-pulse rounded-4xl border border-line bg-white p-8">
          <div className="mb-2 h-3 w-24 rounded bg-mist" />
          <div className="mb-4 h-12 w-20 rounded bg-mist" />
          <div className="mb-6 h-6 w-28 rounded-full bg-mist" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i}>
                <div className="mb-1 h-5 w-8 rounded bg-mist" />
                <div className="h-3 w-16 rounded bg-mist" />
              </div>
            ))}
          </div>
        </div>
      ) : score ? (
        <Reveal delay={0.1}>
          <div className="rounded-4xl border border-line bg-gradient-to-br from-accent-soft/50 to-white p-8 shadow-soft">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink/45">Impact Score</div>
            <div className="mb-4 font-serif text-6xl font-medium text-ink">{score.impact_score}</div>
            <div className="mb-8 inline-block rounded-full bg-ink px-3.5 py-1.5 text-xs font-medium text-white">
              {score.tier}
            </div>
            <div className="grid grid-cols-2 gap-5 border-t border-line pt-6 text-sm sm:grid-cols-3">
              <Stat label="Issues supported" value={score.issues_supported} />
              <Stat label="RTI / grievance" value={score.rti_grievance_count} />
              <Stat label="Volunteering" value={score.volunteering_count} />
              <Stat label="Awareness" value={score.awareness_count} />
              <Stat label="Donations" value={score.donation_count} />
              <Stat label="Advocacy" value={score.advocacy_count} />
              <Stat label="Current streak" value={`${score.current_streak}d`} />
            </div>
          </div>
        </Reveal>
      ) : (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-center">
          <p className="font-medium text-amber-900">Live information temporarily unavailable.</p>
          <p className="mt-1 text-sm text-amber-800/80">Couldn&apos;t load your Impact Score — try refreshing.</p>
        </div>
      )}

      <Reveal delay={0.15}>
        <div className="mt-6 rounded-3xl border border-line bg-white p-6">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink/45">Privacy</h2>
          <p className="mb-5 text-xs text-ink/40">Both of these can be changed anytime — neither is a one-time choice.</p>
          <div className="space-y-4">
            <PrivacyToggle
              label="Appear on the public leaderboard"
              description="Off by default. When off, you never appear on /leaderboard at all."
              checked={user.leaderboard_opt_in}
              busy={privacyBusy === "leaderboard_opt_in"}
              onChange={(v) => togglePrivacy("leaderboard_opt_in", v)}
            />
            <PrivacyToggle
              label="Show my real name and username"
              description={
                user.leaderboard_opt_in
                  ? "Off by default — you appear as “Anonymous Citizen” instead of your name."
                  : "Only matters once you appear on the leaderboard."
              }
              checked={user.show_real_name_public}
              busy={privacyBusy === "show_real_name_public"}
              onChange={(v) => togglePrivacy("show_real_name_public", v)}
            />
          </div>
        </div>
      </Reveal>
    </div>
  );
}

function PrivacyToggle({
  label,
  description,
  checked,
  busy,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  busy: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-sm font-medium text-ink">{label}</div>
        <div className="mt-0.5 text-xs text-ink/45">{description}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={busy}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 disabled:opacity-50 ${
          checked ? "bg-teal" : "bg-mist"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-transform duration-200 ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="font-serif text-lg font-medium text-ink">{value}</div>
      <div className="text-xs text-ink/45">{label}</div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileInner />
    </ProtectedRoute>
  );
}
