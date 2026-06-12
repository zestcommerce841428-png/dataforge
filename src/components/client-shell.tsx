"use client";

import dynamic from "next/dynamic";

const GoogleAnalytics    = dynamic(() => import("@/components/analytics").then((m) => ({ default: m.GoogleAnalytics })),    { ssr: false });
const AccessibilityPanel = dynamic(() => import("@/components/accessibility-panel").then((m) => ({ default: m.AccessibilityPanel })), { ssr: false });
const CookieConsent      = dynamic(() => import("@/components/cookie-consent").then((m) => ({ default: m.CookieConsent })),      { ssr: false });
const Recaptcha          = dynamic(() => import("@/components/recaptcha").then((m) => ({ default: m.Recaptcha })),          { ssr: false });
const WhatsAppButton     = dynamic(() => import("@/components/whatsapp-button").then((m) => ({ default: m.WhatsAppButton })),     { ssr: false });
const ScrollButtons      = dynamic(() => import("@/components/scroll-buttons").then((m) => ({ default: m.ScrollButtons })),      { ssr: false });
const WelcomeBanner      = dynamic(() => import("@/components/welcome-banner").then((m) => ({ default: m.WelcomeBanner })),      { ssr: false });
const OnboardingOverlay  = dynamic(() => import("@/components/onboarding-overlay").then((m) => ({ default: m.OnboardingOverlay })), { ssr: false });
const OfflineIndicator   = dynamic(() => import("@/components/offline-indicator").then((m) => ({ default: m.OfflineIndicator })),   { ssr: false });

export function ClientShell() {
  return (
    <>
      <OnboardingOverlay />
      <WelcomeBanner />
      <AccessibilityPanel />
      <ScrollButtons />
      <WhatsAppButton />
      <CookieConsent />
      <Recaptcha />
      <OfflineIndicator />
      <GoogleAnalytics />
    </>
  );
}
