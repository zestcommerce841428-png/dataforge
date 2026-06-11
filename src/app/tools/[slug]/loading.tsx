export default function ToolLoading() {
  return (
    <div className="animate-pulse" aria-label="Loading tool…" aria-busy="true">
      <div className="mb-4 flex gap-2">
        <div className="h-4 w-12 rounded bg-[var(--surface-2)]" />
        <div className="h-4 w-4 rounded bg-[var(--surface-2)]" />
        <div className="h-4 w-24 rounded bg-[var(--surface-2)]" />
        <div className="h-4 w-4 rounded bg-[var(--surface-2)]" />
        <div className="h-4 w-32 rounded bg-[var(--surface-2)]" />
      </div>
      <div className="mb-8 space-y-3">
        <div className="h-9 w-72 rounded-xl bg-[var(--surface-2)]" />
        <div className="h-4 w-96 max-w-full rounded-lg bg-[var(--surface-2)]" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="surface h-80 rounded-2xl border p-5 shadow-sm">
          <div className="mb-4 h-3 w-16 rounded bg-[var(--surface-2)]" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="mb-1.5 h-3 w-20 rounded bg-[var(--surface-2)]" />
                <div className="h-9 w-full rounded-lg bg-[var(--surface-2)]" />
              </div>
            ))}
          </div>
        </div>
        <div className="surface h-64 rounded-2xl border p-5 shadow-sm">
          <div className="mb-3 h-3 w-16 rounded bg-[var(--surface-2)]" />
          <div className="h-full w-full rounded-xl bg-[var(--surface-2)]" />
        </div>
      </div>
    </div>
  );
}
