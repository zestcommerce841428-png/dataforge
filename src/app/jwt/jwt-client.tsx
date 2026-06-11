"use client";

import { useMemo, useState } from "react";

const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

function b64urlDecode(s: string): string {
  try {
    const padded = s.replace(/-/g, "+").replace(/_/g, "/").padEnd(s.length + ((4 - (s.length % 4)) % 4), "=");
    return atob(padded);
  } catch {
    return "";
  }
}

function parseJwt(token: string) {
  const parts = token.trim().split(".");
  if (parts.length !== 3) return null;
  try {
    const header  = JSON.parse(b64urlDecode(parts[0]));
    const payload = JSON.parse(b64urlDecode(parts[1]));
    return { header, payload, signature: parts[2], raw: parts };
  } catch {
    return null;
  }
}

function timeAgo(ts: number): string {
  const now = Date.now() / 1000;
  const diff = ts - now;
  if (diff < 0) {
    const ago = -diff;
    if (ago < 60) return `expired ${Math.round(ago)}s ago`;
    if (ago < 3600) return `expired ${Math.round(ago / 60)}m ago`;
    if (ago < 86400) return `expired ${Math.round(ago / 3600)}h ago`;
    return `expired ${Math.round(ago / 86400)}d ago`;
  }
  if (diff < 60) return `expires in ${Math.round(diff)}s`;
  if (diff < 3600) return `expires in ${Math.round(diff / 60)}m`;
  if (diff < 86400) return `expires in ${Math.round(diff / 3600)}h`;
  return `expires in ${Math.round(diff / 86400)}d`;
}

const CLAIM_INFO: Record<string, string> = {
  sub: "Subject — identifies the principal that is the subject of the JWT",
  iss: "Issuer — identifies the principal that issued the JWT",
  aud: "Audience — identifies the recipients that the JWT is intended for",
  exp: "Expiration Time — the time after which the JWT must not be accepted",
  iat: "Issued At — the time at which the JWT was issued",
  nbf: "Not Before — the time before which the JWT must not be accepted",
  jti: "JWT ID — unique identifier for the JWT",
  name: "Full name of the user",
  email: "Email address of the user",
  roles: "Roles assigned to the user",
  scope: "OAuth 2.0 scope of access",
};

function JsonBlock({ data }: { data: unknown }) {
  return (
    <pre className="surface-2 overflow-auto rounded-xl border border-app p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap break-all">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

async function verifyHmac(token: string, secret: string, alg: string): Promise<boolean> {
  try {
    const [headerB64, payloadB64, sigB64] = token.split(".");
    const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const keyData = new TextEncoder().encode(secret);
    const hashAlg = alg === "HS256" ? "SHA-256" : alg === "HS384" ? "SHA-384" : "SHA-512";
    const key = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: hashAlg }, false, ["verify"]);
    const sigBytes = Uint8Array.from(atob(sigB64.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
    return await crypto.subtle.verify("HMAC", key, sigBytes, data);
  } catch {
    return false;
  }
}

export function JwtDebugger() {
  const [token, setToken] = useState(SAMPLE_JWT);
  const [secret, setSecret] = useState("");
  const [verified, setVerified] = useState<boolean | null>(null);
  const [verifying, setVerifying] = useState(false);

  const parsed = useMemo(() => parseJwt(token), [token]);

  const isExpired = parsed?.payload?.exp ? Date.now() / 1000 > parsed.payload.exp : null;
  const isHmac = parsed?.header?.alg?.startsWith("HS");

  const handleVerify = async () => {
    if (!parsed || !secret || !isHmac) return;
    setVerifying(true);
    const ok = await verifyHmac(token.trim(), secret, parsed.header.alg);
    setVerified(ok);
    setVerifying(false);
  };

  const alg = parsed?.header?.alg ?? "";
  const algColor =
    alg.startsWith("HS") ? "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300" :
    alg.startsWith("RS") ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" :
    alg.startsWith("ES") ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" :
    "bg-[var(--surface-2)] text-muted";

  return (
    <div className="space-y-5">
      {/* Token input */}
      <div className="surface rounded-2xl border p-5 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted">JWT Token</label>
          <button type="button" onClick={() => setToken(SAMPLE_JWT)} className="text-xs text-muted hover:text-[var(--text)]">Load sample</button>
        </div>
        <textarea
          value={token}
          onChange={(e) => { setToken(e.target.value); setVerified(null); }}
          rows={4}
          spellCheck={false}
          className="surface-2 w-full resize-none rounded-xl border border-app p-3 font-mono text-xs outline-none"
          placeholder="Paste your JWT here…"
          aria-label="JWT token"
        />
      </div>

      {!parsed && token.trim() && (
        <div className="surface rounded-xl border border-red-400/50 p-4 text-sm text-red-600">
          ⚠ Invalid JWT — token must have exactly 3 base64url-encoded parts separated by dots.
        </div>
      )}

      {parsed && (
        <>
          {/* Status bar */}
          <div className="flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${algColor}`}>
              {parsed.header.alg ?? "unknown alg"}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isExpired === null ? "bg-[var(--surface-2)] text-muted" :
              isExpired ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" :
              "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
            }`}>
              {isExpired === null ? "No exp claim" : isExpired ? "⚠ Expired" : "✓ Valid"}
            </span>
            {parsed.payload?.exp && (
              <span className="text-xs text-muted">
                {new Date(parsed.payload.exp * 1000).toLocaleString()} ({timeAgo(parsed.payload.exp)})
              </span>
            )}
          </div>

          {/* Three-column JWT */}
          <div className="grid gap-2 sm:grid-cols-3">
            {[
              { label: "Header",    color: "text-red-500",    data: b64urlDecode(parsed.raw[0]) },
              { label: "Payload",   color: "text-purple-500", data: b64urlDecode(parsed.raw[1]) },
              { label: "Signature", color: "text-brand-500",  data: parsed.raw[2] },
            ].map((part) => (
              <div key={part.label} className="surface rounded-xl border p-3">
                <p className={`mb-1.5 text-xs font-bold ${part.color}`}>{part.label}</p>
                <pre className="surface-2 overflow-auto rounded-lg p-2 font-mono text-[10px] leading-relaxed max-h-36 break-all whitespace-pre-wrap">
                  {part.label === "Signature" ? part.data : JSON.stringify(JSON.parse(part.data), null, 2)}
                </pre>
              </div>
            ))}
          </div>

          {/* Decoded panels */}
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Header */}
            <section className="surface rounded-2xl border p-5 shadow-sm">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Header</h2>
              <JsonBlock data={parsed.header} />
            </section>

            {/* Payload */}
            <section className="surface rounded-2xl border p-5 shadow-sm">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Payload</h2>
              <JsonBlock data={parsed.payload} />
            </section>
          </div>

          {/* Claims table */}
          <section className="surface overflow-hidden rounded-2xl border shadow-sm">
            <div className="border-b border-app px-5 py-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">Claim Details</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-app text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
                    <th className="px-4 py-2 w-24">Claim</th>
                    <th className="px-4 py-2">Value</th>
                    <th className="px-4 py-2 hidden sm:table-cell">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app">
                  {Object.entries(parsed.payload).map(([k, v]) => {
                    const isTs = ["exp", "iat", "nbf"].includes(k) && typeof v === "number";
                    return (
                      <tr key={k} className="hover:bg-[var(--surface-2)]">
                        <td className="px-4 py-2 font-mono text-xs font-semibold text-brand-600">{k}</td>
                        <td className="px-4 py-2 font-mono text-xs break-all">
                          {isTs ? `${v}  →  ${new Date((v as number) * 1000).toLocaleString()}` : String(v)}
                        </td>
                        <td className="px-4 py-2 text-xs text-muted hidden sm:table-cell">{CLAIM_INFO[k] ?? ""}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* HMAC Verify */}
          {isHmac && (
            <section className="surface rounded-2xl border p-5 shadow-sm">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Verify Signature ({alg})</h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={secret}
                  onChange={(e) => { setSecret(e.target.value); setVerified(null); }}
                  placeholder="Enter HMAC secret…"
                  className="surface-2 flex-1 rounded-xl border border-app px-3 py-2 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={!secret || verifying}
                  className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
                >
                  {verifying ? "Verifying…" : "Verify"}
                </button>
              </div>
              {verified !== null && (
                <p className={`mt-3 rounded-xl p-3 text-sm font-medium ${verified ? "bg-green-50 text-green-700 dark:bg-green-900/30" : "bg-red-50 text-red-700 dark:bg-red-900/30"}`}>
                  {verified ? "✓ Signature is valid." : "✗ Signature is invalid — wrong secret or token was tampered."}
                </p>
              )}
              <p className="mt-2 text-xs text-muted">Verification uses the Web Crypto API — your secret never leaves the browser.</p>
            </section>
          )}
          {!isHmac && (
            <p className="text-xs text-muted">Signature verification for {alg} (asymmetric) requires the public key — paste key-based verification is coming soon.</p>
          )}
        </>
      )}
    </div>
  );
}
