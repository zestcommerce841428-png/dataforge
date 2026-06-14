import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BLOCKED_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0", "::1", "169.254.169.254"];
const MAX_BODY_SIZE = 1024 * 1024; // 1 MB response cap

function isSafeHost(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return !BLOCKED_HOSTS.some((b) => hostname === b || hostname.endsWith(".local"));
  } catch {
    return false;
  }
}

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
  if (!isSafeHost(url)) return NextResponse.json({ error: "Requests to localhost/internal IPs are not allowed." }, { status: 403 });

  const start = Date.now();
  try {
    const fetchOpts: RequestInit = {
      method,
      headers: { ...reqHeaders },
      redirect: followRedirects ? "follow" : "manual",
    };
    if (reqBody && !["GET", "HEAD"].includes(method.toUpperCase())) {
      fetchOpts.body = reqBody;
    }

    const resp = await fetch(url, fetchOpts);
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
      redirected: resp.redirected,
      url: resp.url,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message, elapsed: Date.now() - start }, { status: 500 });
  }
}
