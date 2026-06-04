"use client";
import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/**
 * Google Analytics 4. Renders nothing unless NEXT_PUBLIC_GA_ID is set and we're
 * in production, so dev and unconfigured deploys ship zero tracking.
 * As a client component, NEXT_PUBLIC_GA_ID is inlined at build time.
 */
export function GoogleAnalytics() {
  if (!GA_ID || process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
