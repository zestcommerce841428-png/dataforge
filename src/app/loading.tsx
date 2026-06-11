export default function Loading() {
  return (
    <div className="animate-pulse space-y-6 py-4" aria-label="Loading…" aria-busy="true">
      {/* Page header skeleton */}
      <div className="space-y-3">
        <div className="h-8 w-64 rounded-xl bg-[var(--surface-2)]" />
        <div className="h-4 w-96 max-w-full rounded-lg bg-[var(--surface-2)]" />
      </div>
      {/* Content cards skeleton */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="surface rounded-xl border p-4 shadow-sm">
            <div className="mb-3 h-3 w-16 rounded bg-[var(--surface-2)]" />
            <div className="mb-2 h-5 w-3/4 rounded-lg bg-[var(--surface-2)]" />
            <div className="h-3 w-full rounded bg-[var(--surface-2)]" />
            <div className="mt-1 h-3 w-2/3 rounded bg-[var(--surface-2)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
