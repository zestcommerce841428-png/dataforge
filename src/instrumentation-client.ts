import type * as SentryType from "@sentry/nextjs";

// Dynamically load Sentry ONLY when a DSN is configured at build time.
// When NEXT_PUBLIC_SENTRY_DSN is unset, the import below is dead-code
// eliminated, so the Sentry bundle never ships to users.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

let routerTransition: ((...args: unknown[]) => void) | undefined;

if (dsn) {
  import("@sentry/nextjs").then((Sentry: typeof SentryType) => {
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
      enabled: process.env.NODE_ENV === "production",
    });
    routerTransition = Sentry.captureRouterTransitionStart as unknown as typeof routerTransition;
  });
}

export const onRouterTransitionStart = (...args: unknown[]) => routerTransition?.(...args);
