// Build metadata. These values are inlined at build time (the footer is a
// server component, so module evaluation happens during `next build`).

const built = new Date();
const pad = (n: number) => String(n).padStart(2, "0");

export const BUILD_DATE = `${built.getFullYear()}.${pad(built.getMonth() + 1)}.${pad(built.getDate())}`;

export const BUILD_SHA = (
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.GITHUB_SHA ||
  ""
).slice(0, 7);

// e.g. v2026.06.10 · build a1b2c3d
export const BUILD_VERSION = `v${BUILD_DATE}`;

export const BUILD_TIME_ISO = built.toISOString();
