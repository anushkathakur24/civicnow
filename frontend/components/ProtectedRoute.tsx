"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl animate-pulse px-4 py-12">
        <div className="mb-1 h-6 w-40 rounded bg-black/10" />
        <div className="mb-8 h-4 w-24 rounded bg-black/5" />
        <div className="h-48 w-full rounded-3xl bg-black/5" />
      </div>
    );
  }
  if (!user) return null;
  return <>{children}</>;
}
