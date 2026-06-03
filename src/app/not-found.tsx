import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid place-items-center py-24 text-center">
      <p className="text-6xl font-black text-brand-600">404</p>
      <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-muted">The generator you&apos;re looking for doesn&apos;t exist.</p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-md hover:bg-brand-700"
      >
        Back home
      </Link>
    </div>
  );
}
