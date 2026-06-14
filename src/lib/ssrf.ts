import dns from "dns/promises";
import net from "net";

/**
 * SSRF guard. Validates that a user-supplied URL/host points at a public
 * internet address before the server is allowed to connect to it.
 *
 * Blocks: loopback, private (RFC1918), link-local (incl. cloud metadata
 * 169.254.169.254), CGNAT, unique-local IPv6, and non-http(s) schemes.
 * Resolves DNS so that hostnames pointing at internal IPs are rejected too.
 */

function ipToParts(ip: string): number[] | null {
  const m = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return null;
  const parts = m.slice(1, 5).map(Number);
  if (parts.some((p) => p > 255)) return null;
  return parts;
}

function isPrivateV4(ip: string): boolean {
  const p = ipToParts(ip);
  if (!p) return false;
  const [a, b] = p;
  if (a === 10) return true;                       // 10.0.0.0/8
  if (a === 127) return true;                      // loopback
  if (a === 0) return true;                        // 0.0.0.0/8
  if (a === 169 && b === 254) return true;         // link-local / metadata
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true;         // 192.168.0.0/16
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT 100.64.0.0/10
  if (a >= 224) return true;                       // multicast / reserved
  return false;
}

function isPrivateV6(ip: string): boolean {
  const lower = ip.toLowerCase().replace(/^\[|\]$/g, "");
  if (lower === "::1" || lower === "::") return true;
  if (lower.startsWith("fe80")) return true;       // link-local
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique-local
  // IPv4-mapped (::ffff:127.0.0.1)
  const mapped = lower.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateV4(mapped[1]);
  return false;
}

function isPrivateAddress(ip: string): boolean {
  const v = net.isIP(ip);
  if (v === 4) return isPrivateV4(ip);
  if (v === 6) return isPrivateV6(ip);
  return true; // not a recognizable IP — treat as unsafe
}

export type SsrfResult = { ok: true } | { ok: false; reason: string };

/**
 * Validate a full URL string. Only http/https allowed; the resolved host
 * must be a public address.
 */
export async function assertSafeUrl(input: string): Promise<SsrfResult> {
  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    return { ok: false, reason: "Invalid URL." };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, reason: "Only http and https URLs are allowed." };
  }
  return assertSafeHost(parsed.hostname);
}

/** Validate a bare hostname (used by tls.connect / ssl-check). */
export async function assertSafeHost(hostname: string): Promise<SsrfResult> {
  const host = hostname.replace(/\.$/, "").toLowerCase(); // strip trailing dot

  if (!host) return { ok: false, reason: "Missing host." };
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) {
    return { ok: false, reason: "Requests to internal hosts are not allowed." };
  }

  // Literal IP supplied directly
  if (net.isIP(host)) {
    return isPrivateAddress(host)
      ? { ok: false, reason: "Requests to private/internal IPs are not allowed." }
      : { ok: true };
  }

  // Hostname — resolve and check every returned address
  let addrs: { address: string }[];
  try {
    addrs = await dns.lookup(host, { all: true });
  } catch {
    return { ok: false, reason: "Could not resolve host." };
  }
  if (addrs.length === 0) return { ok: false, reason: "Host did not resolve." };
  if (addrs.some((a) => isPrivateAddress(a.address))) {
    return { ok: false, reason: "Host resolves to a private/internal IP." };
  }
  return { ok: true };
}

/**
 * Resolve a host to a single public IP, or return null if it is private /
 * unresolvable. Connect to the returned IP (with servername set to the host)
 * to avoid a second, unchecked DNS resolution.
 */
export async function resolveSafeIp(hostname: string): Promise<string | null> {
  const host = hostname.replace(/\.$/, "").toLowerCase();
  if (net.isIP(host)) return isPrivateAddress(host) ? null : host;
  try {
    const addrs = await dns.lookup(host, { all: true });
    if (addrs.length === 0) return null;
    if (addrs.some((a) => isPrivateAddress(a.address))) return null;
    return addrs[0].address;
  } catch {
    return null;
  }
}
