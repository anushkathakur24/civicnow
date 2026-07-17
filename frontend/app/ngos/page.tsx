import { api } from "@/lib/api";
import NgoBrowser from "./NgoBrowser";

export const revalidate = 300;
export const metadata = { title: "Verified NGOs" };

export default async function NgosPage() {
  let ngos: Awaited<ReturnType<typeof api.ngos>> = [];
  let error = false;
  try {
    ngos = await api.ngos();
  } catch {
    error = true;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-ink">NGOs on CivicNow</h1>
      <p className="mb-6 text-sm text-ink/55">
        &ldquo;Verified&rdquo; means registration (Darpan ID) has been confirmed — not an endorsement.
      </p>
      {error ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
          <p className="font-medium text-amber-900">Live information temporarily unavailable.</p>
          <p className="mt-1 text-sm text-amber-800/80">Couldn&apos;t reach the CivicNow API — try refreshing shortly.</p>
        </div>
      ) : (
        <NgoBrowser ngos={ngos} />
      )}
    </div>
  );
}
