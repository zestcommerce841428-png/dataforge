import { NextRequest, NextResponse } from "next/server";
import { assertSafeUrl } from "@/lib/ssrf";

export const dynamic = "force-dynamic";

const MAX_BODY_SIZE = 1024 * 1024; // 1 MB response cap

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { url, method = "GET", headers: reqHeaders = {}, body: reqBody, followRedirects = true } = body as {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: string;
    followRedirects: boolean;
  };

  if (!url) return NextResponse.json({ error: "url is required" }, { status: 400 });
  const safe = await assertSafeUrl(url);
  if (!safe.ok) return NextResponse.json({ error: safe.reason }, { status: 403 });

  const start = Date.now();
  try {
    const fetchOpts: RequestInit = {
      method,
      headers: { ...reqHeaders },
      redirect: "manual", // we follow manually so every hop is SSRF-checked
    };
    if (reqBody && !["GET", "HEAD"].includes(method.toUpperCase())) {
      fetchOpts.body = reqBody;
    }

    // Manual redirect following with per-hop SSRF validation (max 5 hops).
    let currentUrl = url;
    let resp = await fetch(currentUrl, fetchOpts);
    let hops = 0;
    while (followRedirects && resp.status >= 300 && resp.status < 400 && resp.headers.get("location") && hops < 5) {
      const next = new URL(resp.headers.get("location")!, currentUrl).toString();
      const hopSafe = await assertSafeUrl(next);
      if (!hopSafe.ok) return NextResponse.json({ error: `Redirect blocked: ${hopSafe.reason}` }, { status: 403 });
      currentUrl = next;
      resp = await fetch(currentUrl, fetchOpts);
      hops++;
    }
    const elapsed = Date.now() - start;

    const respHeaders: Record<string, string> = {};
    resp.headers.forEach((v, k) => { respHeaders[k] = v; });

    const contentType = resp.headers.get("content-type") ?? "";
    const isText = contentType.includes("text") || contentType.includes("json") || contentType.includes("xml") || contentType.includes("javascript");

    let responseBody = "";
    let truncated = false;

    if (isText) {
      const buf = await resp.arrayBuffer();
      if (buf.byteLength > MAX_BODY_SIZE) {
        responseBody = new TextDecoder().decode(buf.slice(0, MAX_BODY_SIZE));
        truncated = true;
      } else {
        responseBody = new TextDecoder().decode(buf);
      }
    } else {
      responseBody = `[binary: ${contentType}]`;
    }

    return NextResponse.json({
      status: resp.status,
      statusText: resp.statusText,
      headers: respHeaders,
      body: responseBody,
      elapsed,
      truncated,
      redirected: hops > 0,
      url: currentUrl,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message, elapsed: Date.now() - start }, { status: 500 });
  }
}
