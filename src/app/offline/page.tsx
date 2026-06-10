export default function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div className="text-6xl">📡</div>
      <div>
        <h1 className="text-2xl font-bold">You&rsquo;re offline</h1>
        <p className="mt-2 max-w-sm text-muted">
          DataForge needs a connection to load. Static tool pages you&apos;ve visited before may still be available — try navigating directly to a tool.
        </p>
      </div>
      <a href="/" className="rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700">
        Try homepage
      </a>
    </div>
  );
}
