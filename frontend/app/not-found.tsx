import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-5 py-28 text-center">
      <h1 className="mb-3 font-serif text-5xl font-medium text-ink">404</h1>
      <p className="mb-8 text-ink/55">This page doesn&apos;t exist, or the issue has been unpublished.</p>
      <Link href="/" className="rounded-full bg-ink px-5 py-2.5 text-white hover:opacity-85">
        Back to CivicNow
      </Link>
    </div>
  );
}
