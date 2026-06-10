// Build-time constants — evaluated once during `next build`.
// next.config.ts injects NEXT_PUBLIC_BUILD_* from git/Vercel env vars.

const built = new Date(process.env.NEXT_PUBLIC_BUILD_TIME ?? Date.now());

export const BUILD_TIME_ISO: string = built.toISOString();

export const BUILD_SHA: string = (
  process.env.NEXT_PUBLIC_BUILD_SHA ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.GITHUB_SHA ||
  ""
).slice(0, 7);

export const BUILD_VERSION: string =
  `v${process.env.NEXT_PUBLIC_BUILD_VERSION ?? "1.0.0"}`;

export const BUILD_BRANCH: string =
  process.env.NEXT_PUBLIC_BUILD_BRANCH ?? "";

export const BUILD_ENV: string =
  process.env.NEXT_PUBLIC_BUILD_ENV ?? "development";

export const BUILD_REGION: string =
  process.env.NEXT_PUBLIC_BUILD_REGION ?? "";

export const BUILD_AUTHOR: string =
  process.env.NEXT_PUBLIC_BUILD_AUTHOR ?? "";

export const BUILD_MESSAGE: string =
  process.env.NEXT_PUBLIC_BUILD_MESSAGE ?? "";

export const BUILD_NODE: string =
  process.env.NEXT_PUBLIC_BUILD_NODE ?? "";

export const BUILD_NEXT: string =
  process.env.NEXT_PUBLIC_BUILD_NEXT ?? "";
