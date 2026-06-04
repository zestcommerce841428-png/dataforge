"use client";
import { useMemo, useState } from "react";
import { SHORTCUT_APPS } from "./shortcuts-data";

function Keys({ combo }: { combo: string }) {
  // Split on + but keep multi-key sequences readable
  const parts = combo.split(/\s*\+\s*/);
  return (
    <span className="flex flex-wrap items-center gap-1">
      {parts.map((p, i) => (
        <kbd key={i} className="rounded border border-app bg-[var(--surface-2)] px-2 py-0.5 font-mono text-xs whitespace-nowrap">{p}</kbd>
      ))}
    </span>
  );
}

export function ShortcutsClient() {
  const [appId, setAppId] = useState(SHORTCUT_APPS[0].id);
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();

  // When searching, scan across ALL apps; otherwise show the selected app.
  const results = useMemo(() => {
    if (q) {
      return SHORTCUT_APPS.map((app) => ({
        app,
        groups: app.groups
          .map((g) => ({ ...g, items: g.items.filter((it) => it.action.toLowerCase().includes(q) || it.keys.toLowerCase().includes(q)) }))
          .filter((g) => g.items.length),
      })).filter((a) => a.groups.length);
    }
    const app = SHORTCUT_APPS.find((a) => a.id === appId)!;
    return [{ app, groups: app.groups }];
  }, [q, appId]);

  const total = SHORTCUT_APPS.reduce((s, a) => s + a.groups.reduce((t, g) => t + g.items.length, 0), 0);

  return (
    <div>
      <input
        className="input-field mb-4 w-full py-3 text-base"
        placeholder={`Search ${total} shortcuts across ${SHORTCUT_APPS.length} apps…`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {!q && (
        <div className="mb-6 flex flex-wrap gap-2">
          {SHORTCUT_APPS.map((a) => (
            <button
              key={a.id}
              onClick={() => setAppId(a.id)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors ${appId === a.id ? "border-brand-500 bg-brand-500/10 text-brand-600" : "surface hover:border-brand-400"}`}
            >
              <span aria-hidden>{a.icon}</span> {a.name}
            </button>
          ))}
        </div>
      )}

      {results.length === 0 && (
        <p className="py-16 text-center text-muted">No shortcuts match &ldquo;{query}&rdquo;.</p>
      )}

      <div className="space-y-8">
        {results.map(({ app, groups }) => (
          <section key={app.id}>
            {q && <h2 className="mb-3 flex items-center gap-2 text-lg font-bold"><span aria-hidden>{app.icon}</span> {app.name}</h2>}
            <div className="grid gap-4 md:grid-cols-2">
              {groups.map((g) => (
                <div key={g.title} className="surface rounded-2xl border p-4">
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">{g.title}</h3>
                  <ul className="space-y-2">
                    {g.items.map((it, i) => (
                      <li key={i} className="flex items-center justify-between gap-3">
                        <span className="text-sm">{it.action}</span>
                        <Keys combo={it.keys} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
