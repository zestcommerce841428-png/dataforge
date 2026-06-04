"use client";
import { useEffect, useState } from "react";

export const CONSENT_KEY = "df-consent";
export const CONSENT_EVENT = "df-consent-changed";

export function getConsent(): "accepted" | "rejected" | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(CONSENT_KEY);
  return v === "accepted" || v === "rejected" ? v : null;
}

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!getConsent()) setShow(true);
  }, []);

  const decide = (choice: "accepted" | "rejected") => {
    localStorage.setItem(CONSENT_KEY, choice);
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: choice }));
    setShow(false);
    // If the user revokes after previously accepting, drop GA cookies.
    if (choice === "rejected") {
      document.cookie.split("; ").forEach((c) => {
        const name = c.split("=")[0];
        if (/^_ga/.test(name)) {
          const host = location.hostname.replace(/^www\./, "");
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          document.cookie = `${name}=; path=/; domain=.${host}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        }
      });
    }
  };

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-2xl rounded-2xl border border-app bg-[var(--surface)] p-4 shadow-2xl sm:p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <p className="flex-1 text-sm text-muted">
          We use cookies for optional analytics (Google Analytics) and on-demand page
          translation (Google Translate). Essential site features work without them.{" "}
          <a href="/privacy" className="text-brand-600 underline">Learn more</a>.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => decide("rejected")}
            className="rounded-xl border border-app px-4 py-2 text-sm font-medium hover:bg-[var(--surface-2)]"
          >
            Decline
          </button>
          <button
            onClick={() => decide("accepted")}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
