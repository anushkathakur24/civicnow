import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="mb-2 text-4xl font-bold text-ink">404</h1>
      <p className="mb-6 text-ink/70">This page doesn&apos;t exist — or the issue has been unpublished.</p>
      <Link href="/" className="rounded-full bg-saffron px-5 py-2 text-white">
        Back to CivicNow
      </Link>
    </div>
  );
}
