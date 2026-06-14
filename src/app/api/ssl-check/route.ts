import { NextRequest, NextResponse } from "next/server";
import tls from "tls";
import { assertSafeHost, resolveSafeIp } from "@/lib/ssrf";

export const dynamic = "force-dynamic";

function parseDomain(input: string): string {
  try {
    const url = input.includes("://") ? new URL(input) : new URL("https://" + input);
    return url.hostname;
  } catch {
    return input.trim().replace(/^https?:\/\//, "").split("/")[0];
  }
}

export async function GET(req: NextRequest) {
  const domain = parseDomain(req.nextUrl.searchParams.get("domain") ?? "");
  if (!domain) return NextResponse.json({ error: "domain is required" }, { status: 400 });

  const safe = await assertSafeHost(domain);
  if (!safe.ok) return NextResponse.json({ error: safe.reason }, { status: 403 });

  // Connect to the validated IP directly (servername preserves SNI) so we don't
  // re-resolve DNS on connect — closes the rebinding window.
  const safeIp = await resolveSafeIp(domain);
  if (!safeIp) return NextResponse.json({ error: "Host resolves to a private/internal IP." }, { status: 403 });

  return new Promise<NextResponse>((resolve) => {
    const socket = tls.connect(
      { host: safeIp, port: 443, servername: domain, rejectUnauthorized: false, timeout: 10000 },
      () => {
        const cert = socket.getPeerCertificate(true);
        socket.end();

        if (!cert || !cert.subject) {
          resolve(NextResponse.json({ error: "No certificate found" }, { status: 400 }));
          return;
        }

        const validFrom = new Date(cert.valid_from);
        const validTo = new Date(cert.valid_to);
        const now = new Date();
        const daysLeft = Math.floor((validTo.getTime() - now.getTime()) / 86400000);
        const daysTotal = Math.floor((validTo.getTime() - validFrom.getTime()) / 86400000);

        const san: string[] = [];
        if (cert.subjectaltname) {
          cert.subjectaltname.split(", ").forEach((s: string) => {
            if (s.startsWith("DNS:")) san.push(s.slice(4));
          });
        }

        resolve(NextResponse.json({
          domain,
          subject: cert.subject?.CN ?? domain,
          issuer: cert.issuer?.O ?? cert.issuer?.CN ?? "Unknown",
          issuerCN: cert.issuer?.CN ?? "",
          validFrom: validFrom.toISOString(),
          validTo: validTo.toISOString(),
          daysLeft,
          daysTotal,
          san,
          fingerprint: cert.fingerprint ?? "",
          fingerprint256: cert.fingerprint256 ?? "",
          protocol: socket.getProtocol() ?? "",
          cipher: socket.getCipher()?.name ?? "",
          expired: daysLeft < 0,
          expiringSoon: daysLeft >= 0 && daysLeft <= 30,
        }));
      }
    );

    socket.on("error", (err) => {
      resolve(NextResponse.json({ error: err.message }, { status: 500 }));
    });
    socket.setTimeout(10000, () => {
      socket.destroy();
      resolve(NextResponse.json({ error: "Connection timed out" }, { status: 504 }));
    });
  });
}
