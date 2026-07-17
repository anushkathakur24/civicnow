import { api } from "@/lib/api";

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
      <h1 className="mb-6 text-2xl font-bold text-ink">NGOs on CivicNow</h1>
      {error && <p className="text-red-600">Couldn&apos;t load NGOs.</p>}
      <div className="space-y-3">
        {ngos.map((n) => (
          <div key={n.id} className="flex items-center justify-between rounded-xl border border-black/10 bg-white p-4">
            <div>
              <div className="font-medium text-ink">{n.name}</div>
              {n.city ? <div className="text-sm text-ink/50">{String(n.city)}</div> : null}
            </div>
            {n.verified && (
              <span className="rounded-full bg-teal/10 px-2.5 py-1 text-xs font-semibold text-teal">Verified</span>
            )}
          </div>
        ))}
        {ngos.length === 0 && !error && <p className="text-sm text-ink/50">No NGOs listed yet.</p>}
      </div>
    </div>
  );
}
