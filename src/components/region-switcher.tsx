"use client";
import { useEffect, useMemo, useRef, useState } from "react";

/** Country → primary Google-Translate language code. */
type Country = { code: string; name: string; flag: string; lang: string };

const COUNTRIES: Country[] = [
  { code: "US", name: "United States", flag: "🇺🇸", lang: "en" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", lang: "en" },
  { code: "IN", name: "India", flag: "🇮🇳", lang: "hi" },
  { code: "ES", name: "Spain", flag: "🇪🇸", lang: "es" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", lang: "es" },
  { code: "FR", name: "France", flag: "🇫🇷", lang: "fr" },
  { code: "DE", name: "Germany", flag: "🇩🇪", lang: "de" },
  { code: "IT", name: "Italy", flag: "🇮🇹", lang: "it" },
  { code: "PT", name: "Portugal", flag: "🇵🇹", lang: "pt" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", lang: "pt" },
  { code: "RU", name: "Russia", flag: "🇷🇺", lang: "ru" },
  { code: "CN", name: "China", flag: "🇨🇳", lang: "zh-CN" },
  { code: "TW", name: "Taiwan", flag: "🇹🇼", lang: "zh-TW" },
  { code: "JP", name: "Japan", flag: "🇯🇵", lang: "ja" },
  { code: "KR", name: "South Korea", flag: "🇰🇷", lang: "ko" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", lang: "ar" },
  { code: "AE", name: "UAE", flag: "🇦🇪", lang: "ar" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩", lang: "id" },
  { code: "TR", name: "Turkey", flag: "🇹🇷", lang: "tr" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", lang: "nl" },
  { code: "PL", name: "Poland", flag: "🇵🇱", lang: "pl" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳", lang: "vi" },
  { code: "TH", name: "Thailand", flag: "🇹🇭", lang: "th" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩", lang: "bn" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰", lang: "ur" },
  { code: "IR", name: "Iran", flag: "🇮🇷", lang: "fa" },
  { code: "GR", name: "Greece", flag: "🇬🇷", lang: "el" },
  { code: "SE", name: "Sweden", flag: "🇸🇪", lang: "sv" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦", lang: "uk" },
  { code: "IL", name: "Israel", flag: "🇮🇱", lang: "iw" },
  { code: "EG", name: "Egypt", flag: "🇪🇬", lang: "ar" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", lang: "en" },
  { code: "PH", name: "Philippines", flag: "🇵🇭", lang: "tl" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", lang: "ms" },
];

function getCookie(name: string) {
  return document.cookie.split("; ").find((c) => c.startsWith(name + "="))?.split("=")[1];
}
function setGoogTrans(lang: string) {
  const host = location.hostname.replace(/^www\./, "");
  const val = `/en/${lang}`;
  document.cookie = `googtrans=${val}; path=/`;
  document.cookie = `googtrans=${val}; path=/; domain=.${host}`;
}
function clearGoogTrans() {
  const host = location.hostname.replace(/^www\./, "");
  for (const d of ["", `; domain=.${host}`]) {
    document.cookie = `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${d}`;
  }
}

let translateLoaded = false;
function loadTranslate() {
  if (translateLoaded || document.getElementById("google-translate-script")) return;
  translateLoaded = true;
  if (!document.getElementById("google_translate_element")) {
    const host = document.createElement("div");
    host.id = "google_translate_element";
    host.style.display = "none";
    document.body.appendChild(host);
  }
  (window as unknown as { googleTranslateElementInit: () => void }).googleTranslateElementInit = () => {
    const g = (window as unknown as { google?: { translate?: { TranslateElement: new (o: object, id: string) => void } } }).google;
    if (g?.translate) new g.translate.TranslateElement({ pageLanguage: "en", autoDisplay: false }, "google_translate_element");
  };
  const s = document.createElement("script");
  s.id = "google-translate-script";
  s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  document.body.appendChild(s);
}

export function RegionSwitcher() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [current, setCurrent] = useState<Country>(COUNTRIES[0]);
  const ref = useRef<HTMLDivElement | null>(null);

  // On mount: if a translation cookie is present, load the widget so it applies,
  // and reflect the saved country in the button.
  useEffect(() => {
    const gt = getCookie("googtrans");
    const lang = gt ? decodeURIComponent(gt).split("/").pop() : "";
    const savedCode = localStorage.getItem("df-country");
    const saved = COUNTRIES.find((c) => c.code === savedCode);
    if (saved) setCurrent(saved);
    else if (lang && lang !== "en") {
      const byLang = COUNTRIES.find((c) => c.lang === lang);
      if (byLang) setCurrent(byLang);
    }
    if (lang && lang !== "en") loadTranslate();
  }, []);

  // Close on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(s) || c.code.toLowerCase().includes(s)) : COUNTRIES;
  }, [q]);

  const choose = (c: Country) => {
    localStorage.setItem("df-country", c.code);
    setCurrent(c);
    setOpen(false);
    if (c.lang === "en") { clearGoogTrans(); location.reload(); return; }
    setGoogTrans(c.lang);
    loadTranslate();
    location.reload();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="surface flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-sm shadow-sm hover:bg-[var(--surface-2)]"
        aria-label="Change country and language"
        aria-expanded={open}
        title="Country & language"
      >
        <span aria-hidden className="text-base notranslate">{current.flag}</span>
        <span className="hidden font-medium sm:inline">{current.code}</span>
        <span aria-hidden className="text-xs text-muted">▾</span>
      </button>

      {open && (
        <div className="surface absolute right-0 z-50 mt-2 w-64 rounded-2xl border p-2 shadow-2xl">
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search country…"
            className="input-field mb-2 w-full"
            aria-label="Search country"
          />
          <div className="max-h-72 overflow-auto">
            {filtered.map((c) => (
              <button
                key={c.code}
                onClick={() => choose(c)}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-[var(--surface-2)] ${c.code === current.code ? "text-brand-600 font-semibold" : ""}`}
              >
                <span aria-hidden className="text-base notranslate">{c.flag}</span>
                <span className="flex-1">{c.name}</span>
                <span className="text-xs text-muted uppercase">{c.lang}</span>
              </button>
            ))}
            {filtered.length === 0 && <p className="px-2 py-4 text-center text-sm text-muted">No match</p>}
          </div>
          <p className="px-2 pt-2 text-[10px] text-muted">Translation by Google. The page reloads to apply.</p>
        </div>
      )}
    </div>
  );
}
