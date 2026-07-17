"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth";
import { api, ScoreBreakdown } from "@/lib/api";

function ProfileInner() {
  const { user } = useAuth();
  const [score, setScore] = useState<ScoreBreakdown | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .myScore()
      .then(setScore)
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-1 text-2xl font-bold text-ink">{user.display_name}</h1>
      <p className="mb-8 text-sm text-ink/60">@{user.username}</p>

      {loading ? (
        <p className="text-ink/50">Loading Impact Score…</p>
      ) : score ? (
        <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-teal/10 to-white p-8">
          <div className="mb-1 text-xs font-semibold uppercase text-ink/50">Impact Score</div>
          <div className="mb-4 text-5xl font-bold text-ink">{score.impact_score}</div>
          <div className="mb-6 inline-block rounded-full bg-ink px-3 py-1 text-xs font-medium text-white">
            {score.tier}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <Stat label="Issues supported" value={score.issues_supported} />
            <Stat label="RTI / grievance" value={score.rti_grievance_count} />
            <Stat label="Volunteering" value={score.volunteering_count} />
            <Stat label="Awareness" value={score.awareness_count} />
            <Stat label="Donations" value={score.donation_count} />
            <Stat label="Advocacy" value={score.advocacy_count} />
            <Stat label="Current streak" value={`${score.current_streak}d`} />
          </div>
        </div>
      ) : (
        <p className="text-ink/50">Couldn&apos;t load your Impact Score.</p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-lg font-semibold text-ink">{value}</div>
      <div className="text-xs text-ink/50">{label}</div>
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
