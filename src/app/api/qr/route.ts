import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const text = searchParams.get("text") ?? "";
  const size = Math.min(Math.max(Number(searchParams.get("size") ?? 300), 64), 1024);
  const ecl = (searchParams.get("ecl") ?? "M") as "L" | "M" | "Q" | "H";
  const fmt = searchParams.get("fmt") ?? "png";

  if (!text.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  try {
    if (fmt === "svg") {
      const svg = await QRCode.toString(text, { type: "svg", errorCorrectionLevel: ecl, width: size });
      return new NextResponse(svg, { headers: { "Content-Type": "image/svg+xml" } });
    }
    const dataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: ecl,
      width: size,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });
    return NextResponse.json({ dataUrl });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
