"use client";

import { useState, useCallback, useRef } from "react";

type QrType = "url" | "text" | "email" | "wifi" | "vcard";
type EclLevel = "L" | "M" | "Q" | "H";

const INPUT_CLS =
  "w-full rounded-xl border border-app bg-[var(--surface-2)] px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";
const SELECT_CLS = INPUT_CLS + " cursor-pointer";

function buildQrText(type: QrType, fields: Record<string, string>): string {
  switch (type) {
    case "url":
      return fields.url || "";
    case "text":
      return fields.text || "";
    case "email": {
      const parts = [`mailto:${fields.email}`];
      const q: string[] = [];
      if (fields.subject) q.push(`subject=${encodeURIComponent(fields.subject)}`);
      if (fields.body) q.push(`body=${encodeURIComponent(fields.body)}`);
      return q.length ? parts[0] + "?" + q.join("&") : parts[0];
    }
    case "wifi":
      return `WIFI:T:${fields.security || "WPA"};S:${fields.ssid};P:${fields.password};;`;
    case "vcard":
      return [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${fields.name}`,
        fields.phone ? `TEL:${fields.phone}` : "",
        fields.email2 ? `EMAIL:${fields.email2}` : "",
        fields.org ? `ORG:${fields.org}` : "",
        fields.url2 ? `URL:${fields.url2}` : "",
        "END:VCARD",
      ]
        .filter(Boolean)
        .join("\n");
  }
}

export default function QrGeneratorPage() {
  const [type, setType] = useState<QrType>("url");
  const [fields, setFields] = useState<Record<string, string>>({ url: "", text: "", email: "", subject: "", body: "", ssid: "", password: "", security: "WPA", name: "", phone: "", email2: "", org: "", url2: "" });
  const [size, setSize] = useState(300);
  const [ecl, setEcl] = useState<EclLevel>("M");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const setField = (k: string, v: string) => setFields((f) => ({ ...f, [k]: v }));

  const generate = useCallback(async () => {
    const text = buildQrText(type, fields).trim();
    if (!text) { setError("Please fill in the required fields."); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/qr?text=${encodeURIComponent(text)}&size=${size}&ecl=${ecl}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDataUrl(data.dataUrl);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [type, fields, size, ecl]);

  function downloadPng() {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qr-${type}-${Date.now()}.png`;
    a.click();
  }

  async function downloadSvg() {
    const text = buildQrText(type, fields).trim();
    if (!text) return;
    const res = await fetch(`/api/qr?text=${encodeURIComponent(text)}&size=${size}&ecl=${ecl}&fmt=svg`);
    const svg = await res.text();
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `qr-${type}-${Date.now()}.svg`;
    a.click();
  }

  function copyDataUrl() {
    if (!dataUrl) return;
    navigator.clipboard.writeText(dataUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">QR Code Generator</h1>
        <p className="mt-1 text-sm text-muted">
          Generate QR codes for URLs, text, WiFi credentials, contacts, and email. Download as PNG or SVG.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left — controls */}
        <div className="space-y-5">

          {/* Type selector */}
          <div className="surface rounded-2xl border border-app p-5">
            <p className="mb-3 text-sm font-semibold">QR Code type</p>
            <div className="flex flex-wrap gap-2">
              {([
                { v: "url", label: "🔗 URL" },
                { v: "text", label: "✏️ Text" },
                { v: "email", label: "📧 Email" },
                { v: "wifi", label: "📶 WiFi" },
                { v: "vcard", label: "👤 Contact" },
              ] as { v: QrType; label: string }[]).map(({ v, label }) => (
                <button key={v} type="button" onClick={() => { setType(v); setDataUrl(null); setError(null); }}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${type === v ? "bg-brand-600 text-white" : "border border-app hover:bg-[var(--surface-2)]"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Fields by type */}
          <div className="surface rounded-2xl border border-app p-5 space-y-4">
            {type === "url" && (
              <div>
                <label className="mb-1.5 block text-sm font-medium">URL</label>
                <input type="url" value={fields.url} onChange={(e) => setField("url", e.target.value)}
                  className={INPUT_CLS} placeholder="https://example.com" />
              </div>
            )}

            {type === "text" && (
              <div>
                <label className="mb-1.5 block text-sm font-medium">Text</label>
                <textarea value={fields.text} onChange={(e) => setField("text", e.target.value)}
                  rows={4} className={"resize-none " + INPUT_CLS} placeholder="Any text content…" />
              </div>
            )}

            {type === "email" && (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Email address</label>
                  <input type="email" value={fields.email} onChange={(e) => setField("email", e.target.value)}
                    className={INPUT_CLS} placeholder="someone@example.com" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Subject (optional)</label>
                  <input type="text" value={fields.subject} onChange={(e) => setField("subject", e.target.value)}
                    className={INPUT_CLS} placeholder="Hello there" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Body (optional)</label>
                  <textarea value={fields.body} onChange={(e) => setField("body", e.target.value)}
                    rows={3} className={"resize-none " + INPUT_CLS} placeholder="Message body…" />
                </div>
              </>
            )}

            {type === "wifi" && (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Network name (SSID)</label>
                  <input type="text" value={fields.ssid} onChange={(e) => setField("ssid", e.target.value)}
                    className={INPUT_CLS} placeholder="MyWiFiNetwork" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Password</label>
                  <input type="text" value={fields.password} onChange={(e) => setField("password", e.target.value)}
                    className={INPUT_CLS} placeholder="WiFi password" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Security</label>
                  <select value={fields.security} onChange={(e) => setField("security", e.target.value)} className={SELECT_CLS}>
                    <option value="WPA">WPA/WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None (open)</option>
                  </select>
                </div>
              </>
            )}

            {type === "vcard" && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Full name *</label>
                    <input type="text" value={fields.name} onChange={(e) => setField("name", e.target.value)}
                      className={INPUT_CLS} placeholder="Jane Doe" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Phone</label>
                    <input type="tel" value={fields.phone} onChange={(e) => setField("phone", e.target.value)}
                      className={INPUT_CLS} placeholder="+1 555 000 0000" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Email</label>
                    <input type="email" value={fields.email2} onChange={(e) => setField("email2", e.target.value)}
                      className={INPUT_CLS} placeholder="jane@example.com" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Organization</label>
                    <input type="text" value={fields.org} onChange={(e) => setField("org", e.target.value)}
                      className={INPUT_CLS} placeholder="Acme Corp" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium">Website</label>
                    <input type="url" value={fields.url2} onChange={(e) => setField("url2", e.target.value)}
                      className={INPUT_CLS} placeholder="https://janedoe.com" />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Options */}
          <div className="surface rounded-2xl border border-app p-5">
            <p className="mb-3 text-sm font-semibold">Options</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Size: <span className="text-brand-600 font-bold">{size}px</span>
                </label>
                <input type="range" min={128} max={1024} step={64} value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full accent-brand-600" />
                <div className="mt-1 flex justify-between text-xs text-muted">
                  <span>128</span><span>512</span><span>1024</span>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Error correction</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["L", "M", "Q", "H"] as EclLevel[]).map((v) => (
                    <label key={v} className="flex cursor-pointer items-center gap-2 rounded-lg border border-app px-3 py-2 text-sm hover:bg-[var(--surface-2)]">
                      <input type="radio" name="ecl" value={v} checked={ecl === v} onChange={() => setEcl(v)} className="accent-brand-600" />
                      <span className="font-medium">{v}</span>
                      <span className="text-xs text-muted">{v === "L" ? "7%" : v === "M" ? "15%" : v === "Q" ? "25%" : "30%"}</span>
                    </label>
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-muted">Higher = more resilient but denser</p>
              </div>
            </div>
          </div>

          <button type="button" onClick={generate} disabled={loading}
            className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
            {loading ? "Generating…" : "Generate QR Code"}
          </button>

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Right — preview */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="surface rounded-2xl border border-app p-5">
            <p className="mb-3 text-sm font-semibold">Preview</p>
            <div className="flex min-h-[280px] items-center justify-center rounded-xl border-2 border-dashed border-app bg-[var(--surface-2)]">
              {dataUrl ? (
                <img ref={imgRef} src={dataUrl} alt="QR code" className="rounded-lg" style={{ maxWidth: "100%", height: "auto" }} />
              ) : (
                <div className="text-center text-muted">
                  <div className="mb-2 text-4xl">⬛</div>
                  <p className="text-sm">QR code will appear here</p>
                </div>
              )}
            </div>

            {dataUrl && (
              <div className="mt-4 space-y-2">
                <button type="button" onClick={downloadPng}
                  className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
                  Download PNG
                </button>
                <div className="flex gap-2">
                  <button type="button" onClick={downloadSvg}
                    className="flex-1 rounded-xl border border-app py-2.5 text-sm font-medium hover:bg-[var(--surface-2)]">
                    Download SVG
                  </button>
                  <button type="button" onClick={copyDataUrl}
                    className="flex-1 rounded-xl border border-app py-2.5 text-sm font-medium hover:bg-[var(--surface-2)]">
                    {copied ? "Copied!" : "Copy data URL"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
