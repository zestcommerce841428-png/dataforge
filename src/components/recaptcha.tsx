"use client";
import { useEffect } from "react";
import Script from "next/script";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

/**
 * Loads Google reCAPTCHA v3 when NEXT_PUBLIC_RECAPTCHA_SITE_KEY is set.
 * v3 is invisible and scores requests in the background; use executeRecaptcha()
 * to get a token for a given action, then verify it server-side with your secret.
 */
export function Recaptcha() {
  useEffect(() => {
    // Hide the floating badge gracefully if the key isn't configured.
    if (!SITE_KEY) return;
  }, []);

  if (!SITE_KEY) return null;
  return <Script src={`https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`} strategy="afterInteractive" />;
}

/** Returns a reCAPTCHA v3 token for the given action, or null if unavailable. */
export async function executeRecaptcha(action: string): Promise<string | null> {
  if (!SITE_KEY || typeof window === "undefined" || !window.grecaptcha) return null;
  try {
    return await new Promise<string>((resolve, reject) => {
      window.grecaptcha!.ready(() => {
        window.grecaptcha!.execute(SITE_KEY!, { action }).then(resolve).catch(reject);
      });
    });
  } catch {
    return null;
  }
}
