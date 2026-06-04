/**
 * Server-side reCAPTCHA v3 verification.
 * Returns { ok, score, reason }. If no secret is configured it allows the
 * request (so the app keeps working without reCAPTCHA set up).
 */
export async function verifyRecaptcha(token: string | undefined, expectedAction?: string, minScore = 0.5) {
  const secret = process.env.RECAPTCHA_SECRET;
  if (!secret) return { ok: true, score: null as number | null, reason: "disabled" };
  if (!token) return { ok: false, score: null, reason: "missing-token" };

  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = (await res.json()) as { success: boolean; score?: number; action?: string };
    if (!data.success) return { ok: false, score: data.score ?? null, reason: "failed" };
    if (expectedAction && data.action && data.action !== expectedAction) {
      return { ok: false, score: data.score ?? null, reason: "action-mismatch" };
    }
    if (typeof data.score === "number" && data.score < minScore) {
      return { ok: false, score: data.score, reason: "low-score" };
    }
    return { ok: true, score: data.score ?? null, reason: "ok" };
  } catch (e) {
    return { ok: false, score: null, reason: "error:" + (e as Error).message };
  }
}
