"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface Meta {
  full_name?: string; occupation?: string; company?: string; industry?: string;
  phone?: string; country?: string; city?: string; website?: string; portfolio_website?: string;
  linkedin?: string; twitter?: string; github_profile?: string;
  bio?: string; experience_years?: string; interests?: string[];
}

const PRINT_STYLES = `
  @media print {
    body * { visibility: hidden; }
    #resume-preview, #resume-preview * { visibility: visible; }
    #resume-preview { position: fixed; top: 0; left: 0; width: 100%; }
  }
`;

export default function ResumePage() {
  const supabase = createClient();
  const [user, setUser] = useState<{ email?: string; user_metadata?: Meta } | null>(null);
  const [template, setTemplate] = useState<"minimal" | "classic" | "modern">("minimal");
  const [overrides, setOverrides] = useState<Partial<Meta & { summary: string }>>({});
  const [showAll, setShowAll] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user as never);
    });
  }, [supabase]);

  function set(k: string, v: string) { setOverrides((o) => ({ ...o, [k]: v })); }

  const meta: Meta & { summary?: string } = { ...(user?.user_metadata ?? {}), ...overrides };
  const email = user?.email ?? "";
  const location = [meta.city, meta.country].filter(Boolean).join(", ");
  const linkedin = meta.linkedin ? `linkedin.com/in/${meta.linkedin}` : "";
  const github = meta.github_profile ? `github.com/${meta.github_profile}` : "";
  const website = meta.portfolio_website || meta.website || "";

  function downloadHtml() {
    if (!previewRef.current) return;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${meta.full_name ?? "Resume"}</title><style>${getStyles(template)}</style></head><body>${previewRef.current.innerHTML}</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `${(meta.full_name ?? "resume").replace(/\s+/g, "-").toLowerCase()}.html`;
    a.click();
  }

  function printResume() { window.print(); }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="mb-4 text-5xl">📄</div>
        <h1 className="mb-2 text-2xl font-bold">Sign in to generate your resume</h1>
        <p className="mb-6 text-muted">We'll pull your profile information to build a formatted resume instantly.</p>
        <a href="/auth/login" className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700">Sign in</a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <style>{PRINT_STYLES}</style>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Resume Generator</h1>
        <p className="mt-1 text-sm text-muted">Built from your profile. Edit any field, choose a template, then download or print.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Controls */}
        <div className="space-y-5">
          <div className="surface rounded-2xl border border-app p-5">
            <p className="mb-3 text-sm font-semibold">Template</p>
            <div className="flex flex-col gap-2">
              {(["minimal", "classic", "modern"] as const).map((t) => (
                <label key={t} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="radio" name="tpl" value={t} checked={template === t} onChange={() => setTemplate(t)} className="accent-brand-600" />
                  <span className="capitalize font-medium">{t}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="surface rounded-2xl border border-app p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Edit fields</p>
              <button type="button" onClick={() => setShowAll((v) => !v)} className="text-xs text-brand-600 hover:underline">
                {showAll ? "Show less" : "Show all"}
              </button>
            </div>
            {[
              { k: "full_name", label: "Full name", placeholder: meta.full_name },
              { k: "occupation", label: "Job title", placeholder: meta.occupation },
              { k: "company", label: "Company", placeholder: meta.company },
              { k: "summary", label: "Summary / objective", placeholder: meta.bio, textarea: true },
              ...(showAll ? [
                { k: "phone", label: "Phone", placeholder: meta.phone },
                { k: "city", label: "City", placeholder: meta.city },
                { k: "country", label: "Country", placeholder: meta.country },
                { k: "portfolio_website", label: "Website", placeholder: website },
                { k: "linkedin", label: "LinkedIn handle", placeholder: meta.linkedin },
                { k: "github_profile", label: "GitHub handle", placeholder: meta.github_profile },
                { k: "experience_years", label: "Experience", placeholder: meta.experience_years },
              ] : []),
            ].map(({ k, label, placeholder, textarea }) => (
              <div key={k}>
                <label className="mb-1 block text-xs font-medium text-muted">{label}</label>
                {textarea ? (
                  <textarea value={(overrides as Record<string, string>)[k] ?? (meta as Record<string, string>)[k] ?? ""}
                    onChange={(e) => set(k, e.target.value)} rows={3} placeholder={placeholder ?? ""}
                    className="w-full resize-none rounded-xl border border-app bg-[var(--surface-2)] px-3 py-2 text-sm outline-none focus:border-brand-500" />
                ) : (
                  <input type="text" value={(overrides as Record<string, string>)[k] ?? (meta as Record<string, string>)[k] ?? ""}
                    onChange={(e) => set(k, e.target.value)} placeholder={placeholder ?? ""}
                    className="w-full rounded-xl border border-app bg-[var(--surface-2)] px-3 py-2 text-sm outline-none focus:border-brand-500" />
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <button type="button" onClick={printResume}
              className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
              🖨️ Print / Save as PDF
            </button>
            <button type="button" onClick={downloadHtml}
              className="w-full rounded-xl border border-app py-2.5 text-sm font-medium hover:bg-[var(--surface-2)]">
              ↓ Download HTML
            </button>
          </div>
          <p className="text-center text-xs text-muted">Tip: use browser Print → Save as PDF for the best PDF output</p>
        </div>

        {/* Preview */}
        <div className="surface rounded-2xl border border-app overflow-hidden">
          <div id="resume-preview" ref={previewRef} style={getInlineStyles(template)}>
            <ResumeContent meta={meta} email={email} location={location} linkedin={linkedin} github={github} website={website} template={template} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ResumeContent({ meta, email, location, linkedin, github, website, template }: {
  meta: Meta & { summary?: string }; email: string; location: string;
  linkedin: string; github: string; website: string; template: string;
}) {
  const contacts = [email, meta.phone, location, website, linkedin, github].filter(Boolean);

  if (template === "modern") {
    return (
      <div style={{ fontFamily: "Arial, sans-serif", maxWidth: 800, margin: "0 auto", display: "flex", minHeight: 1000 }}>
        <div style={{ background: "#1e1b4b", color: "white", width: 240, padding: "32px 20px", flexShrink: 0 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, margin: "0 auto 16px" }}>
            {(meta.full_name ?? "?")[0]?.toUpperCase()}
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, textAlign: "center" }}>{meta.full_name ?? "Your Name"}</h1>
          <p style={{ fontSize: 12, color: "#c4b5fd", textAlign: "center", marginBottom: 24 }}>{meta.occupation ?? ""}</p>
          <div style={{ fontSize: 11, lineHeight: 1.8, color: "#ddd6fe" }}>
            {contacts.map((c, i) => <p key={i}>{c}</p>)}
          </div>
          {meta.interests && meta.interests.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <p style={{ fontWeight: 700, fontSize: 12, marginBottom: 8, color: "#c4b5fd", textTransform: "uppercase", letterSpacing: 1 }}>Interests</p>
              {meta.interests.map((s) => <p key={s} style={{ fontSize: 11, marginBottom: 4 }}>• {s}</p>)}
            </div>
          )}
        </div>
        <div style={{ flex: 1, padding: "32px 28px" }}>
          {meta.summary && <Section title="Profile" items={[{ text: meta.summary }]} />}
          <Section title="Experience" items={[{ text: [meta.occupation, meta.company, meta.experience_years].filter(Boolean).join(" · ") || "Add your experience in the edit panel" }]} />
          {meta.interests && meta.interests.length > 0 && <Section title="Skills" items={meta.interests.map((s) => ({ text: s }))} />}
        </div>
      </div>
    );
  }

  if (template === "classic") {
    return (
      <div style={{ fontFamily: "Georgia, serif", maxWidth: 800, margin: "0 auto", padding: 40 }}>
        <div style={{ borderBottom: "2px solid #111", paddingBottom: 16, marginBottom: 20 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{meta.full_name ?? "Your Name"}</h1>
          {meta.occupation && <p style={{ margin: "4px 0 0", fontSize: 14, color: "#555" }}>{meta.occupation}{meta.company ? ` — ${meta.company}` : ""}</p>}
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "#666" }}>{contacts.join(" | ")}</p>
        </div>
        {meta.summary && <ClassicSection title="Objective">{meta.summary}</ClassicSection>}
        <ClassicSection title="Experience">{[meta.occupation, meta.company, meta.experience_years].filter(Boolean).join(", ") || "Add your experience details in the edit panel"}</ClassicSection>
        {meta.interests && meta.interests.length > 0 && <ClassicSection title="Skills">{meta.interests.join(", ")}</ClassicSection>}
      </div>
    );
  }

  // Minimal
  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", maxWidth: 800, margin: "0 auto", padding: 40 }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 4px" }}>{meta.full_name ?? "Your Name"}</h1>
      {meta.occupation && <p style={{ fontSize: 16, color: "#7c3aed", margin: "0 0 8px", fontWeight: 600 }}>{meta.occupation}{meta.company ? ` @ ${meta.company}` : ""}</p>}
      <p style={{ fontSize: 12, color: "#888", margin: "0 0 24px" }}>{contacts.join("  ·  ")}</p>
      {meta.summary && (
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: "#444" }}>{meta.summary}</p>
        </div>
      )}
      {meta.interests && meta.interests.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: "#888", margin: "0 0 8px" }}>Skills</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {meta.interests.map((s) => <span key={s} style={{ background: "#f4f4f5", padding: "3px 10px", borderRadius: 20, fontSize: 12 }}>{s}</span>)}
          </div>
        </div>
      )}
      {meta.experience_years && <p style={{ fontSize: 12, color: "#888" }}>Experience: {meta.experience_years}</p>}
    </div>
  );
}

function Section({ title, items }: { title: string; items: { text: string }[] }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: "#7c3aed", margin: "0 0 8px", borderBottom: "1px solid #e5e7eb", paddingBottom: 4 }}>{title}</h3>
      {items.map((i, idx) => i.text && <p key={idx} style={{ fontSize: 13, margin: "0 0 4px", lineHeight: 1.6 }}>• {i.text}</p>)}
    </div>
  );
}

function ClassicSection({ title, children }: { title: string; children: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, borderBottom: "1px solid #999", paddingBottom: 4, margin: "0 0 8px" }}>{title}</h3>
      <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0 }}>{children}</p>
    </div>
  );
}

function getStyles(template: string) {
  const base = "body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 0; }";
  if (template === "modern") return base + " body { display: flex; }";
  return base;
}

function getInlineStyles(template: string): React.CSSProperties {
  if (template === "minimal" || template === "classic") return { background: "white", minHeight: 500 };
  return { background: "white", minHeight: 500, display: "flex" };
}
