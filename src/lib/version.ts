// Build-time constants for the footer.
// The footer is a server component, so this module is evaluated once during
// `next build`. next.config.ts injects NEXT_PUBLIC_BUILD_* into process.env
// before the build runs, so all values below are accurate to the deployment.

const built = new Date(
  process.env.NEXT_PUBLIC_BUILD_TIME ?? Date.now()
);

export const BUILD_TIME_ISO: string = built.toISOString();

// Prefer next.config-injected SHA (from `git rev-parse --short HEAD`),
// then fall back to CI platform variables.
export const BUILD_SHA: string = (
  process.env.NEXT_PUBLIC_BUILD_SHA ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.GITHUB_SHA ||
  ""
).slice(0, 7);

// Semver from package.json, e.g. "v1.0.0"
export const BUILD_VERSION: string =
  `v${process.env.NEXT_PUBLIC_BUILD_VERSION ?? "1.0.0"}`;
