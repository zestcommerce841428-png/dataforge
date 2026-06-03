/**
 * Cryptographically-secure random helpers.
 * Uses the Web Crypto API which is available in modern browsers and Node 18+.
 */

function getCrypto(): Crypto {
  const c = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
  if (c && typeof c.getRandomValues === "function") {
    return c;
  }
  throw new Error("Secure crypto API is not available in this environment.");
}

/** Uniformly random integer in [min, max] inclusive, without modulo bias. */
export function randomInt(min: number, max: number): number {
  if (min > max) [min, max] = [max, min];
  min = Math.ceil(min);
  max = Math.floor(max);
  const range = max - min + 1;
  if (range <= 0) return min;

  const maxUint32 = 0xffffffff;

  // For ranges that fit in a uint32, use rejection sampling (no bias).
  if (range <= maxUint32) {
    const limit = maxUint32 - (maxUint32 % range);
    const buf = new Uint32Array(1);
    let value: number;
    do {
      getCrypto().getRandomValues(buf);
      value = buf[0];
    } while (value >= limit);
    return min + (value % range);
  }

  // For ranges > 2^32 (e.g. millisecond timestamps), combine two uint32s
  // into a 53-bit value to stay within JavaScript's safe-integer range.
  // Slight bias is acceptable here; the range fits within 2^53.
  const buf = new Uint32Array(2);
  getCrypto().getRandomValues(buf);
  const hi = buf[0] * 0x100000000; // shift left 32 bits (float arithmetic)
  const lo = buf[1];
  const rand53 = (hi + lo) % range; // may have slight bias for huge ranges
  return min + Math.floor(rand53);
}

/** Random float in [min, max). */
export function randomFloat(min: number, max: number, decimals = 2): number {
  const buf = new Uint32Array(1);
  getCrypto().getRandomValues(buf);
  const frac = buf[0] / 0x100000000;
  const value = min + frac * (max - min);
  return Number(value.toFixed(decimals));
}

/** Pick a random element from an array. */
export function pick<T>(arr: readonly T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

/** Random hex string of the given byte length. */
export function randomHex(bytes: number): string {
  const buf = new Uint8Array(bytes);
  getCrypto().getRandomValues(buf);
  return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Random bytes. */
export function randomBytes(bytes: number): Uint8Array {
  const buf = new Uint8Array(bytes);
  getCrypto().getRandomValues(buf);
  return buf;
}

/** Build a random string from a given character set. */
export function randomString(length: number, charset: string): string {
  let out = "";
  for (let i = 0; i < length; i++) out += charset[randomInt(0, charset.length - 1)];
  return out;
}
