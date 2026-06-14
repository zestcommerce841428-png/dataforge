"use client";

import { useState } from "react";

interface CertResult {
  domain: string;
  subject: string;
  issuer: string;
  issuerCN: string;
  validFrom: string;
  validTo: string;
  daysLeft: number;
  daysTotal: number;
  san: string[];
  fingerprint: string;
  fingerprint256: string;
  protocol: string;
  cipher: string;
  expired: boolean;
  expiringSoon: boolean;
}

const INPUT_CLS =
  "w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

function StatusBadge({ result }: { result: CertResult }) {
  if (result.expired)
    return <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 dark:bg-red-950/40 dark:text-red-400">EXPIRED</span>;
  if (result.expiringSoon)
    return <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400">EXPIRING SOON</span>;
  return <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 dark:bg-green-950/40 dark:text-green-400">VALID</span>;
}

function DaysBar({ daysLeft, daysTotal }: { daysLeft: number; daysTotal: number }) {
  const pct = Math.max(0, Math.min(100, (daysLeft / daysTotal) * 100));
  const color = daysLeft < 0 ? "bg-red-500" : daysLeft <= 30 ? "bg-yellow-400" : "bg-green-500";
  return (
    <div className="mt-2 h-2 w-full rounded-full bg-[var(--surface-2)]">
      <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

const EXAMPLES = ["google.com", "github.com", "stripe.com", "cloudflare.com"];

export default function SslCheckerPage() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CertResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function check(d?: string) {
    const target = (d ?? domain).trim();
    if (!target) return;
    setLoading(true); setResult(null); setError(null);
    try {
      const res = await fetch(`/api/ssl-check?domain=${encodeURIComponent(target)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">SSL/TLS Certificate Checker</h1>
        <p className="mt-1 text-sm text-muted">
          Inspect any domain's certificate — expiry, issuer, SANs, cipher, and fingerprint.
        </p>
      </div>

      {/* Input */}
      <div className="surface mb-4 rounded-2xl border border-app p-5">
        <form onSubmit={(e) => { e.preventDefault(); check(); }} className="flex gap-3">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com or https://example.com"
            className={INPUT_CLS}
            aria-label="Domain to check"
          />
          <button
            type="submit"
            disabled={loading || !domain.trim()}
            className="shrink-0 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? "Checking…" : "Check"}
          </button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs text-muted">Try:</span>
          {EXAMPLES.map((e) => (
            <button key={e} type="button"
              onClick={() => { setDomain(e); check(e); }}
              className="rounded-lg border border-app px-2.5 py-1 text-xs hover:bg-[var(--surface-2)] hover:text-brand-600">
              {e}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {/* Header card */}
          <div className="surface rounded-2xl border border-app p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">{result.domain}</h2>
                <p className="text-sm text-muted">{result.subject}</p>
              </div>
              <StatusBadge result={result} />
            </div>

            <DaysBar daysLeft={result.daysLeft} daysTotal={result.daysTotal} />
            <p className="mt-1.5 text-sm">
              {result.expired
                ? <span className="font-semibold text-red-600">Expired {Math.abs(result.daysLeft)} days ago</span>
                : <span className={result.expiringSoon ? "font-semibold text-yellow-600" : "text-[var(--text)]"}>
                    <span className="font-bold text-brand-600">{result.daysLeft}</span> days remaining
                  </span>
              }
            </p>
          </div>

          {/* Details grid */}
          <div className="surface rounded-2xl border border-app p-5">
            <h3 className="mb-4 font-semibold">Certificate details</h3>
            <dl className="space-y-3">
              {[
                { label: "Issued to", value: result.subject },
                { label: "Issued by", value: `${result.issuer}${result.issuerCN && result.issuerCN !== result.issuer ? ` (${result.issuerCN})` : ""}` },
                { label: "Valid from", value: new Date(result.validFrom).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) },
                { label: "Expires on", value: new Date(result.validTo).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) },
                { label: "Protocol", value: result.protocol || "—" },
                { label: "Cipher", value: result.cipher || "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-4 text-sm">
                  <dt className="w-32 shrink-0 font-medium text-muted">{label}</dt>
                  <dd className="break-all">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* SANs */}
          {result.san.length > 0 && (
            <div className="surface rounded-2xl border border-app p-5">
              <h3 className="mb-3 font-semibold">Subject Alternative Names ({result.san.length})</h3>
              <div className="flex flex-wrap gap-2">
                {result.san.map((s) => (
                  <span key={s} className="rounded-lg bg-[var(--surface-2)] px-2.5 py-1 font-mono text-xs">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Fingerprints */}
          <div className="surface rounded-2xl border border-app p-5">
            <h3 className="mb-3 font-semibold">Fingerprints</h3>
            <dl className="space-y-2 text-xs font-mono">
              {result.fingerprint && (
                <div>
                  <dt className="mb-0.5 text-xs font-sans font-medium text-muted">SHA-1</dt>
                  <dd className="break-all rounded-lg bg-[var(--surface-2)] px-3 py-2">{result.fingerprint}</dd>
                </div>
              )}
              {result.fingerprint256 && (
                <div>
                  <dt className="mb-0.5 text-xs font-sans font-medium text-muted">SHA-256</dt>
                  <dd className="break-all rounded-lg bg-[var(--surface-2)] px-3 py-2">{result.fingerprint256}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
