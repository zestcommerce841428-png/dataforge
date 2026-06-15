import { NextRequest, NextResponse } from "next/server";

// Rate-limit: max 5 uploads per IP per minute (in-memory, resets on cold start)
const ipCounts = new Map<string, { count: number; reset: number }>();

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const entry = ipCounts.get(ip);
  if (entry && now < entry.reset) {
    if (entry.count >= 5) {
      return NextResponse.json({ error: "Too many uploads. Try again later." }, { status: 429 });
    }
    entry.count++;
  } else {
    ipCounts.set(ip, { count: 1, reset: now + 60_000 });
  }

  const uploadUrl = process.env.HOSTINGER_UPLOAD_URL ?? process.env.NEXT_PUBLIC_HOSTINGER_UPLOAD_URL;
  const secret = process.env.HOSTINGER_UPLOAD_SECRET;
  if (!uploadUrl) {
    return NextResponse.json({ error: "Upload not configured" }, { status: 500 });
  }

  const formData = await req.formData();

  // Validate file presence and type
  const file = formData.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files allowed" }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Max file size is 5 MB" }, { status: 400 });
  }

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: secret ? { "X-Upload-Secret": secret } : {},
    body: formData,
    signal: AbortSignal.timeout(15000),
  });

  const data = await res.json();
  if (!res.ok) return NextResponse.json(data, { status: res.status });
  return NextResponse.json(data);
}
