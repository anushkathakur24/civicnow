import Link from "next/link";
import { api } from "@/lib/api";
import NgoBrowser from "./NgoBrowser";
import Reveal from "@/components/ui/Reveal";

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
    <div className="mx-auto max-w-2xl px-5 py-16">
      <Reveal>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="mb-1 font-serif text-display-sm font-medium text-ink">NGOs on CivicNow</h1>
            <p className="text-sm text-ink/55">
              &ldquo;Verified&rdquo; means registration (Darpan ID) has been confirmed — not an endorsement.
            </p>
          </div>
          <Link
            href="/ngos/apply"
            className="inline-flex shrink-0 items-center justify-center rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink/25 hover:bg-mist/60"
          >
            List your NGO →
          </Link>
        </div>
        {!error && ngos.length < 6 && (
          <p className="mb-8 rounded-2xl border border-line bg-mist/40 p-4 text-xs leading-relaxed text-ink/55">
            CivicNow is in early access — this directory is small because we&apos;re growing it
            deliberately, one verified organisation at a time, rather than importing a list we
            haven&apos;t checked. If you run or know an NGO working on any issue tracked here,{" "}
            <Link href="/ngos/apply" className="font-medium text-accent-dark hover:underline">
              help us add it
            </Link>.
          </p>
        )}
      </Reveal>
      {error ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-center">
          <p className="font-medium text-amber-900">Live information temporarily unavailable.</p>
          <p className="mt-1 text-sm text-amber-800/80">Couldn&apos;t reach the CivicNow API — try refreshing shortly.</p>
        </div>
      ) : (
        <NgoBrowser ngos={ngos} />
      )}
    </div>
  );
}
