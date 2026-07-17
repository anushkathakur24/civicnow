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
      <div className="mx-auto max-w-2xl animate-pulse px-5 py-16">
        <div className="mb-1 h-7 w-40 rounded bg-mist" />
        <div className="mb-8 h-4 w-24 rounded bg-mist" />
        <div className="h-48 w-full rounded-4xl bg-mist" />
      </div>
    );
  }
  if (!user) return null;
  return <>{children}</>;
}
