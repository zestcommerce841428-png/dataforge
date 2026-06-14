"use client";
import { useEffect, useRef, useState } from "react";

const PHONE = "917492068998";
const DISPLAY = "+91 74920 68998";
const DEFAULT_MSG = "Hi! I have a question about DataForge.";

const QUICK: { label: string; text: string }[] = [
  { label: "💬 General question", text: "Hi! I have a question about DataForge." },
  { label: "🐛 Report a bug", text: "Hi! I'd like to report a bug on DataForge:" },
  { label: "💡 Suggest a feature", text: "Hi! I have a feature idea for DataForge:" },
  { label: "🤝 Business / partnership", text: "Hi! I'd like to discuss a partnership with DataForge." },
];

function waLink(text: string) {
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`;
}

// Hostinger / IST business hours: Mon–Sat, 9:00–21:00 IST.
function isOnlineNow() {
  const now = new Date();
  // Convert to IST (UTC+5:30) regardless of the visitor's timezone.
  const ist = new Date(now.getTime() + (now.getTimezoneOffset() + 330) * 60000);
  const day = ist.getDay(); // 0 = Sun
  const hour = ist.getHours();
  return day !== 0 && hour >= 9 && hour < 21;
}

export function WhatsAppButton() {
  const [open, setOpen] = useState(false);
  const [online, setOnline] = useState(false);
  const [nudge, setNudge] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setOnline(isOnlineNow());
    const t = setInterval(() => setOnline(isOnlineNow()), 60000);
    // One-time gentle nudge after 8s if the user hasn't dismissed it before.
    let nt: ReturnType<typeof setTimeout> | undefined;
    try {
      if (!sessionStorage.getItem("df-wa-nudge")) {
        nt = setTimeout(() => setNudge(true), 8000);
      }
    } catch {}
    return () => { clearInterval(t); if (nt) clearTimeout(nt); };
  }, []);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (cardRef.current?.contains(e.target as Node) || btnRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const dismissNudge = () => {
    setNudge(false);
    try { sessionStorage.setItem("df-wa-nudge", "1"); } catch {}
  };

  const toggle = () => {
    dismissNudge();
    setOpen((o) => !o);
  };

  const Logo = ({ size = 28 }: { size?: number }) => (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="currentColor" aria-hidden>
      <path d="M16.003 3C9.38 3 4 8.38 4 15.003c0 2.115.553 4.18 1.605 6.002L4 29l8.18-1.57a11.95 11.95 0 0 0 3.823.63h.001C22.626 28.06 28 22.68 28 16.057 28 9.434 22.626 3 16.003 3zm0 21.86h-.001a9.9 9.9 0 0 1-3.51-.64l-.25-.1-4.855.932.93-4.73-.164-.243a9.86 9.86 0 0 1-1.51-5.236c0-5.47 4.45-9.92 9.92-9.92 2.65 0 5.14 1.034 7.01 2.91a9.84 9.84 0 0 1 2.9 7.02c0 5.47-4.45 9.92-9.92 9.92zm5.44-7.42c-.298-.15-1.76-.868-2.034-.967-.273-.1-.472-.15-.67.15-.198.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.298-.15-1.256-.463-2.392-1.475-.884-.788-1.48-1.76-1.653-2.058-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.15-.174.198-.298.298-.497.099-.198.05-.372-.025-.52-.075-.15-.67-1.612-.918-2.207-.242-.58-.487-.5-.67-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.478 1.065 2.875 1.213 3.073c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z" />
    </svg>
  );

  return (
    <>
      {/* Chat card */}
      {open && (
        <div
          ref={cardRef}
          role="dialog"
          aria-label="Chat with DataForge on WhatsApp"
          className="fixed bottom-36 right-4 z-50 w-[min(92vw,320px)] overflow-hidden rounded-2xl border border-app bg-[var(--surface)] shadow-2xl"
        >
          <div className="flex items-center gap-3 bg-[#075E54] px-4 py-3 text-white">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white/15">
              <Logo size={24} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">DataForge Support</p>
              <p className="flex items-center gap-1.5 text-[11px] text-white/80">
                <span className={`inline-block h-2 w-2 rounded-full ${online ? "bg-green-400" : "bg-amber-400"}`} />
                {online ? "Online — typically replies in minutes" : "Away — we'll reply soon"}
              </p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="grid h-7 w-7 place-items-center rounded-full text-white/80 hover:bg-white/15 hover:text-white">✕</button>
          </div>

          <div className="space-y-2 p-4">
            <p className="text-xs text-muted">👋 Hi there! How can we help you today? Pick a topic to start a WhatsApp chat:</p>
            {QUICK.map((q) => (
              <a
                key={q.label}
                href={waLink(q.text)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="block rounded-xl border border-app px-3 py-2.5 text-sm transition-colors hover:border-[#25D366] hover:bg-[#25D366]/10"
              >
                {q.label}
              </a>
            ))}
          </div>

          <a
            href={waLink(DEFAULT_MSG)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1da851]"
          >
            <Logo size={20} /> Start chat on WhatsApp
          </a>
          <p className="bg-[var(--surface)] px-4 py-2 text-center text-[10px] text-muted">{DISPLAY}</p>
        </div>
      )}

      {/* Nudge bubble */}
      {nudge && !open && (
        <div className="fixed bottom-[5.5rem] right-4 z-40 flex max-w-[14rem] items-start gap-2 rounded-2xl rounded-br-sm border border-app bg-[var(--surface)] px-3 py-2 text-xs shadow-xl">
          <span>👋 Need help? Chat with us on WhatsApp!</span>
          <button onClick={dismissNudge} aria-label="Dismiss" className="shrink-0 text-muted hover:text-app">✕</button>
        </div>
      )}

      {/* Floating button */}
      <button
        ref={btnRef}
        onClick={toggle}
        aria-label="Chat with us on WhatsApp"
        aria-expanded={open}
        title="Chat on WhatsApp"
        className="group fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all hover:w-auto hover:gap-2 hover:px-5 hover:shadow-xl"
      >
        {!open && online && (
          <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-400" />
        )}
        {!open && (
          <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-40" aria-hidden />
        )}
        <span className="relative">{open ? <span className="text-2xl leading-none">✕</span> : <Logo />}</span>
        <span className="relative hidden whitespace-nowrap text-sm font-semibold group-hover:inline">Chat with us</span>
      </button>
    </>
  );
}
