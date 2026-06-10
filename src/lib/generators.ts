import {
  randomInt,
  randomFloat,
  randomHex,
  randomBytes,
  randomString,
  pick,
} from "./random";
import {
  STREETS,
  CITIES,
  STATES,
  FIRST_NAMES,
  LAST_NAMES,
  MAC_VENDORS,
} from "./data";
import {
  COUNTRIES,
  CURRENCIES,
  USER_AGENTS,
  HTTP_STATUSES,
  MIME_TYPES,
  TAILWIND_COLORS,
  BIP39_WORDS,
  FIRST_NAMES_M,
  FIRST_NAMES_F,
  LAST_NAMES2,
  JOB_TITLES,
  COMPANY_PREFIX,
  COMPANY_SUFFIX,
  LOREM,
  ADJECTIVES,
  NOUNS,
  TLDS2,
  EMOJIS,
  CSS_COLOR_NAMES,
  VIN_WMI,
  VIN_YEAR_CODES,
  VIN_CHARS,
  UK_AREAS,
  CA_FSA_CHARS,
  SWIFT_BANK_WORDS,
  SWIFT_COUNTRIES,
  CRON_PATTERNS,
  SQL_TABLES,
  HTTP_HEADERS_LIST,
  TIMEZONES,
  PROVERBS,
  ISO_LANGUAGES,
  AIRPORTS,
  STOCK_TICKERS,
  PROGRAMMING_LANGUAGES,
  CLOUD_REGIONS,
  CAR_BRANDS,
  MATERIAL_COLORS,
  REGEX_PATTERNS,
  BOOK_TITLE_WORDS,
  MOVIE_GENRES,
  REVIEW_PHRASES,
  TAGLINES,
  APP_PREFIXES,
  APP_SUFFIXES,
  DEPARTMENTS,
  LOYALTY_BRANDS,
  WEBHOOK_EVENTS,
  GRAPHQL_ENTITIES,
  API_RESOURCES,
  HTTP_METHODS,
  K8S_NAMESPACES,
  K8S_LABEL_KEYS,
  LOG_LEVELS,
  ERROR_CODES,
  ISP_NAMES,
  CSP_DIRECTIVE_SOURCES,
} from "./datasets";

export type FieldType = "number" | "select" | "checkbox" | "text";

export interface Field {
  key: string;
  label: string;
  type: FieldType;
  default: string | number | boolean;
  min?: number;
  max?: number;
  options?: { value: string; label: string }[];
  help?: string;
}

export type GenOptions = Record<string, string | number | boolean>;

export interface Generator {
  slug: string;
  name: string;
  category: string;
  short: string;
  description: string;
  keywords: string[];
  fields: Field[];
  /** Generate a single value. May be async (e.g. for hashing). */
  generate: (opts: GenOptions) => string | Promise<string>;
}

export const CATEGORIES = [
  { id: "numbers",   name: "Numbers",           icon: "123", blurb: "Integers, floats, primes, binary, lottery & dice." },
  { id: "developer", name: "Developer",          icon: "{ }", blurb: "Passwords, hashes, UUIDs, base64 & more." },
  { id: "web",       name: "Web & Dev",          icon: "</>", blurb: "JSON, CSV, cron, SQL, env vars, HTTP headers & tokens." },
  { id: "identity",  name: "Identity",           icon: "ID",  blurb: "Names, emails, cards, IBAN, VIN, license plates & more." },
  { id: "text",      name: "Text & Content",     icon: "Aa",  blurb: "Lorem, usernames, slugs, emoji, hashtags & case converter." },
  { id: "color",     name: "Colors & Design",    icon: "◐",   blurb: "Hex/RGB/HSL colors, palettes, CSS names & gradients." },
  { id: "visual",    name: "Visual Tools",       icon: "▦",   blurb: "QR codes and barcodes as downloadable images." },
  { id: "security",  name: "Crypto & Security",  icon: "🔐",  blurb: "API keys, secrets, mnemonics, ULID, NanoID & TOTP." },
  { id: "address",   name: "Address & Network",  icon: "@",   blurb: "Addresses, IPs, MACs, CIDR, SWIFT & crypto wallets." },
  { id: "datetime",  name: "Date & Time",        icon: "◷",   blurb: "Dates, times, timestamps and timezones." },
  { id: "hex",       name: "Hex & Secrets",      icon: "0x",  blurb: "Hex strings and cryptographic secret keys." },
  { id: "reference", name: "Reference Data",     icon: "🌐",  blurb: "Real countries, currencies, DNS and network data." },
] as const;

// ---------- check-digit helpers ----------

function luhnCheckDigit(digits: string): number {
  let sum = 0;
  let alt = true;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = digits.charCodeAt(i) - 48;
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return (10 - (sum % 10)) % 10;
}

function ean13CheckDigit(digits: string): number {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    sum += (digits.charCodeAt(i) - 48) * (i % 2 === 0 ? 1 : 3);
  }
  return (10 - (sum % 10)) % 10;
}

function isbn13CheckDigit(digits: string): number {
  return ean13CheckDigit(digits);
}

function digits(n: number): string {
  let s = "";
  for (let i = 0; i < n; i++) s += randomInt(0, 9);
  return s;
}

function sha(algo: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512", data: BufferSource) {
  return crypto.subtle.digest(algo, data).then((buf) =>
    Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("")
  );
}

const num = (key: string, label: string, def: number, min: number, max: number, help?: string): Field => ({
  key, label, type: "number", default: def, min, max, help,
});

const B62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"; // RFC 4648
const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // ULID
const NANO = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function jsonToBase64Url(obj: unknown): string {
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(obj)));
}

/** Compute the two ISO 13616 check digits for an IBAN. */
function ibanCheckDigits(country: string, bban: string): string {
  const rearranged = bban + country + "00";
  const numeric = rearranged
    .toUpperCase()
    .split("")
    .map((c) => (c >= "A" && c <= "Z" ? (c.charCodeAt(0) - 55).toString() : c))
    .join("");
  // mod-97 over a long numeric string
  let remainder = 0;
  for (const ch of numeric) remainder = (remainder * 10 + (ch.charCodeAt(0) - 48)) % 97;
  const check = 98 - remainder;
  return check.toString().padStart(2, "0");
}

function toRoman(n: number): string {
  const map: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
    [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let out = "";
  for (const [v, s] of map) while (n >= v) { out += s; n -= v; }
  return out;
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const c = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(255 * c).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// ---------- generators ----------

export const GENERATORS: Generator[] = [
  // ===== NUMBERS =====
  {
    slug: "integer",
    name: "Integer Generator",
    category: "numbers",
    short: "Random whole numbers in any range.",
    description:
      "Generate cryptographically secure random integers between a minimum and maximum bound. Useful for lotteries, sampling, testing and simulations.",
    keywords: ["random number", "integer", "rng", "number generator"],
    fields: [num("min", "Minimum", 1, -1e15, 1e15), num("max", "Maximum", 100, -1e15, 1e15)],
    generate: (o) => String(randomInt(Number(o.min), Number(o.max))),
  },
  {
    slug: "float",
    name: "Float Generator",
    category: "numbers",
    short: "Random decimal numbers.",
    description: "Generate random floating-point numbers within a range and a chosen number of decimal places.",
    keywords: ["float", "decimal", "random"],
    fields: [
      num("min", "Minimum", 0, -1e12, 1e12),
      num("max", "Maximum", 1, -1e12, 1e12),
      num("decimals", "Decimal places", 4, 0, 12),
    ],
    generate: (o) => randomFloat(Number(o.min), Number(o.max), Number(o.decimals)).toFixed(Number(o.decimals)),
  },
  {
    slug: "prime",
    name: "Prime Number Generator",
    category: "numbers",
    short: "Random prime numbers.",
    description: "Generate random prime numbers within a chosen range using a Miller–Rabin primality test.",
    keywords: ["prime", "number theory"],
    fields: [num("min", "Minimum", 2, 2, 1e9), num("max", "Maximum", 1000, 3, 1e9)],
    generate: (o) => {
      const min = Math.max(2, Number(o.min));
      const max = Math.max(min + 1, Number(o.max));
      for (let tries = 0; tries < 5000; tries++) {
        const n = randomInt(min, max);
        if (isPrime(n)) return String(n);
      }
      return "No prime found in range";
    },
  },
  {
    slug: "pin",
    name: "PIN Generator",
    category: "numbers",
    short: "Secure numeric PIN codes.",
    description: "Generate secure random numeric PIN codes of a chosen length for cards, devices and accounts.",
    keywords: ["pin", "passcode", "numeric"],
    fields: [num("length", "Digits", 4, 3, 12)],
    generate: (o) => digits(Number(o.length)),
  },
  {
    slug: "imei",
    name: "IMEI Generator",
    category: "numbers",
    short: "Valid IMEI device numbers.",
    description: "Generate IMEI numbers with a valid Luhn check digit. For software testing only — these are not registered devices.",
    keywords: ["imei", "device", "luhn"],
    fields: [],
    generate: () => {
      const body = digits(14);
      return body + luhnCheckDigit(body);
    },
  },
  {
    slug: "isbn",
    name: "ISBN Generator",
    category: "numbers",
    short: "Valid ISBN-13 book numbers.",
    description: "Generate ISBN-13 numbers with a correct check digit, formatted with hyphens.",
    keywords: ["isbn", "book", "barcode"],
    fields: [],
    generate: () => {
      const prefix = pick(["978", "979"]);
      const body = prefix + digits(9);
      const check = isbn13CheckDigit(body);
      const full = body + check;
      return `${full.slice(0, 3)}-${full.slice(3, 4)}-${full.slice(4, 9)}-${full.slice(9, 12)}-${full.slice(12)}`;
    },
  },
  {
    slug: "ean",
    name: "EAN-13 Generator",
    category: "numbers",
    short: "Valid EAN-13 barcodes.",
    description: "Generate EAN-13 barcode numbers with a valid check digit for retail and testing.",
    keywords: ["ean", "barcode", "gtin"],
    fields: [],
    generate: () => {
      const body = digits(12);
      return body + ean13CheckDigit(body);
    },
  },
  {
    slug: "asin",
    name: "ASIN Generator",
    category: "numbers",
    short: "Amazon-style ASIN codes.",
    description: "Generate 10-character ASIN-style identifiers (B + 9 alphanumerics) for catalog testing.",
    keywords: ["asin", "amazon", "product id"],
    fields: [],
    generate: () => "B" + randomString(9, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"),
  },
  {
    slug: "wps-pin",
    name: "WPS PIN Generator",
    category: "numbers",
    short: "8-digit WPS router PINs.",
    description: "Generate 8-digit WPS PINs with a valid checksum digit, as used by Wi-Fi Protected Setup.",
    keywords: ["wps", "wifi", "router pin"],
    fields: [],
    generate: () => {
      const body = digits(7);
      // WPS checksum
      const d = body.split("").map(Number);
      const accum =
        3 * (d[0] + d[2] + d[4] + d[6]) + (d[1] + d[3] + d[5]);
      const check = (10 - (accum % 10)) % 10;
      return body + check;
    },
  },

  // ===== DEVELOPER =====
  {
    slug: "password",
    name: "Password Generator",
    category: "developer",
    short: "Strong, secure passwords.",
    description: "Generate strong random passwords with full control over length and character classes. Everything runs locally in your browser.",
    keywords: ["password", "secure", "credentials"],
    fields: [
      num("length", "Length", 16, 4, 128),
      { key: "lower", label: "Lowercase (a-z)", type: "checkbox", default: true },
      { key: "upper", label: "Uppercase (A-Z)", type: "checkbox", default: true },
      { key: "digits", label: "Digits (0-9)", type: "checkbox", default: true },
      { key: "symbols", label: "Symbols (!@#…)", type: "checkbox", default: true },
    ],
    generate: (o) => {
      let charset = "";
      if (o.lower) charset += "abcdefghijklmnopqrstuvwxyz";
      if (o.upper) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      if (o.digits) charset += "0123456789";
      if (o.symbols) charset += "!@#$%^&*()-_=+[]{};:,.<>?";
      if (!charset) charset = "abcdefghijklmnopqrstuvwxyz";
      return randomString(Number(o.length), charset);
    },
  },
  {
    slug: "uuid",
    name: "UUID Generator",
    category: "developer",
    short: "RFC 4122 v4 UUIDs.",
    description: "Generate random version-4 UUIDs (universally unique identifiers) using the secure crypto API.",
    keywords: ["uuid", "guid", "identifier"],
    fields: [
      { key: "uppercase", label: "Uppercase", type: "checkbox", default: false },
    ],
    generate: (o) => {
      const id = crypto.randomUUID();
      return o.uppercase ? id.toUpperCase() : id;
    },
  },
  {
    slug: "base64",
    name: "Base64 Generator",
    category: "developer",
    short: "Random base64 strings.",
    description: "Generate random base64-encoded strings of a chosen byte length, ideal for tokens and test fixtures.",
    keywords: ["base64", "token", "encode"],
    fields: [num("bytes", "Bytes", 24, 1, 1024)],
    generate: (o) => {
      const bytes = randomBytes(Number(o.bytes));
      let bin = "";
      bytes.forEach((b) => (bin += String.fromCharCode(b)));
      return btoa(bin);
    },
  },
  {
    slug: "byte-string",
    name: "Byte String Generator",
    category: "developer",
    short: "Random byte arrays.",
    description: "Generate space-separated random byte values (0–255) for low-level testing.",
    keywords: ["bytes", "binary", "array"],
    fields: [num("count", "Number of bytes", 16, 1, 512)],
    generate: (o) =>
      Array.from(randomBytes(Number(o.count)), (b) => b.toString(10).padStart(3, "0")).join(" "),
  },
  {
    slug: "hash",
    name: "Hash Generator",
    category: "developer",
    short: "SHA hashes of random data.",
    description: "Generate cryptographic hashes (SHA-1/256/384/512) of fresh random input. Computed locally via Web Crypto.",
    keywords: ["hash", "sha256", "checksum"],
    fields: [
      {
        key: "algo",
        label: "Algorithm",
        type: "select",
        default: "SHA-256",
        options: ["SHA-1", "SHA-256", "SHA-384", "SHA-512"].map((v) => ({ value: v, label: v })),
      },
    ],
    generate: (o) => sha(o.algo as "SHA-256", randomBytes(32) as BufferSource),
  },
  {
    slug: "htpasswd",
    name: "htpasswd Generator",
    category: "developer",
    short: "Apache htpasswd entries.",
    description: "Generate an Apache htpasswd line (user:hash) using a SHA-1 password hash for the chosen username.",
    keywords: ["htpasswd", "apache", "auth"],
    fields: [
      { key: "user", label: "Username", type: "text", default: "admin" },
      num("length", "Password length", 16, 6, 64),
    ],
    generate: async (o) => {
      const pwd = randomString(Number(o.length), "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
      const enc = new TextEncoder().encode(pwd);
      const hashBuf = await crypto.subtle.digest("SHA-1", enc as BufferSource);
      let bin = "";
      new Uint8Array(hashBuf).forEach((b) => (bin += String.fromCharCode(b)));
      const user = String(o.user || "admin").replace(/[:\s]/g, "") || "admin";
      return `${user}:{SHA}${btoa(bin)}    # password: ${pwd}`;
    },
  },

  // ===== ADDRESS & NETWORK =====
  {
    slug: "address",
    name: "Address Generator",
    category: "address",
    short: "Realistic postal addresses (7 countries).",
    description: "Generate realistic-looking postal addresses for form testing and demos. Supports US, UK, India, Australia, Canada, Germany and France. All data is fictional.",
    keywords: ["address", "postal", "fake address", "international", "uk", "india", "australia"],
    fields: [
      { key: "country", label: "Country", type: "select", default: "us", options: [
        { value: "us",  label: "United States" },
        { value: "uk",  label: "United Kingdom" },
        { value: "in",  label: "India" },
        { value: "au",  label: "Australia" },
        { value: "ca",  label: "Canada" },
        { value: "de",  label: "Germany" },
        { value: "fr",  label: "France" },
        { value: "random", label: "Random country" },
      ]},
    ],
    generate: (o) => {
      const country = o.country === "random" ? pick(["us","uk","in","au","ca","de","fr"]) : String(o.country);
      const num = randomInt(1, 999);
      if (country === "uk") {
        const roads = ["High Street","Church Road","Park Lane","Victoria Road","London Road","Station Road","Mill Lane","Elm Close"];
        const towns = ["London","Manchester","Birmingham","Leeds","Glasgow","Bristol","Sheffield","Liverpool"];
        const area = pick(UK_AREAS);
        return `${num} ${pick(roads)}, ${pick(towns)}, ${area}${randomInt(1,20)} ${randomInt(0,9)}${randomString(2,"ABDEFGHJLNPRSTUVWXY")}, UK`;
      }
      if (country === "in") {
        const areas = ["MG Road","Gandhi Nagar","Nehru Street","Anna Nagar","Bandra West","Koramangala","Connaught Place","Sector 15"];
        const cities = ["Mumbai","Delhi","Bengaluru","Hyderabad","Chennai","Kolkata","Pune","Ahmedabad","Jaipur","Surat"];
        const states = ["Maharashtra","Delhi","Karnataka","Telangana","Tamil Nadu","West Bengal","Gujarat","Rajasthan"];
        const pin = digits(6);
        return `${num}, ${pick(areas)}, ${pick(cities)}, ${pick(states)} - ${pin}, India`;
      }
      if (country === "au") {
        const roads = ["Main Street","Beach Road","Park Drive","Queen Street","King Street","George Street","Pitt Street"];
        const cities = ["Sydney","Melbourne","Brisbane","Perth","Adelaide","Gold Coast","Canberra","Hobart"];
        const states = ["NSW","VIC","QLD","WA","SA","ACT","TAS"];
        return `${num} ${pick(roads)}, ${pick(cities)} ${pick(states)} ${randomInt(2000,7999)}, Australia`;
      }
      if (country === "ca") {
        const roads = ["Main Street","Maple Avenue","Oak Drive","Queen Street","King Street","Bay Street","Yonge Street"];
        const cities = ["Toronto","Vancouver","Montreal","Calgary","Ottawa","Edmonton","Winnipeg","Quebec City"];
        const provinces = ["ON","BC","QC","AB","MB","SK","NS","NB"];
        const fsa = randomString(1, CA_FSA_CHARS) + randomInt(0,9) + randomString(1, CA_FSA_CHARS);
        const ldu = randomInt(0,9) + randomString(1, CA_FSA_CHARS) + randomInt(0,9);
        return `${num} ${pick(roads)}, ${pick(cities)}, ${pick(provinces)} ${fsa} ${ldu}, Canada`;
      }
      if (country === "de") {
        const roads = ["Hauptstraße","Bahnhofstraße","Gartenstraße","Berliner Straße","Schillerstraße","Goethestraße","Parkweg"];
        const cities = ["Berlin","Hamburg","München","Köln","Frankfurt","Stuttgart","Düsseldorf","Leipzig","Dresden"];
        const states = ["Bayern","Nordrhein-Westfalen","Baden-Württemberg","Hessen","Sachsen","Niedersachsen","Brandenburg"];
        return `${pick(roads)} ${num}, ${digits(5)} ${pick(cities)} (${pick(states)}), Germany`;
      }
      if (country === "fr") {
        const roads = ["Rue de la Paix","Avenue des Champs","Boulevard Saint-Germain","Rue du Faubourg","Allée des Roses","Impasse des Lilas"];
        const cities = ["Paris","Lyon","Marseille","Toulouse","Bordeaux","Nantes","Nice","Strasbourg","Rennes"];
        const depts = ["Île-de-France","Rhône","Bouches-du-Rhône","Haute-Garonne","Gironde","Loire-Atlantique"];
        return `${num} ${pick(roads)}, ${digits(5)} ${pick(cities)}, ${pick(depts)}, France`;
      }
      // US default
      const [state, abbr] = pick(STATES);
      return `${randomInt(1, 9999)} ${pick(STREETS)}, ${pick(CITIES)}, ${abbr} ${digits(5)} (${state}), USA`;
    },
  },
  {
    slug: "city",
    name: "City Generator",
    category: "address",
    short: "Random city + state pairs.",
    description: "Generate random city and state combinations for sample data sets.",
    keywords: ["city", "location", "place"],
    fields: [],
    generate: () => {
      const [state] = pick(STATES);
      return `${pick(CITIES)}, ${state}`;
    },
  },
  {
    slug: "person",
    name: "Person Generator",
    category: "address",
    short: "Random names & emails.",
    description: "Generate a fictional person with a name and email address for test fixtures.",
    keywords: ["name", "person", "email"],
    fields: [],
    generate: () => {
      const f = pick(FIRST_NAMES);
      const l = pick(LAST_NAMES);
      return `${f} ${l} <${f.toLowerCase()}.${l.toLowerCase()}@example.com>`;
    },
  },
  {
    slug: "ip",
    name: "IP Address Generator",
    category: "address",
    short: "Random IPv4 / IPv6 addresses.",
    description: "Generate random IPv4 or IPv6 addresses for network testing.",
    keywords: ["ip", "ipv4", "ipv6", "network"],
    fields: [
      {
        key: "version",
        label: "Version",
        type: "select",
        default: "ipv4",
        options: [
          { value: "ipv4", label: "IPv4" },
          { value: "ipv6", label: "IPv6" },
        ],
      },
    ],
    generate: (o) => {
      if (o.version === "ipv6") {
        return Array.from({ length: 8 }, () => randomHex(2)).join(":");
      }
      return Array.from({ length: 4 }, () => randomInt(0, 255)).join(".");
    },
  },
  {
    slug: "mac",
    name: "MAC Address Generator",
    category: "address",
    short: "Random MAC addresses.",
    description: "Generate random MAC (hardware) addresses in colon-separated hexadecimal format.",
    keywords: ["mac", "hardware address", "ethernet"],
    fields: [
      {
        key: "sep",
        label: "Separator",
        type: "select",
        default: ":",
        options: [
          { value: ":", label: "Colon ( : )" },
          { value: "-", label: "Hyphen ( - )" },
        ],
      },
    ],
    generate: (o) =>
      Array.from({ length: 6 }, () => randomHex(1).toUpperCase()).join(String(o.sep)),
  },
  {
    slug: "mac-vendor",
    name: "MAC Vendor Generator",
    category: "address",
    short: "MAC with real vendor prefix.",
    description: "Generate a MAC address using a real IEEE OUI vendor prefix, with the vendor name shown.",
    keywords: ["mac vendor", "oui", "ieee"],
    fields: [],
    generate: () => {
      const [prefix, vendor] = pick(MAC_VENDORS);
      const tail = Array.from({ length: 3 }, () => randomHex(1).toUpperCase()).join(":");
      return `${prefix}:${tail}  —  ${vendor}`;
    },
  },
  {
    slug: "crypto-address",
    name: "Crypto Address Generator",
    category: "address",
    short: "Sample wallet addresses.",
    description: "Generate sample-format cryptocurrency wallet addresses (Bitcoin/Ethereum style) for UI testing. These are NOT real wallets.",
    keywords: ["crypto", "bitcoin", "ethereum", "wallet"],
    fields: [
      {
        key: "chain",
        label: "Network",
        type: "select",
        default: "eth",
        options: [
          { value: "eth", label: "Ethereum (0x…)" },
          { value: "btc", label: "Bitcoin (bc1…)" },
        ],
      },
    ],
    generate: (o) => {
      if (o.chain === "btc") return "bc1q" + randomString(38, "abcdefghijklmnopqrstuvwxyz0123456789");
      return "0x" + randomHex(20);
    },
  },

  // ===== DATE & TIME =====
  {
    slug: "date",
    name: "Date Generator",
    category: "datetime",
    short: "Random calendar dates.",
    description: "Generate random calendar dates between two years in ISO format.",
    keywords: ["date", "calendar", "random date"],
    fields: [num("from", "From year", 1990, 1900, 2100), num("to", "To year", 2030, 1900, 2100)],
    generate: (o) => {
      const from = new Date(Number(o.from), 0, 1).getTime();
      const to = new Date(Number(o.to), 11, 31).getTime();
      const t = randomInt(Math.min(from, to), Math.max(from, to));
      return new Date(t).toISOString().slice(0, 10);
    },
  },
  {
    slug: "time",
    name: "Time Generator",
    category: "datetime",
    short: "Random times of day.",
    description: "Generate random times of day in 24-hour HH:MM:SS format.",
    keywords: ["time", "clock", "hours"],
    fields: [],
    generate: () =>
      [randomInt(0, 23), randomInt(0, 59), randomInt(0, 59)]
        .map((n) => String(n).padStart(2, "0"))
        .join(":"),
  },
  {
    slug: "datetime",
    name: "Date-Time Generator",
    category: "datetime",
    short: "Random ISO timestamps.",
    description: "Generate random ISO-8601 date-time stamps between two years.",
    keywords: ["datetime", "timestamp", "iso"],
    fields: [num("from", "From year", 2000, 1900, 2100), num("to", "To year", 2035, 1900, 2100)],
    generate: (o) => {
      const from = new Date(Number(o.from), 0, 1).getTime();
      const to = new Date(Number(o.to), 11, 31).getTime();
      const t = randomInt(Math.min(from, to), Math.max(from, to));
      return new Date(t).toISOString().replace(".000", "");
    },
  },

  // ===== HEX & SECRETS =====
  {
    slug: "hex",
    name: "Hex String Generator",
    category: "hex",
    short: "Random hexadecimal strings.",
    description: "Generate random hexadecimal strings of a chosen byte length.",
    keywords: ["hex", "hexadecimal", "random"],
    fields: [
      num("bytes", "Bytes", 16, 1, 1024),
      { key: "prefix", label: "Add 0x prefix", type: "checkbox", default: false },
    ],
    generate: (o) => (o.prefix ? "0x" : "") + randomHex(Number(o.bytes)),
  },
  {
    slug: "secret-key",
    name: "Secret Key Generator",
    category: "hex",
    short: "64-byte cryptographic keys.",
    description: "Generate strong cryptographic secret keys (default 64 bytes) suitable for signing and session secrets.",
    keywords: ["secret", "key", "crypto", "jwt secret"],
    fields: [
      num("bytes", "Bytes", 64, 16, 256),
      {
        key: "format",
        label: "Format",
        type: "select",
        default: "hex",
        options: [
          { value: "hex", label: "Hex" },
          { value: "base64", label: "Base64" },
        ],
      },
    ],
    generate: (o) => {
      const bytes = randomBytes(Number(o.bytes));
      if (o.format === "base64") {
        let bin = "";
        bytes.forEach((b) => (bin += String.fromCharCode(b)));
        return btoa(bin);
      }
      return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    },
  },

  // ===== NUMBERS (extra) =====
  {
    slug: "binary-number",
    name: "Binary Number Generator",
    category: "numbers",
    short: "Number in binary, hex & octal.",
    description: "Generate a random number and display it in decimal, binary, hexadecimal and octal — great for CS and programming practice.",
    keywords: ["binary", "hex", "octal", "base conversion", "number"],
    fields: [num("min", "Minimum", 0, 0, 16777215), num("max", "Maximum", 255, 0, 16777215)],
    generate: (o) => {
      const n = randomInt(Number(o.min), Number(o.max));
      const bits = n.toString(2).length;
      const pad = Math.ceil(bits / 8) * 8 || 8;
      return `DEC: ${n}  |  BIN: ${n.toString(2).padStart(pad, "0")}  |  HEX: 0x${n.toString(16).toUpperCase().padStart(Math.ceil(pad / 4), "0")}  |  OCT: ${n.toString(8)}`;
    },
  },
  {
    slug: "unix-timestamp",
    name: "Unix Timestamp Generator",
    category: "numbers",
    short: "Random Unix timestamps.",
    description: "Generate random Unix timestamps in seconds and milliseconds with the human-readable ISO date.",
    keywords: ["timestamp", "unix", "epoch", "time"],
    fields: [num("from", "From year", 2000, 1970, 2100), num("to", "To year", 2030, 1970, 2100)],
    generate: (o) => {
      const from = Math.floor(new Date(Number(o.from), 0, 1).getTime() / 1000);
      const to   = Math.floor(new Date(Number(o.to),   11, 31).getTime() / 1000);
      const ts   = randomInt(from, to);
      return `${ts}  (ms: ${ts * 1000})  →  ${new Date(ts * 1000).toISOString()}`;
    },
  },
  {
    slug: "lottery-numbers",
    name: "Lottery Number Generator",
    category: "numbers",
    short: "Random lottery picks.",
    description: "Pick random unique lottery numbers with an optional bonus ball. Supports any pool size.",
    keywords: ["lottery", "lotto", "random numbers", "lucky numbers"],
    fields: [
      num("count", "Numbers to pick", 6, 1, 20),
      num("max", "Pool size", 49, 2, 100),
      { key: "bonus", label: "Include bonus ball", type: "checkbox", default: true },
    ],
    generate: (o) => {
      const count = Math.min(Number(o.count), Number(o.max) - 1);
      const max = Number(o.max);
      const picks = new Set<number>();
      while (picks.size < count) picks.add(randomInt(1, max));
      const sorted = [...picks].sort((a, b) => a - b).join("  ·  ");
      if (!o.bonus) return sorted;
      let bonus: number;
      do { bonus = randomInt(1, max); } while (picks.has(bonus));
      return `${sorted}    [Bonus: ${bonus}]`;
    },
  },
  {
    slug: "percentage",
    name: "Percentage Generator",
    category: "numbers",
    short: "Random percentages.",
    description: "Generate random percentage values with optional decimal places.",
    keywords: ["percentage", "percent", "ratio"],
    fields: [num("decimals", "Decimal places", 1, 0, 4)],
    generate: (o) => `${randomFloat(0, 100, Number(o.decimals)).toFixed(Number(o.decimals))}%`,
  },

  // ===== TEXT & CONTENT =====
  {
    slug: "lorem-ipsum",
    name: "Lorem Ipsum Generator",
    category: "text",
    short: "Placeholder paragraphs.",
    description: "Generate classic lorem ipsum placeholder text by number of words.",
    keywords: ["lorem", "ipsum", "placeholder", "dummy text"],
    fields: [num("words", "Words", 40, 5, 500)],
    generate: (o) => {
      const n = Number(o.words);
      const out: string[] = [];
      for (let i = 0; i < n; i++) out.push(LOREM[randomInt(0, LOREM.length - 1)]);
      let s = out.join(" ");
      s = s.charAt(0).toUpperCase() + s.slice(1) + ".";
      return s;
    },
  },
  {
    slug: "username",
    name: "Username Generator",
    category: "text",
    short: "Memorable usernames.",
    description: "Generate memorable usernames from adjective + noun + number combinations.",
    keywords: ["username", "handle", "nickname"],
    fields: [
      { key: "sep", label: "Separator", type: "select", default: "_", options: [
        { value: "_", label: "Underscore" }, { value: "", label: "None" }, { value: ".", label: "Dot" },
      ] },
    ],
    generate: (o) => `${pick(ADJECTIVES)}${o.sep}${pick(NOUNS)}${o.sep}${randomInt(1, 999)}`,
  },
  {
    slug: "slug",
    name: "Slug Generator",
    category: "text",
    short: "URL-friendly slugs.",
    description: "Convert text into a clean, URL-friendly slug. Type your own title or leave blank for a random one.",
    keywords: ["slug", "url", "permalink"],
    fields: [{ key: "text", label: "Text (optional)", type: "text", default: "" }],
    generate: (o) => {
      const src = String(o.text).trim() || `${pick(ADJECTIVES)} ${pick(NOUNS)} ${pick(LOREM)}`;
      return src.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-");
    },
  },
  {
    slug: "random-word",
    name: "Random Word Generator",
    category: "text",
    short: "Single random words.",
    description: "Generate random English words, handy for brainstorming and naming.",
    keywords: ["word", "random word", "vocabulary"],
    fields: [],
    generate: () => pick([...ADJECTIVES, ...NOUNS, ...LOREM]),
  },
  {
    slug: "sentence",
    name: "Sentence Generator",
    category: "text",
    short: "Random sentences.",
    description: "Generate random placeholder sentences of varying length.",
    keywords: ["sentence", "text", "placeholder"],
    fields: [num("words", "Words", 12, 4, 40)],
    generate: (o) => {
      const n = Number(o.words);
      const w = Array.from({ length: n }, () => LOREM[randomInt(0, LOREM.length - 1)]);
      w[0] = w[0].charAt(0).toUpperCase() + w[0].slice(1);
      return w.join(" ") + ".";
    },
  },
  {
    slug: "company-name",
    name: "Company Name Generator",
    category: "text",
    short: "Brandable company names.",
    description: "Generate brandable, fictional company names for mockups and demos.",
    keywords: ["company", "brand", "business name"],
    fields: [],
    generate: () => `${pick(COMPANY_PREFIX)} ${pick(COMPANY_SUFFIX)}`,
  },

  // ===== IDENTITY =====
  {
    slug: "full-name",
    name: "Name Generator",
    category: "identity",
    short: "Random full names.",
    description: "Generate random full names, optionally by gender. All names are fictional.",
    keywords: ["name", "full name", "fake name"],
    fields: [
      { key: "gender", label: "Gender", type: "select", default: "any", options: [
        { value: "any", label: "Any" }, { value: "m", label: "Male" }, { value: "f", label: "Female" },
      ] },
    ],
    generate: (o) => {
      const first = o.gender === "m" ? pick(FIRST_NAMES_M) : o.gender === "f" ? pick(FIRST_NAMES_F) : pick([...FIRST_NAMES_M, ...FIRST_NAMES_F]);
      return `${first} ${pick(LAST_NAMES2)}`;
    },
  },
  {
    slug: "phone",
    name: "Phone Number Generator",
    category: "identity",
    short: "Formatted phone numbers.",
    description: "Generate phone numbers with a real country calling code. Numbers are fictional.",
    keywords: ["phone", "telephone", "mobile number"],
    fields: [],
    generate: () => {
      const c = pick(COUNTRIES);
      return `${c.dial} ${digits(3)} ${digits(3)} ${digits(4)} (${c.code})`;
    },
  },
  {
    slug: "email",
    name: "Email Generator",
    category: "identity",
    short: "Random email addresses.",
    description: "Generate realistic fictional email addresses using safe example domains.",
    keywords: ["email", "address", "mail"],
    fields: [],
    generate: () => {
      const first = pick([...FIRST_NAMES_M, ...FIRST_NAMES_F]).toLowerCase();
      const last = pick(LAST_NAMES2).toLowerCase();
      const domain = pick(["example.com", "example.org", "test.com", "demo.dev"]);
      return `${first}.${last}${randomInt(1, 99)}@${domain}`;
    },
  },
  {
    slug: "job-title",
    name: "Job Title Generator",
    category: "identity",
    short: "Random job titles.",
    description: "Generate realistic job titles for sample HR and profile data.",
    keywords: ["job", "title", "occupation"],
    fields: [],
    generate: () => pick(JOB_TITLES),
  },
  {
    slug: "credit-card",
    name: "Credit Card Generator",
    category: "identity",
    short: "Valid-format test cards.",
    description: "Generate test credit card numbers with a valid Luhn check digit. For software testing only — these are NOT real cards.",
    keywords: ["credit card", "luhn", "test card", "payment"],
    fields: [
      { key: "brand", label: "Brand", type: "select", default: "visa", options: [
        { value: "visa", label: "Visa" },
        { value: "mc", label: "Mastercard" },
        { value: "amex", label: "American Express" },
        { value: "discover", label: "Discover" },
        { value: "unionpay", label: "UnionPay" },
        { value: "maestro", label: "Maestro" },
        { value: "jcb", label: "JCB" },
        { value: "random", label: "Random brand" },
      ] },
    ],
    generate: (o) => {
      const brand = o.brand === "random" ? pick(["visa","mc","amex","discover","unionpay","maestro","jcb"]) : String(o.brand);
      let prefix: string, len: number;
      if (brand === "amex")      { prefix = pick(["34", "37"]); len = 15; }
      else if (brand === "mc")   { prefix = String(randomInt(51, 55)); len = 16; }
      else if (brand === "discover") { prefix = pick(["6011", "644", "645", "646", "647", "648", "649", "65"]); len = 16; }
      else if (brand === "unionpay") { prefix = "62"; len = 16; }
      else if (brand === "maestro")  { prefix = pick(["6304", "6759", "6761", "6762", "6763"]); len = 16; }
      else if (brand === "jcb")  { prefix = pick(["3528", "3529", "353", "354", "355", "356", "357", "358"]); len = 16; }
      else { prefix = "4"; len = 16; }
      let body = prefix;
      while (body.length < len - 1) body += randomInt(0, 9);
      const full = body + luhnCheckDigit(body);
      const formatted = brand === "amex"
        ? `${full.slice(0,4)} ${full.slice(4,10)} ${full.slice(10)}`
        : full.replace(/(.{4})/g, "$1 ").trim();
      const label = ({ visa:"VISA", mc:"Mastercard", amex:"Amex", discover:"Discover", unionpay:"UnionPay", maestro:"Maestro", jcb:"JCB" } as Record<string,string>)[brand] ?? brand;
      return `${formatted}  [${label}]`;
    },
  },
  {
    slug: "iban",
    name: "IBAN Generator",
    category: "identity",
    short: "Valid-checksum IBANs.",
    description: "Generate IBANs with a valid ISO 13616 (mod-97) checksum. Fictional accounts for testing only.",
    keywords: ["iban", "bank", "account"],
    fields: [
      { key: "country", label: "Country", type: "select", default: "DE", options: [
        { value: "DE", label: "Germany (DE)" }, { value: "GB", label: "United Kingdom (GB)" },
        { value: "FR", label: "France (FR)" }, { value: "ES", label: "Spain (ES)" },
        { value: "NL", label: "Netherlands (NL)" }, { value: "IT", label: "Italy (IT)" },
        { value: "SE", label: "Sweden (SE)" }, { value: "PL", label: "Poland (PL)" },
        { value: "CH", label: "Switzerland (CH)" }, { value: "AT", label: "Austria (AT)" },
        { value: "BE", label: "Belgium (BE)" }, { value: "DK", label: "Denmark (DK)" },
        { value: "NO", label: "Norway (NO)" }, { value: "FI", label: "Finland (FI)" },
        { value: "PT", label: "Portugal (PT)" }, { value: "IE", label: "Ireland (IE)" },
        { value: "LU", label: "Luxembourg (LU)" }, { value: "AE", label: "UAE (AE)" },
      ] },
    ],
    generate: (o) => {
      const c = String(o.country);
      const lengths: Record<string, number> = {
        DE: 18, GB: 18, FR: 23, ES: 20,
        NL: 14, IT: 23, SE: 20, PL: 24,
        CH: 17, AT: 16, BE: 12, DK: 14,
        NO: 11, FI: 14, PT: 21, IE: 18,
        LU: 16, AE: 19,
      };
      const bban = digits(lengths[c] || 18);
      const check = ibanCheckDigits(c, bban);
      return `${c}${check}${bban}`.replace(/(.{4})/g, "$1 ").trim();
    },
  },
  {
    slug: "ssn-test",
    name: "SSN (Test) Generator",
    category: "identity",
    short: "Test-format SSNs.",
    description: "Generate SSN-format strings for testing. These follow the format only and are not valid/issued SSNs.",
    keywords: ["ssn", "social security", "test"],
    fields: [],
    generate: () => `${digits(3)}-${digits(2)}-${digits(4)}`,
  },
  {
    slug: "birthdate",
    name: "Birthdate Generator",
    category: "identity",
    short: "Random dates of birth.",
    description: "Generate a random date of birth within an age range, with the computed age.",
    keywords: ["birthdate", "dob", "age"],
    fields: [num("minAge", "Min age", 18, 0, 120), num("maxAge", "Max age", 65, 0, 120)],
    generate: (o) => {
      const age = randomInt(Number(o.minAge), Number(o.maxAge));
      const now = new Date();
      const year = now.getFullYear() - age;
      const d = new Date(year, randomInt(0, 11), randomInt(1, 28));
      return `${d.toISOString().slice(0, 10)} (age ${age})`;
    },
  },

  // ===== WEB & DEV =====
  {
    slug: "json-mock",
    name: "JSON Mock Generator",
    category: "web",
    short: "Random JSON objects.",
    description: "Generate a random JSON object with common fields — ideal for API mocking and fixtures.",
    keywords: ["json", "mock", "api", "fixture"],
    fields: [],
    generate: () => {
      const obj = {
        id: crypto.randomUUID(),
        name: `${pick([...FIRST_NAMES_M, ...FIRST_NAMES_F])} ${pick(LAST_NAMES2)}`,
        email: `${pick(NOUNS)}${randomInt(1, 99)}@example.com`,
        active: randomInt(0, 1) === 1,
        age: randomInt(18, 70),
        country: pick(COUNTRIES).code,
        createdAt: new Date(randomInt(1.5e12, Date.now())).toISOString(),
      };
      return JSON.stringify(obj);
    },
  },
  {
    slug: "csv-mock",
    name: "CSV Row Generator",
    category: "web",
    short: "Random CSV rows.",
    description: "Generate CSV rows (id,name,email,country,age) for spreadsheet and import testing.",
    keywords: ["csv", "mock", "spreadsheet"],
    fields: [],
    generate: () => {
      const name = `${pick([...FIRST_NAMES_M, ...FIRST_NAMES_F])} ${pick(LAST_NAMES2)}`;
      return `${randomInt(1000, 9999)},"${name}",${pick(NOUNS)}@example.com,${pick(COUNTRIES).code},${randomInt(18, 70)}`;
    },
  },
  {
    slug: "user-agent",
    name: "User-Agent Generator",
    category: "web",
    short: "Real browser UA strings.",
    description: "Pick a real, representative browser User-Agent string for testing and analytics.",
    keywords: ["user agent", "ua", "browser"],
    fields: [],
    generate: () => pick(USER_AGENTS),
  },
  {
    slug: "http-status",
    name: "HTTP Status Generator",
    category: "web",
    short: "Real HTTP status codes.",
    description: "Get a random real HTTP status code with its standard reason phrase.",
    keywords: ["http", "status code", "rest"],
    fields: [],
    generate: () => {
      const [code, text] = pick(HTTP_STATUSES);
      return `${code} ${text}`;
    },
  },
  {
    slug: "url",
    name: "URL Generator",
    category: "web",
    short: "Random URLs.",
    description: "Generate random, realistic-looking URLs with paths and query strings.",
    keywords: ["url", "link", "endpoint"],
    fields: [],
    generate: () => {
      const path = Array.from({ length: randomInt(1, 3) }, () => pick(NOUNS)).join("/");
      return `https://${pick(ADJECTIVES)}${pick(NOUNS)}.${pick(TLDS2)}/${path}?id=${randomInt(1, 9999)}`;
    },
  },
  {
    slug: "domain",
    name: "Domain Name Generator",
    category: "web",
    short: "Brandable domains.",
    description: "Generate brandable, available-looking domain name ideas.",
    keywords: ["domain", "website", "dns"],
    fields: [],
    generate: () => `${pick(ADJECTIVES)}${pick(NOUNS)}.${pick(TLDS2)}`,
  },
  {
    slug: "semver",
    name: "Semantic Version Generator",
    category: "web",
    short: "SemVer version strings.",
    description: "Generate semantic version numbers (MAJOR.MINOR.PATCH) with optional pre-release tags.",
    keywords: ["semver", "version", "release"],
    fields: [
      { key: "pre", label: "Include pre-release", type: "checkbox", default: false },
    ],
    generate: (o) => {
      const base = `${randomInt(0, 9)}.${randomInt(0, 20)}.${randomInt(0, 40)}`;
      if (!o.pre) return base;
      return `${base}-${pick(["alpha", "beta", "rc"])}.${randomInt(1, 9)}`;
    },
  },
  {
    slug: "mime-type",
    name: "MIME Type Generator",
    category: "web",
    short: "Random MIME types.",
    description: "Get a random real MIME (media) type string.",
    keywords: ["mime", "content type", "media type"],
    fields: [],
    generate: () => pick(MIME_TYPES),
  },
  {
    slug: "git-hash",
    name: "Git Commit Hash Generator",
    category: "web",
    short: "40-char SHA-1 hashes.",
    description: "Generate Git-style 40-character SHA-1 commit hashes.",
    keywords: ["git", "commit", "sha1", "hash"],
    fields: [
      { key: "short", label: "Short (7 chars)", type: "checkbox", default: false },
    ],
    generate: (o) => randomHex(20).slice(0, o.short ? 7 : 40),
  },
  {
    slug: "jwt",
    name: "JWT Generator",
    category: "web",
    short: "Sample JWT tokens.",
    description: "Generate a sample JSON Web Token (header.payload.signature). The signature is random — for UI/testing only, not verifiable.",
    keywords: ["jwt", "token", "auth"],
    fields: [],
    generate: () => {
      const header = jsonToBase64Url({ alg: "HS256", typ: "JWT" });
      const payload = jsonToBase64Url({
        sub: String(randomInt(1000, 9999)),
        name: `${pick([...FIRST_NAMES_M, ...FIRST_NAMES_F])} ${pick(LAST_NAMES2)}`,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      });
      const sig = bytesToBase64Url(randomBytes(32));
      return `${header}.${payload}.${sig}`;
    },
  },

  // ===== COLORS & DESIGN =====
  {
    slug: "hex-color",
    name: "Hex Color Generator",
    category: "color",
    short: "Random hex colors.",
    description: "Generate random hex color codes (#RRGGBB).",
    keywords: ["color", "hex", "palette"],
    fields: [],
    generate: () => "#" + randomHex(3),
  },
  {
    slug: "rgb-color",
    name: "RGB Color Generator",
    category: "color",
    short: "Random RGB colors.",
    description: "Generate random RGB color values.",
    keywords: ["color", "rgb"],
    fields: [],
    generate: () => `rgb(${randomInt(0, 255)}, ${randomInt(0, 255)}, ${randomInt(0, 255)})`,
  },
  {
    slug: "hsl-color",
    name: "HSL Color Generator",
    category: "color",
    short: "Random HSL colors.",
    description: "Generate random HSL color values.",
    keywords: ["color", "hsl"],
    fields: [],
    generate: () => `hsl(${randomInt(0, 359)}, ${randomInt(40, 90)}%, ${randomInt(30, 70)}%)`,
  },
  {
    slug: "color-palette",
    name: "Color Palette Generator",
    category: "color",
    short: "Harmonious 5-color palettes.",
    description: "Generate a harmonious 5-color palette as hex codes using HSL spacing.",
    keywords: ["palette", "colors", "scheme"],
    fields: [],
    generate: () => {
      const base = randomInt(0, 359);
      return [0, 30, 60, 180, 210]
        .map((off) => hslToHex((base + off) % 360, randomInt(55, 80), randomInt(45, 65)))
        .join("  ");
    },
  },
  {
    slug: "css-gradient",
    name: "CSS Gradient Generator",
    category: "color",
    short: "Random CSS gradients.",
    description: "Generate ready-to-use CSS linear-gradient declarations.",
    keywords: ["gradient", "css", "background"],
    fields: [],
    generate: () => {
      const a = "#" + randomHex(3);
      const b = "#" + randomHex(3);
      return `linear-gradient(${randomInt(0, 360)}deg, ${a}, ${b})`;
    },
  },
  {
    slug: "tailwind-color",
    name: "Tailwind Color Generator",
    category: "color",
    short: "Real Tailwind palette colors.",
    description: "Pick a random color from the real Tailwind CSS palette with its hex value.",
    keywords: ["tailwind", "color", "palette"],
    fields: [],
    generate: () => {
      const [name, hex] = pick(TAILWIND_COLORS);
      return `${name}  ${hex}`;
    },
  },

  // ===== CRYPTO & SECURITY =====
  {
    slug: "api-key",
    name: "API Key Generator",
    category: "security",
    short: "Prefixed API keys.",
    description: "Generate API keys with a recognizable prefix and high-entropy random body.",
    keywords: ["api key", "token", "secret"],
    fields: [
      { key: "prefix", label: "Prefix", type: "text", default: "sk" },
      num("length", "Body length", 32, 16, 64),
    ],
    generate: (o) => {
      const prefix = String(o.prefix || "sk").replace(/[^a-zA-Z0-9_]/g, "") || "sk";
      return `${prefix}_${randomString(Number(o.length), B62)}`;
    },
  },
  {
    slug: "totp-secret",
    name: "TOTP Secret Generator",
    category: "security",
    short: "Base32 2FA secrets.",
    description: "Generate base32 TOTP secrets compatible with authenticator apps (Google Authenticator, Authy).",
    keywords: ["totp", "2fa", "otp", "base32"],
    fields: [num("length", "Length", 32, 16, 64)],
    generate: (o) => randomString(Number(o.length), B32),
  },
  {
    slug: "mnemonic",
    name: "Mnemonic Phrase Generator",
    category: "security",
    short: "BIP39-wordlist phrases.",
    description: "Generate random recovery-style phrases from the BIP39 English wordlist. For testing/UI only — these are not checksum-valid wallet seeds.",
    keywords: ["mnemonic", "bip39", "seed phrase", "wallet"],
    fields: [
      { key: "words", label: "Words", type: "select", default: "12", options: [
        { value: "12", label: "12 words" }, { value: "15", label: "15 words" }, { value: "24", label: "24 words" },
      ] },
    ],
    generate: (o) => Array.from({ length: Number(o.words) }, () => pick(BIP39_WORDS)).join(" "),
  },
  {
    slug: "nanoid",
    name: "NanoID Generator",
    category: "security",
    short: "Compact unique IDs.",
    description: "Generate NanoIDs — compact, URL-safe, collision-resistant unique identifiers.",
    keywords: ["nanoid", "id", "unique"],
    fields: [num("length", "Length", 21, 6, 64)],
    generate: (o) => randomString(Number(o.length), NANO),
  },
  {
    slug: "ulid",
    name: "ULID Generator",
    category: "security",
    short: "Sortable unique IDs.",
    description: "Generate ULIDs — lexicographically sortable, timestamp-prefixed unique identifiers (Crockford base32).",
    keywords: ["ulid", "id", "sortable"],
    fields: [],
    generate: () => {
      let time = Date.now();
      let ts = "";
      for (let i = 0; i < 10; i++) { ts = CROCKFORD[time % 32] + ts; time = Math.floor(time / 32); }
      const rand = Array.from({ length: 16 }, () => CROCKFORD[randomInt(0, 31)]).join("");
      return ts + rand;
    },
  },
  {
    slug: "salt",
    name: "Salt Generator",
    category: "security",
    short: "Cryptographic salts.",
    description: "Generate cryptographic salts in hex or base64 for password hashing.",
    keywords: ["salt", "hash", "crypto"],
    fields: [
      num("bytes", "Bytes", 16, 8, 64),
      { key: "format", label: "Format", type: "select", default: "hex", options: [
        { value: "hex", label: "Hex" }, { value: "base64", label: "Base64" },
      ] },
    ],
    generate: (o) => {
      const bytes = randomBytes(Number(o.bytes));
      if (o.format === "base64") {
        let bin = ""; bytes.forEach((b) => (bin += String.fromCharCode(b)));
        return btoa(bin);
      }
      return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    },
  },

  // ===== NUMBERS (extra) =====
  {
    slug: "dice",
    name: "Dice Roller",
    category: "numbers",
    short: "Roll virtual dice.",
    description: "Roll any number of dice with any number of sides (e.g. 2d6, 1d20).",
    keywords: ["dice", "roll", "d20", "tabletop"],
    fields: [num("count", "Dice", 2, 1, 20), num("sides", "Sides", 6, 2, 100)],
    generate: (o) => {
      const rolls = Array.from({ length: Number(o.count) }, () => randomInt(1, Number(o.sides)));
      const total = rolls.reduce((a, b) => a + b, 0);
      return `${rolls.join(" + ")} = ${total}`;
    },
  },
  {
    slug: "coin-flip",
    name: "Coin Flip",
    category: "numbers",
    short: "Heads or tails.",
    description: "Flip a fair coin — heads or tails.",
    keywords: ["coin", "flip", "heads", "tails"],
    fields: [],
    generate: () => pick(["Heads", "Tails"]),
  },
  {
    slug: "roman-numeral",
    name: "Roman Numeral Generator",
    category: "numbers",
    short: "Random Roman numerals.",
    description: "Generate a random number and its Roman numeral representation.",
    keywords: ["roman", "numeral", "number"],
    fields: [num("min", "Minimum", 1, 1, 3999), num("max", "Maximum", 3999, 1, 3999)],
    generate: (o) => {
      const n = randomInt(Number(o.min), Number(o.max));
      return `${n} = ${toRoman(n)}`;
    },
  },

  // ===== ADDRESS & NETWORK (extra) =====
  {
    slug: "cidr",
    name: "CIDR Block Generator",
    category: "address",
    short: "Random CIDR blocks.",
    description: "Generate random IPv4 CIDR network blocks (e.g. 10.0.0.0/24).",
    keywords: ["cidr", "subnet", "network"],
    fields: [],
    generate: () => {
      const prefix = pick([8, 16, 24]);
      const octets = [randomInt(1, 223), prefix > 8 ? randomInt(0, 255) : 0, prefix > 16 ? randomInt(0, 255) : 0, 0];
      return `${octets.join(".")}/${prefix}`;
    },
  },
  {
    slug: "subnet-mask",
    name: "Subnet Mask Generator",
    category: "address",
    short: "CIDR + dotted mask.",
    description: "Generate a subnet prefix length together with its dotted-decimal mask.",
    keywords: ["subnet", "mask", "network"],
    fields: [],
    generate: () => {
      const prefix = randomInt(8, 30);
      const mask = [0, 0, 0, 0];
      for (let i = 0; i < 32; i++) if (i < prefix) mask[Math.floor(i / 8)] |= 1 << (7 - (i % 8));
      return `/${prefix} = ${mask.join(".")}`;
    },
  },
  {
    slug: "my-ip",
    name: "My IP Address",
    category: "address",
    short: "Detect your real public IP.",
    description: "Detect and display your real public IP address as seen by the server.",
    keywords: ["my ip", "public ip", "what is my ip"],
    fields: [],
    generate: async () => {
      try {
        const r = await fetch("/api/my-ip");
        const j = await r.json();
        return j.ip || "Unknown";
      } catch {
        return "Could not detect IP";
      }
    },
  },

  // ===== TEXT (extra) =====
  {
    slug: "lorem-paragraph",
    name: "Lorem Paragraph Generator",
    category: "text",
    short: "Multi-paragraph placeholder text.",
    description: "Generate multiple lorem ipsum paragraphs for layout testing.",
    keywords: ["lorem", "paragraph", "placeholder", "text"],
    fields: [num("paragraphs", "Paragraphs", 2, 1, 10), num("sentences", "Sentences each", 4, 2, 10)],
    generate: (o) => {
      const paras: string[] = [];
      for (let p = 0; p < Number(o.paragraphs); p++) {
        const sentences: string[] = [];
        for (let s = 0; s < Number(o.sentences); s++) {
          const wc = randomInt(8, 18);
          const w = Array.from({ length: wc }, () => LOREM[randomInt(0, LOREM.length - 1)]);
          w[0] = w[0].charAt(0).toUpperCase() + w[0].slice(1);
          sentences.push(w.join(" ") + ".");
        }
        paras.push(sentences.join(" "));
      }
      return paras.join("\n\n");
    },
  },
  {
    slug: "text-case",
    name: "Text Case Converter",
    category: "text",
    short: "camelCase, PascalCase, snake_case & more.",
    description: "Generate a random phrase shown in camelCase, PascalCase, snake_case, kebab-case and SCREAMING_SNAKE_CASE.",
    keywords: ["camelcase", "snake_case", "kebab-case", "pascal", "text case"],
    fields: [],
    generate: () => {
      const parts = [pick(ADJECTIVES), pick(NOUNS), pick(LOREM)];
      const camel  = parts[0] + parts.slice(1).map(w => w[0].toUpperCase() + w.slice(1)).join("");
      const pascal = parts.map(w => w[0].toUpperCase() + w.slice(1)).join("");
      const snake  = parts.join("_");
      const kebab  = parts.join("-");
      const scream = snake.toUpperCase();
      return `camelCase:    ${camel}\nPascalCase:   ${pascal}\nsnake_case:   ${snake}\nkebab-case:   ${kebab}\nSCREAMING:    ${scream}`;
    },
  },
  {
    slug: "hashtag",
    name: "Hashtag Generator",
    category: "text",
    short: "Social media hashtags.",
    description: "Generate relevant-looking hashtags for social media and marketing mockups.",
    keywords: ["hashtag", "social media", "instagram", "twitter"],
    fields: [num("count", "Hashtags", 5, 2, 15)],
    generate: (o) => {
      const pool = [...ADJECTIVES, ...NOUNS, ...COMPANY_PREFIX, ...COMPANY_SUFFIX.map(s => s.toLowerCase())];
      return Array.from({ length: Number(o.count) }, () => `#${pick(pool)}${pick(["", randomInt(1,99).toString()])}`).join("  ");
    },
  },
  {
    slug: "emoji",
    name: "Emoji Generator",
    category: "text",
    short: "Random emoji with Unicode info.",
    description: "Pick a random emoji with its Unicode codepoint and official name.",
    keywords: ["emoji", "unicode", "symbol"],
    fields: [],
    generate: () => {
      const e = pick(EMOJIS);
      return `${e.emoji}  U+${e.code}  ${e.name}`;
    },
  },
  {
    slug: "color-name",
    name: "CSS Color Name Generator",
    category: "text",
    short: "Named CSS colors with hex.",
    description: "Pick a random CSS named color with its hex value.",
    keywords: ["css color", "named color", "html color"],
    fields: [],
    generate: () => {
      const c = pick(CSS_COLOR_NAMES);
      return `${c.name}  →  ${c.hex}`;
    },
  },
  {
    slug: "markdown",
    name: "Markdown Snippet Generator",
    category: "text",
    short: "Random markdown content.",
    description: "Generate a markdown snippet with headings, paragraphs and a list — ideal for editor and preview testing.",
    keywords: ["markdown", "md", "documentation", "text"],
    fields: [],
    generate: () => {
      const title = (pick(ADJECTIVES) + " " + pick(NOUNS)).replace(/^\w/, c => c.toUpperCase());
      const body = Array.from({ length: 2 }, () =>
        Array.from({ length: randomInt(6, 12) }, () => LOREM[randomInt(0, LOREM.length - 1)]).join(" ")
      );
      const items = Array.from({ length: 3 }, (_, i) => `- ${pick(ADJECTIVES)} ${pick(NOUNS)} step ${i + 1}`);
      return `# ${title}\n\n${body[0]}.\n\n## Key Points\n\n${body[1]}.\n\n${items.join("\n")}`;
    },
  },

  // ===== WEB & DEV (extra) =====
  {
    slug: "cron-expression",
    name: "Cron Expression Generator",
    category: "web",
    short: "Valid cron schedules with description.",
    description: "Generate a valid cron expression with a human-readable description. Uses standard 5-field POSIX format.",
    keywords: ["cron", "schedule", "unix", "task"],
    fields: [],
    generate: () => {
      const [expr, desc] = pick(CRON_PATTERNS as unknown as [string, string][]);
      return `${expr.padEnd(22)}  # ${desc}`;
    },
  },
  {
    slug: "sql-insert",
    name: "SQL INSERT Generator",
    category: "web",
    short: "Ready-to-use SQL INSERT statements.",
    description: "Generate realistic SQL INSERT statements with randomised data for any of the common tables.",
    keywords: ["sql", "insert", "database", "query"],
    fields: [
      { key: "table", label: "Table", type: "select", default: "users", options: SQL_TABLES.map(t => ({ value: t.table, label: t.table })) },
    ],
    generate: (o) => {
      const t = SQL_TABLES.find(x => x.table === o.table) ?? SQL_TABLES[0];
      const id   = randomInt(1, 99999);
      const name = `${pick(FIRST_NAMES_M)} ${pick(LAST_NAMES2)}`;
      const email = `${pick(NOUNS)}${randomInt(1,99)}@example.com`;
      const ts = new Date(Date.now() - randomInt(0, 365 * 24 * 3600 * 1000)).toISOString().replace("T", " ").slice(0, 19);
      const vals: Record<string,string> = {
        id: String(id), name: `'${name}'`, email: `'${email}'`, sku: `'${pick(["ELEC","CLTH","FOOD","BOOK"])}-${randomHex(3).toUpperCase()}'`,
        role: `'${pick(["user","admin","editor","viewer"])}'`, status: `'${pick(["pending","active","completed","cancelled"])}'`,
        customer_id: String(randomInt(1, 9999)), total: randomFloat(1, 9999, 2).toFixed(2),
        price: randomFloat(0.99, 299.99, 2).toFixed(2), stock: String(randomInt(0, 500)),
        account_id: String(randomInt(1, 9999)), amount: randomFloat(10, 9999, 2).toFixed(2),
        type: `'${pick(["debit","credit"])}'`, source: `'${pick(["web","mobile","api"])}'`,
        payload: `'${JSON.stringify({ key: randomHex(4) })}'`,
        created_at: `'${ts}'`, placed_at: `'${ts}'`, timestamp: `'${ts}'`, recorded_at: `'${ts}'`,
      };
      const cols = t.cols.join(", ");
      const valsStr = t.cols.map(c => vals[c] ?? `'${randomHex(3)}'`).join(", ");
      return `INSERT INTO ${t.table} (${cols})\nVALUES (${valsStr});`;
    },
  },
  {
    slug: "env-variable",
    name: "ENV Variable Generator",
    category: "web",
    short: ".env key=value entries.",
    description: "Generate realistic .env file entries for common configuration variables.",
    keywords: ["env", "environment variable", "config", "dotenv"],
    fields: [num("count", "Lines", 4, 1, 20)],
    generate: (o) => {
      const pairs = [
        () => `DATABASE_URL=postgresql://${pick(NOUNS)}:${randomString(12, "abcdefghjklmnprstuvwxyz0123456789")}@localhost:5432/${pick(NOUNS)}_db`,
        () => `API_KEY=${randomString(32, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")}`,
        () => `JWT_SECRET=${randomHex(32)}`,
        () => `PORT=${randomInt(3000, 9999)}`,
        () => `NODE_ENV=${pick(["development","staging","production"])}`,
        () => `REDIS_URL=redis://localhost:${randomInt(6379, 6399)}/${randomInt(0, 15)}`,
        () => `S3_BUCKET=${pick(COMPANY_PREFIX).toLowerCase()}-${pick(NOUNS)}-${pick(["dev","prod","staging"])}`,
        () => `SMTP_HOST=smtp.${pick(["gmail","outlook","mailgun","sendgrid"])}.com`,
        () => `MAX_CONNECTIONS=${randomInt(5, 100)}`,
        () => `LOG_LEVEL=${pick(["debug","info","warn","error"])}`,
        () => `SECRET_KEY=${randomString(50, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%")}`,
        () => `CACHE_TTL=${randomInt(60, 86400)}`,
      ];
      return Array.from({ length: Number(o.count) }, () => pick(pairs)()).join("\n");
    },
  },
  {
    slug: "docker-name",
    name: "Docker Container Name Generator",
    category: "web",
    short: "Docker-style container names.",
    description: "Generate Docker-style container names (adjective_noun) — same format Docker uses for auto-generated names.",
    keywords: ["docker", "container", "name", "devops"],
    fields: [],
    generate: () => `${pick(ADJECTIVES)}_${pick(NOUNS)}`,
  },
  {
    slug: "port-number",
    name: "Port Number Generator",
    category: "web",
    short: "Valid TCP/UDP port numbers.",
    description: "Generate random port numbers from the well-known, registered or dynamic/private range.",
    keywords: ["port", "tcp", "udp", "network"],
    fields: [
      { key: "range", label: "Range", type: "select", default: "registered", options: [
        { value: "well-known",  label: "Well-known (0–1023)" },
        { value: "registered", label: "Registered (1024–49151)" },
        { value: "dynamic",    label: "Dynamic (49152–65535)" },
      ]},
    ],
    generate: (o) => {
      const ranges: Record<string, [number, number]> = {
        "well-known": [1, 1023], "registered": [1024, 49151], "dynamic": [49152, 65535],
      };
      const [lo, hi] = ranges[String(o.range)] ?? [1024, 49151];
      return String(randomInt(lo, hi));
    },
  },
  {
    slug: "http-header",
    name: "HTTP Header Generator",
    category: "web",
    short: "Realistic HTTP headers.",
    description: "Generate a realistic HTTP request or response header line.",
    keywords: ["http", "header", "rest", "api"],
    fields: [],
    generate: () => {
      const uuid = crypto.randomUUID();
      const fn = pick(HTTP_HEADERS_LIST);
      return fn(uuid, Date.now());
    },
  },

  // ===== IDENTITY (extra) =====
  {
    slug: "license-plate",
    name: "License Plate Generator",
    category: "identity",
    short: "US-style license plates.",
    description: "Generate US-style license plate numbers in common letter-number formats.",
    keywords: ["license plate", "number plate", "vehicle", "registration"],
    fields: [],
    generate: () => {
      const formats = [
        () => randomString(3, "ABCDEFGHJKLMNPRSTUVWXYZ") + randomString(4, "0123456789"),
        () => randomString(2, "ABCDEFGHJKLMNPRSTUVWXYZ") + randomString(3, "0123456789") + randomString(2, "ABCDEFGHJKLMNPRSTUVWXYZ"),
        () => randomString(3, "0123456789") + randomString(3, "ABCDEFGHJKLMNPRSTUVWXYZ"),
        () => randomString(4, "0123456789") + randomString(3, "ABCDEFGHJKLMNPRSTUVWXYZ"),
      ];
      return pick(formats)();
    },
  },
  {
    slug: "vin",
    name: "VIN Generator",
    category: "identity",
    short: "Vehicle Identification Numbers.",
    description: "Generate 17-character VINs with real WMI codes and valid character set (no I, O, Q). For software testing only.",
    keywords: ["vin", "vehicle", "automobile", "chassis"],
    fields: [],
    generate: () => {
      const wmi  = pick(VIN_WMI).padEnd(3, "A").slice(0, 3);
      const vds  = randomString(5, VIN_CHARS);
      const chk  = String(randomInt(0, 9));            // simplified check digit
      const year = pick(VIN_YEAR_CODES);
      const plant = randomString(1, VIN_CHARS);
      const seq  = String(randomInt(100000, 999999));
      return `${wmi}${vds}${chk}${year}${plant}${seq}`;
    },
  },
  {
    slug: "uk-postcode",
    name: "UK Postcode Generator",
    category: "identity",
    short: "British postcode format.",
    description: "Generate UK-style postcodes in standard formats (AN NAA, ANN NAA, AAN NAA, AANN NAA).",
    keywords: ["postcode", "uk", "british", "postal code"],
    fields: [],
    generate: () => {
      const area = pick(UK_AREAS);
      const letters = "ABDEFGHJLNPQRSTUVWXYZ";
      const dist = randomInt(1, 20);
      const subdist = randomInt(0, 1) === 1 ? randomString(1, "ABCDEFGHJKMNPRSTUVWXY") : "";
      const sector = randomInt(0, 9);
      const unit = randomString(2, letters);
      return `${area}${dist}${subdist} ${sector}${unit}`;
    },
  },
  {
    slug: "canadian-postal",
    name: "Canadian Postal Code Generator",
    category: "identity",
    short: "Canadian postal codes.",
    description: "Generate Canadian postal codes in the standard A9A 9A9 format.",
    keywords: ["postal code", "canada", "canadian"],
    fields: [],
    generate: () => {
      const fsa = randomString(1, CA_FSA_CHARS) + randomInt(0, 9) + randomString(1, CA_FSA_CHARS);
      const ldu = randomInt(0, 9) + randomString(1, CA_FSA_CHARS) + randomInt(0, 9);
      return `${fsa} ${ldu}`;
    },
  },
  {
    slug: "vat-number",
    name: "VAT Number Generator",
    category: "identity",
    short: "EU VAT numbers.",
    description: "Generate EU-format VAT registration numbers for various member states. For testing only.",
    keywords: ["vat", "eu", "tax", "registration"],
    fields: [
      { key: "country", label: "Country", type: "select", default: "DE", options: [
        { value: "DE", label: "Germany (DE)" }, { value: "GB", label: "United Kingdom (GB)" },
        { value: "FR", label: "France (FR)" }, { value: "IT", label: "Italy (IT)" },
        { value: "ES", label: "Spain (ES)" }, { value: "NL", label: "Netherlands (NL)" },
      ]},
    ],
    generate: (o) => {
      const country = String(o.country);
      const gen: Record<string, () => string> = {
        DE: () => `DE${digits(9)}`,
        GB: () => `GB${digits(9)}`,
        FR: () => `FR${randomString(2, "ABCDEFGHJK0123456789")}${digits(9)}`,
        IT: () => `IT${digits(11)}`,
        ES: () => `ES${randomString(1, "ABCDEFGHJNPQRSUVW")}${digits(7)}${randomString(1, "ABCDEFGHJNPQRSUVW")}`,
        NL: () => `NL${digits(9)}B${digits(2)}`,
      };
      return (gen[country] ?? gen.DE)();
    },
  },
  {
    slug: "product-sku",
    name: "Product SKU Generator",
    category: "identity",
    short: "E-commerce SKU codes.",
    description: "Generate realistic product SKU codes for e-commerce and inventory system testing.",
    keywords: ["sku", "product", "inventory", "ecommerce"],
    fields: [],
    generate: () => {
      const cat = pick(["ELEC", "CLTH", "FOOD", "BOOK", "TOYS", "SPRT", "HOME", "HLTH"]);
      const id  = randomString(4, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ");
      const color = pick(["BLK", "WHT", "RED", "BLU", "GRN", "YLW"]);
      const size  = pick(["XS", "SM", "MD", "LG", "XL", "2XL", "001", "002"]);
      return `${cat}-${id}-${color}-${size}`;
    },
  },
  {
    slug: "order-id",
    name: "Order ID Generator",
    category: "identity",
    short: "E-commerce order IDs.",
    description: "Generate order IDs in formats used by common e-commerce platforms.",
    keywords: ["order", "order id", "invoice", "ecommerce"],
    fields: [
      { key: "style", label: "Style", type: "select", default: "standard", options: [
        { value: "standard",  label: "Standard (ORD-YYYY-XXXXX)" },
        { value: "shopify",   label: "Shopify (#NNNN)" },
        { value: "amazon",    label: "Amazon (NNN-NNNNNNN-NNNNNNN)" },
      ]},
    ],
    generate: (o) => {
      const yr = new Date().getFullYear();
      if (o.style === "shopify") return `#${randomInt(1000, 9999)}`;
      if (o.style === "amazon")  return `${digits(3)}-${digits(7)}-${digits(7)}`;
      return `ORD-${yr}-${randomString(6, "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")}`;
    },
  },
  {
    slug: "tracking-number",
    name: "Shipping Tracking Generator",
    category: "identity",
    short: "Carrier tracking numbers.",
    description: "Generate shipping tracking numbers in FedEx, UPS, USPS and DHL formats.",
    keywords: ["tracking", "shipping", "fedex", "ups", "usps", "dhl"],
    fields: [
      { key: "carrier", label: "Carrier", type: "select", default: "fedex", options: [
        { value: "fedex", label: "FedEx (12 digits)" },
        { value: "ups",   label: "UPS (1Z…)" },
        { value: "usps",  label: "USPS (22 digits)" },
        { value: "dhl",   label: "DHL (10 digits)" },
      ]},
    ],
    generate: (o) => {
      if (o.carrier === "ups")  return `1Z${randomString(6, "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")}${digits(10)}`;
      if (o.carrier === "usps") return digits(22);
      if (o.carrier === "dhl")  return digits(10);
      return digits(12); // fedex
    },
  },

  // ===== ADDRESS & NETWORK (extra) =====
  {
    slug: "swift-bic",
    name: "SWIFT / BIC Code Generator",
    category: "address",
    short: "Bank SWIFT/BIC codes.",
    description: "Generate SWIFT/BIC codes in standard format (BANKCCLLBBB). For testing payment systems only.",
    keywords: ["swift", "bic", "bank", "transfer", "international"],
    fields: [],
    generate: () => {
      const bank = pick(SWIFT_BANK_WORDS);
      const cc   = pick(SWIFT_COUNTRIES);
      const loc  = randomString(2, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ");
      return `${bank}${cc}${loc}XXX`;
    },
  },
  {
    slug: "aba-routing",
    name: "ABA Routing Number Generator",
    category: "address",
    short: "US bank routing numbers.",
    description: "Generate ABA routing numbers with a valid mod-10 check digit. For testing US banking integrations only.",
    keywords: ["aba", "routing", "bank", "us", "ach"],
    fields: [],
    generate: () => {
      const FRB = ["01","02","03","04","05","06","07","08","09","10","11","12"];
      const prefix = pick(FRB);
      const d = [Number(prefix[0]), Number(prefix[1])];
      for (let i = 2; i < 8; i++) d.push(randomInt(0, 9));
      const sum = 3*(d[0]+d[3]+d[6]) + 7*(d[1]+d[4]+d[7]) + (d[2]+d[5]);
      d.push((10 - (sum % 10)) % 10);
      return d.join("");
    },
  },
  {
    slug: "crypto-tx",
    name: "Crypto Transaction Hash Generator",
    category: "address",
    short: "Blockchain TX hashes.",
    description: "Generate Ethereum or Bitcoin-style transaction hashes for blockchain app testing.",
    keywords: ["transaction", "hash", "blockchain", "ethereum", "bitcoin", "tx"],
    fields: [
      { key: "chain", label: "Chain", type: "select", default: "eth", options: [
        { value: "eth", label: "Ethereum (0x + 64 hex)" },
        { value: "btc", label: "Bitcoin (64 hex)" },
        { value: "sol", label: "Solana (base58-style)" },
      ]},
    ],
    generate: (o) => {
      if (o.chain === "btc") return randomHex(32);
      if (o.chain === "sol") return randomString(88, "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz");
      return "0x" + randomHex(32);
    },
  },
  {
    slug: "dns-record",
    name: "DNS Record Generator",
    category: "address",
    short: "DNS records (A, AAAA, CNAME, MX, TXT).",
    description: "Generate realistic DNS zone file records across all common record types.",
    keywords: ["dns", "domain", "record", "zone", "nameserver"],
    fields: [
      { key: "type", label: "Record type", type: "select", default: "random", options: [
        { value: "random", label: "Random" }, { value: "A", label: "A (IPv4)" },
        { value: "AAAA", label: "AAAA (IPv6)" }, { value: "CNAME", label: "CNAME" },
        { value: "MX", label: "MX" }, { value: "TXT", label: "TXT" }, { value: "NS", label: "NS" },
      ]},
    ],
    generate: (o) => {
      const domain = `${pick(ADJECTIVES)}${pick(NOUNS)}.com`;
      const ttl = pick([300, 600, 1800, 3600, 86400]);
      const records: Record<string, () => string> = {
        A:     () => `${domain}.  ${ttl}  IN  A      ${[1,2,3,4].map(() => randomInt(1,254)).join(".")}`,
        AAAA:  () => `${domain}.  ${ttl}  IN  AAAA   ${Array.from({length:8},()=>randomHex(2)).join(":")}`,
        CNAME: () => `${pick(["www","api","mail","cdn"])}.${domain}.  ${ttl}  IN  CNAME  ${domain}.`,
        MX:    () => `${domain}.  ${ttl}  IN  MX     ${randomInt(5,50)} mail.${domain}.`,
        TXT:   () => `${domain}.  ${ttl}  IN  TXT    "v=spf1 include:${domain} ~all"`,
        NS:    () => `${domain}.  ${ttl}  IN  NS     ns${randomInt(1,4)}.${domain}.`,
      };
      const type = String(o.type) === "random" ? pick(Object.keys(records)) : String(o.type);
      return (records[type] ?? records.A)();
    },
  },

  // ===== DATETIME (extra) =====
  {
    slug: "timezone",
    name: "Timezone Generator",
    category: "datetime",
    short: "Random timezones with offset.",
    description: "Pick a random timezone from around the world with its current UTC offset.",
    keywords: ["timezone", "utc", "gmt", "time zone"],
    fields: [],
    generate: () => {
      const tz = pick(TIMEZONES);
      const now = new Date();
      const local = now.toLocaleString("en-US", { timeZone: tz, timeZoneName: "longOffset" });
      const offset = local.split(" ").pop() ?? "";
      return `${tz}  (${offset})`;
    },
  },

  // ===== VISUAL TOOLS =====
  {
    slug: "qr-code",
    name: "QR Code Generator",
    category: "visual",
    short: "QR codes as downloadable PNG.",
    description: "Generate QR codes for URLs, text, contact info and more. Rendered locally in your browser — nothing is sent to a server.",
    keywords: ["qr", "qr code", "barcode", "scan"],
    fields: [
      { key: "text", label: "Content to encode", type: "text", default: "https://dataforge.example" },
      { key: "size", label: "Size", type: "select", default: "256", options: [
        { value: "128", label: "Small (128px)" },
        { value: "256", label: "Medium (256px)" },
        { value: "512", label: "Large (512px)" },
      ]},
    ],
    generate: async (o) => {
      const QRCode = (await import("qrcode")).default;
      return await (QRCode as { toDataURL: (t: string, opts: Record<string, unknown>) => Promise<string> }).toDataURL(
        String(o.text) || "https://dataforge.example",
        { width: Number(o.size) || 256, margin: 2, color: { dark: "#0f172a", light: "#ffffff" } }
      );
    },
  },
  {
    slug: "barcode",
    name: "Barcode Generator",
    category: "visual",
    short: "Code128, EAN-13 & UPC-A barcodes.",
    description: "Generate barcodes in Code128, EAN-13 and UPC-A formats rendered as SVG. Rendered locally in your browser.",
    keywords: ["barcode", "code128", "ean", "upc", "scan"],
    fields: [
      { key: "data", label: "Data", type: "text", default: "12345678" },
      { key: "format", label: "Format", type: "select", default: "CODE128", options: [
        { value: "CODE128", label: "Code 128 (any text)" },
        { value: "EAN13",   label: "EAN-13 (12 digits)" },
        { value: "UPC",     label: "UPC-A (11 digits)" },
        { value: "CODE39",  label: "Code 39" },
      ]},
    ],
    generate: async (o) => {
      const JsBarcode = (await import("jsbarcode")).default;
      const ns  = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(ns, "svg");
      let data = String(o.data || "12345678");
      // Pad/trim to required length for EAN-13 and UPC
      if (o.format === "EAN13" && !/^\d{12,13}$/.test(data)) data = data.replace(/\D/g,"").padEnd(12,"0").slice(0,12);
      if (o.format === "UPC"   && !/^\d{11,12}$/.test(data)) data = data.replace(/\D/g,"").padEnd(11,"0").slice(0,11);
      JsBarcode(svg, data, {
        format: String(o.format),
        width: 2, height: 80, displayValue: true, fontSize: 14,
        background: "#ffffff", lineColor: "#0f172a",
      });
      return svg.outerHTML;
    },
  },

  // ===== REFERENCE DATA =====
  {
    slug: "country",
    name: "Country Generator",
    category: "reference",
    short: "Real country data.",
    description: "Pick a random real country with its ISO code, capital, currency and calling code.",
    keywords: ["country", "iso", "nation"],
    fields: [],
    generate: () => {
      const c = pick(COUNTRIES);
      return `${c.name} (${c.code}) · capital ${c.capital} · ${c.currency} · ${c.dial}`;
    },
  },
  {
    slug: "currency",
    name: "Currency Generator",
    category: "reference",
    short: "Real ISO 4217 currencies.",
    description: "Pick a random real currency with its ISO 4217 code and symbol.",
    keywords: ["currency", "iso 4217", "money"],
    fields: [],
    generate: () => {
      const c = pick(CURRENCIES);
      return `${c.code} — ${c.name} (${c.symbol})`;
    },
  },

  // ===== NUMBERS (extended) =====
  {
    slug: "gps-coordinates",
    name: "GPS Coordinates Generator",
    category: "numbers",
    short: "Random GPS lat/lng.",
    description: "Generate random GPS latitude and longitude in decimal degrees and DMS format.",
    keywords: ["gps", "latitude", "longitude", "coordinates", "geo"],
    fields: [
      { key: "land", label: "Land-only bias", type: "checkbox", default: true },
    ],
    generate: (o) => {
      const lat = randomFloat(-90, 90, 6);
      const lng = randomFloat(-180, 180, 6);
      const dms = (v: number, pos: string, neg: string) => {
        const abs = Math.abs(v);
        const d = Math.floor(abs);
        const m = Math.floor((abs - d) * 60);
        const s = ((abs - d) * 60 - m) * 60;
        return `${d}°${m}'${s.toFixed(2)}"${v >= 0 ? pos : neg}`;
      };
      const latD = o.land ? randomFloat(-60, 75, 6) : lat;
      const lngD = lng;
      return `${latD.toFixed(6)}, ${lngD.toFixed(6)}  (${dms(latD, "N", "S")} ${dms(lngD, "E", "W")})`;
    },
  },
  {
    slug: "temperature",
    name: "Temperature Generator",
    category: "numbers",
    short: "Random temperatures in C, F and K.",
    description: "Generate a random temperature in Celsius with automatic conversion to Fahrenheit and Kelvin.",
    keywords: ["temperature", "celsius", "fahrenheit", "kelvin", "weather"],
    fields: [
      num("min", "Min °C", -20, -273, 5000),
      num("max", "Max °C", 45, -273, 5000),
    ],
    generate: (o) => {
      const c = randomFloat(Number(o.min), Number(o.max), 1);
      const f = (c * 9) / 5 + 32;
      const k = c + 273.15;
      return `${c.toFixed(1)}°C  =  ${f.toFixed(1)}°F  =  ${k.toFixed(2)}K`;
    },
  },
  {
    slug: "number-sequence",
    name: "Number Sequence Generator",
    category: "numbers",
    short: "Arithmetic or geometric sequences.",
    description: "Generate an arithmetic (a, a+d, a+2d, …) or geometric (a, ar, ar², …) sequence.",
    keywords: ["sequence", "arithmetic", "geometric", "series", "math"],
    fields: [
      num("start", "Start", 1, -1000, 1000),
      num("step", "Step / ratio (×10 for geo)", 3, -100, 100),
      num("count", "Terms", 8, 2, 20),
      { key: "type", label: "Type", type: "select", default: "arithmetic",
        options: [{ value: "arithmetic", label: "Arithmetic" }, { value: "geometric", label: "Geometric" }] },
    ],
    generate: (o) => {
      const n = Number(o.count);
      const terms: number[] = [Number(o.start)];
      const step = Number(o.step);
      for (let i = 1; i < n; i++) {
        if (o.type === "geometric") terms.push(terms[i - 1] * (step / 10));
        else terms.push(terms[i - 1] + step);
      }
      return terms.map(t => Number.isInteger(t) ? t : t.toFixed(2)).join(", ");
    },
  },
  {
    slug: "fibonacci",
    name: "Fibonacci Generator",
    category: "numbers",
    short: "Fibonacci numbers up to Nth term.",
    description: "Generate the Fibonacci sequence up to the Nth term and display the Nth value.",
    keywords: ["fibonacci", "sequence", "math", "golden ratio"],
    fields: [num("n", "Number of terms", 10, 2, 40)],
    generate: (o) => {
      const n = Math.min(Number(o.n), 40);
      const seq = [0n, 1n];
      for (let i = 2; i < n; i++) seq.push(seq[i - 1] + seq[i - 2]);
      const shown = seq.slice(0, n);
      return `${shown.join(", ")}  (F${n} = ${shown[shown.length - 1]})`;
    },
  },
  {
    slug: "bmi",
    name: "BMI Calculator Generator",
    category: "numbers",
    short: "Random height / weight with BMI.",
    description: "Generate a random person's height and weight, then compute their BMI and category.",
    keywords: ["bmi", "body mass index", "health", "weight", "height"],
    fields: [],
    generate: () => {
      const heightCm = randomInt(150, 200);
      const weightKg = randomInt(45, 120);
      const bmi = weightKg / Math.pow(heightCm / 100, 2);
      const cat = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
      const heightFt = Math.floor(heightCm / 30.48);
      const heightIn = Math.round((heightCm / 2.54) % 12);
      return `Height: ${heightCm}cm (${heightFt}'${heightIn}")  ·  Weight: ${weightKg}kg (${Math.round(weightKg * 2.205)}lb)  ·  BMI: ${bmi.toFixed(1)} (${cat})`;
    },
  },
  {
    slug: "statistics-sample",
    name: "Statistics Sample Generator",
    category: "numbers",
    short: "Random dataset with descriptive stats.",
    description: "Generate a random numeric dataset and compute min, max, mean, median and standard deviation.",
    keywords: ["statistics", "mean", "median", "standard deviation", "sample"],
    fields: [num("count", "Sample size", 8, 3, 30), num("min", "Min value", 0, -1e6, 1e6), num("max", "Max value", 100, -1e6, 1e6)],
    generate: (o) => {
      const data = Array.from({ length: Number(o.count) }, () => randomInt(Number(o.min), Number(o.max)));
      const sorted = [...data].sort((a, b) => a - b);
      const mean = data.reduce((a, b) => a + b, 0) / data.length;
      const mid = Math.floor(sorted.length / 2);
      const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
      const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
      const std = Math.sqrt(variance);
      return `Data: [${data.join(", ")}]\nMin: ${sorted[0]}  Max: ${sorted[sorted.length - 1]}  Mean: ${mean.toFixed(2)}  Median: ${median}  StdDev: ${std.toFixed(2)}`;
    },
  },
  {
    slug: "base-converter",
    name: "Base Converter",
    category: "numbers",
    short: "Number in bases 2 through 36.",
    description: "Generate a random integer and display it in any base from 2 (binary) to 36.",
    keywords: ["base", "radix", "binary", "hexadecimal", "octal", "conversion"],
    fields: [
      num("min", "Min", 0, 0, 1e12),
      num("max", "Max", 65535, 0, 1e12),
      num("base", "Target base", 16, 2, 36),
    ],
    generate: (o) => {
      const n = randomInt(Number(o.min), Number(o.max));
      const base = Math.min(36, Math.max(2, Number(o.base)));
      return `${n} (base 10)  →  ${n.toString(base).toUpperCase()} (base ${base})`;
    },
  },
  {
    slug: "geographic-distance",
    name: "Geographic Distance Generator",
    category: "numbers",
    short: "Haversine distance between two random points.",
    description: "Generate two random GPS points and compute the great-circle distance using the Haversine formula.",
    keywords: ["distance", "haversine", "gps", "geo", "kilometers", "miles"],
    fields: [],
    generate: () => {
      const rand = () => ({ lat: randomFloat(-60, 75, 4), lng: randomFloat(-180, 180, 4) });
      const a = rand(), b = rand();
      const R = 6371;
      const toR = (d: number) => (d * Math.PI) / 180;
      const dLat = toR(b.lat - a.lat), dLng = toR(b.lng - a.lng);
      const h = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLng / 2) ** 2;
      const km = R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
      return `A (${a.lat}, ${a.lng})  →  B (${b.lat}, ${b.lng})\nDistance: ${km.toFixed(1)} km  (${(km * 0.621371).toFixed(1)} mi)`;
    },
  },

  // ===== DEVELOPER (extended) =====
  {
    slug: "regex-pattern",
    name: "Regex Pattern Generator",
    category: "developer",
    short: "Common regex patterns with examples.",
    description: "Pick a common, production-ready regular expression pattern with name and example match string.",
    keywords: ["regex", "regular expression", "pattern", "validation"],
    fields: [],
    generate: () => {
      const [name, pattern, example] = pick(REGEX_PATTERNS);
      return `${name}\n/${pattern}/\nExample: ${example}`;
    },
  },
  {
    slug: "oauth-token",
    name: "OAuth Token Generator",
    category: "developer",
    short: "OAuth 2.0 Bearer token stub.",
    description: "Generate a sample OAuth 2.0 Bearer access token with expiry metadata. For testing authorization flows.",
    keywords: ["oauth", "bearer", "token", "auth", "authorization"],
    fields: [{ key: "type", label: "Token type", type: "select", default: "bearer",
      options: [{ value: "bearer", label: "Bearer" }, { value: "mac", label: "MAC" }] }],
    generate: (o) => {
      const token = randomString(40, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_");
      const expiry = Math.floor(Date.now() / 1000) + 3600;
      return `Authorization: ${String(o.type) === "mac" ? "MAC" : "Bearer"} ${token}\ntoken_type: ${o.type}\nexpires_in: 3600\nexpires_at: ${new Date(expiry * 1000).toISOString()}`;
    },
  },
  {
    slug: "webhook-payload",
    name: "Webhook Payload Generator",
    category: "developer",
    short: "Realistic webhook JSON payloads.",
    description: "Generate a realistic webhook event payload for common services like Stripe, GitHub or Shopify.",
    keywords: ["webhook", "event", "payload", "json", "integration"],
    fields: [],
    generate: () => {
      const [service, event] = pick(WEBHOOK_EVENTS);
      const payload = {
        id: `evt_${randomString(20, "abcdefghijklmnopqrstuvwxyz0123456789")}`,
        type: event,
        created: Math.floor(Date.now() / 1000),
        livemode: false,
        data: {
          object: {
            id: `${service.slice(0,2)}_${randomString(14, "abcdefghijklmnopqrstuvwxyz0123456789")}`,
            amount: randomInt(100, 99900),
            currency: "usd",
            status: "succeeded",
          },
        },
      };
      return JSON.stringify(payload, null, 2);
    },
  },
  {
    slug: "graphql-query",
    name: "GraphQL Query Generator",
    category: "developer",
    short: "GraphQL query / mutation stubs.",
    description: "Generate a realistic GraphQL query or mutation stub for common entity types.",
    keywords: ["graphql", "query", "mutation", "api", "schema"],
    fields: [
      { key: "op", label: "Operation", type: "select", default: "query",
        options: [{ value: "query", label: "Query" }, { value: "mutation", label: "Mutation" }] },
    ],
    generate: (o) => {
      const entity = pick(GRAPHQL_ENTITIES);
      const lower = entity.charAt(0).toLowerCase() + entity.slice(1);
      if (o.op === "mutation") {
        return `mutation Create${entity}($input: Create${entity}Input!) {\n  create${entity}(input: $input) {\n    id\n    createdAt\n    updatedAt\n  }\n}`;
      }
      return `query Get${entity}($id: ID!) {\n  ${lower}(id: $id) {\n    id\n    name\n    status\n    createdAt\n  }\n}\n\n# Variables\n{ "id": "${crypto.randomUUID()}" }`;
    },
  },
  {
    slug: "sql-select",
    name: "SQL SELECT Generator",
    category: "developer",
    short: "SQL SELECT query with WHERE clause.",
    description: "Generate a realistic SQL SELECT query with conditions, ordering and a limit clause.",
    keywords: ["sql", "select", "query", "database"],
    fields: [
      { key: "table", label: "Table", type: "select", default: "users",
        options: SQL_TABLES.map(t => ({ value: t.table, label: t.table })) },
    ],
    generate: (o) => {
      const t = SQL_TABLES.find(x => x.table === o.table) ?? SQL_TABLES[0];
      const cols = t.cols.slice(0, 4).join(", ");
      const limit = randomInt(10, 100);
      const orderCol = pick(t.cols);
      return `SELECT ${cols}\nFROM ${t.table}\nWHERE status = 'active'\n  AND created_at >= NOW() - INTERVAL '30 days'\nORDER BY ${orderCol} DESC\nLIMIT ${limit};`;
    },
  },
  {
    slug: "yaml-config",
    name: "YAML Config Generator",
    category: "developer",
    short: "Realistic YAML configuration block.",
    description: "Generate a realistic YAML configuration file snippet for a web application or microservice.",
    keywords: ["yaml", "config", "configuration", "devops"],
    fields: [],
    generate: () => {
      const port = randomInt(3000, 9999);
      const service = pick(NOUNS);
      const env = pick(["development", "staging", "production"]);
      return `service:\n  name: ${service}-service\n  version: "1.${randomInt(0,9)}.${randomInt(0,20)}"\n  port: ${port}\n  environment: ${env}\n\ndatabase:\n  host: localhost\n  port: 5432\n  name: ${service}_db\n  pool_size: ${randomInt(5, 20)}\n\nlogging:\n  level: ${pick(["debug", "info", "warn"])}\n  format: json\n\ncache:\n  driver: redis\n  ttl: ${randomInt(60, 3600)}`;
    },
  },
  {
    slug: "xml-snippet",
    name: "XML Snippet Generator",
    category: "developer",
    short: "Random XML element with attributes.",
    description: "Generate a well-formed XML element snippet with realistic attributes and child nodes.",
    keywords: ["xml", "markup", "element", "soap"],
    fields: [],
    generate: () => {
      const entity = pick(GRAPHQL_ENTITIES).toLowerCase();
      const id = randomInt(1000, 9999);
      const name = `${pick(FIRST_NAMES_M)} ${pick(LAST_NAMES2)}`;
      const ts = new Date().toISOString();
      return `<?xml version="1.0" encoding="UTF-8"?>\n<${entity} id="${id}" xmlns="https://schema.example.com/v1">\n  <name>${name}</name>\n  <status>active</status>\n  <createdAt>${ts}</createdAt>\n  <metadata>\n    <key>region</key>\n    <value>${pick(["us-east", "eu-west", "ap-south"])}</value>\n  </metadata>\n</${entity}>`;
    },
  },
  {
    slug: "openapi-schema",
    name: "OpenAPI Schema Generator",
    category: "developer",
    short: "OpenAPI 3.0 JSON schema object.",
    description: "Generate an OpenAPI 3.0-compatible JSON Schema object for common API resource types.",
    keywords: ["openapi", "swagger", "json schema", "api"],
    fields: [],
    generate: () => {
      const entity = pick(GRAPHQL_ENTITIES);
      const schema = {
        type: "object",
        required: ["id", "name", "createdAt"],
        properties: {
          id: { type: "string", format: "uuid", example: crypto.randomUUID() },
          name: { type: "string", minLength: 1, maxLength: 255 },
          status: { type: "string", enum: ["active", "inactive", "pending"] },
          createdAt: { type: "string", format: "date-time" },
          metadata: { type: "object", additionalProperties: { type: "string" } },
        },
      };
      return `# OpenAPI schema for ${entity}\n${JSON.stringify(schema, null, 2)}`;
    },
  },

  // ===== WEB & DEV (extended) =====
  {
    slug: "api-endpoint",
    name: "REST API Endpoint Generator",
    category: "web",
    short: "RESTful API endpoint paths.",
    description: "Generate realistic REST API endpoint paths with method, path parameters and query strings.",
    keywords: ["api", "rest", "endpoint", "route", "http"],
    fields: [],
    generate: () => {
      const resource = pick(API_RESOURCES);
      const method = pick(HTTP_METHODS);
      const id = crypto.randomUUID();
      const version = `v${randomInt(1, 3)}`;
      const paths: Record<string, string> = {
        GET: `GET /api/${version}/${resource}/${id}`,
        POST: `POST /api/${version}/${resource}`,
        PUT: `PUT /api/${version}/${resource}/${id}`,
        PATCH: `PATCH /api/${version}/${resource}/${id}`,
        DELETE: `DELETE /api/${version}/${resource}/${id}`,
      };
      return `${paths[method]}\nBase URL: https://api.${pick(ADJECTIVES)}${pick(NOUNS)}.${pick(["com","io","dev"])}`;
    },
  },
  {
    slug: "http-request",
    name: "HTTP Request Generator",
    category: "web",
    short: "Full HTTP request block.",
    description: "Generate a complete HTTP request block including method, URL, headers and a JSON body.",
    keywords: ["http", "request", "curl", "api", "headers"],
    fields: [],
    generate: () => {
      const resource = pick(API_RESOURCES);
      const method = pick(["POST", "PUT", "PATCH"]);
      const host = `api.${pick(ADJECTIVES)}${pick(NOUNS)}.io`;
      const traceId = crypto.randomUUID();
      return `${method} /v1/${resource} HTTP/1.1\nHost: ${host}\nContent-Type: application/json\nAuthorization: Bearer ${randomString(32, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")}\nX-Request-ID: ${traceId}\n\n{\n  "name": "${pick(FIRST_NAMES_M)} ${pick(LAST_NAMES2)}",\n  "email": "${pick(NOUNS)}${randomInt(1,99)}@example.com",\n  "active": true\n}`;
    },
  },
  {
    slug: "changelog-entry",
    name: "Changelog Entry Generator",
    category: "web",
    short: "SemVer changelog entries.",
    description: "Generate a realistic Keep a Changelog-format entry for a software release.",
    keywords: ["changelog", "release notes", "semver", "version"],
    fields: [],
    generate: () => {
      const major = randomInt(1, 5);
      const minor = randomInt(0, 20);
      const patch = randomInt(0, 15);
      const date = new Date(Date.now() - randomInt(0, 90) * 86400000).toISOString().slice(0, 10);
      const types = ["Added","Changed","Fixed","Deprecated","Removed","Security"] as const;
      const entries = Array.from({ length: randomInt(2, 5) }, () => {
        const type = pick([...types]);
        return `### ${type}\n- ${pick(ADJECTIVES).charAt(0).toUpperCase() + pick(ADJECTIVES).slice(1)} ${pick(NOUNS)} ${pick(["feature", "module", "component", "endpoint", "handler"])} for improved performance`;
      });
      return `## [${major}.${minor}.${patch}] - ${date}\n\n${entries.join("\n\n")}`;
    },
  },
  {
    slug: "feature-flag",
    name: "Feature Flag Generator",
    category: "web",
    short: "Feature flag configuration JSON.",
    description: "Generate a realistic feature flag definition with rollout percentage, targeting rules and metadata.",
    keywords: ["feature flag", "toggle", "rollout", "a/b test", "launchdarkly"],
    fields: [],
    generate: () => {
      const name = `${pick(ADJECTIVES)}_${pick(NOUNS)}_${pick(["v2", "beta", "new", "improved", "redesign"])}`;
      const flag = {
        key: name,
        name: name.replace(/_/g, " ").replace(/^\w/, c => c.toUpperCase()),
        enabled: randomInt(0, 1) === 1,
        rolloutPercentage: randomInt(0, 100),
        targeting: {
          rules: [{ attribute: "country", operator: "in", values: ["US", "CA", "GB"] }],
        },
        metadata: {
          createdAt: new Date().toISOString(),
          owner: `${pick(FIRST_NAMES_M).toLowerCase()}@example.com`,
          jiraTicket: `ENG-${randomInt(1000, 9999)}`,
        },
      };
      return JSON.stringify(flag, null, 2);
    },
  },
  {
    slug: "kubernetes-label",
    name: "Kubernetes Label Generator",
    category: "web",
    short: "K8s metadata labels and annotations.",
    description: "Generate realistic Kubernetes-style resource labels and annotations for deployment manifests.",
    keywords: ["kubernetes", "k8s", "labels", "devops", "container"],
    fields: [],
    generate: () => {
      const app = `${pick(ADJECTIVES)}-${pick(NOUNS)}`;
      const version = `${randomInt(1,5)}.${randomInt(0,20)}.${randomInt(0,10)}`;
      const ns = pick(K8S_NAMESPACES);
      return `metadata:\n  namespace: ${ns}\n  labels:\n    app: ${app}\n    version: "${version}"\n    env: ${pick(["production","staging","development"])}\n    team: ${pick(DEPARTMENTS).toLowerCase().replace(/\s/g, "-")}\n    managed-by: helm\n  annotations:\n    deploy.time: "${new Date().toISOString()}"\n    commit.sha: "${randomHex(20).slice(0, 7)}"\n    jira.ticket: "ENG-${randomInt(1000, 9999)}"`;
    },
  },
  {
    slug: "log-entry",
    name: "Log Entry Generator",
    category: "web",
    short: "Structured JSON log line.",
    description: "Generate a realistic structured (JSON) log entry with level, timestamp, message and context.",
    keywords: ["log", "logging", "json", "observability", "structured"],
    fields: [
      { key: "level", label: "Level", type: "select", default: "INFO",
        options: [...LOG_LEVELS].map(v => ({ value: v, label: v })) },
    ],
    generate: (o) => {
      const service = `${pick(NOUNS)}-service`;
      const entry = {
        timestamp: new Date().toISOString(),
        level: String(o.level),
        service,
        traceId: crypto.randomUUID(),
        spanId: randomHex(4),
        message: `${String(o.level) === "ERROR" ? "Failed to process" : "Processed"} ${pick(API_RESOURCES)} request`,
        duration_ms: randomInt(5, 1200),
        status: String(o.level) === "ERROR" ? randomInt(400, 503) : 200,
        host: `${service}-${randomInt(1, 9)}.${pick(K8S_NAMESPACES)}.svc.cluster.local`,
      };
      return JSON.stringify(entry);
    },
  },
  {
    slug: "npm-package",
    name: "NPM Package Generator",
    category: "web",
    short: "package.json snippet.",
    description: "Generate a realistic NPM package.json manifest with name, version, scripts, and dependencies.",
    keywords: ["npm", "package.json", "node", "dependencies", "javascript"],
    fields: [],
    generate: () => {
      const name = `@${pick(NOUNS).toLowerCase()}/${pick(ADJECTIVES)}-${pick(NOUNS)}`;
      const pkg = {
        name,
        version: `${randomInt(1,5)}.${randomInt(0,20)}.${randomInt(0,10)}`,
        description: `${pick(ADJECTIVES).charAt(0).toUpperCase() + pick(ADJECTIVES).slice(1)} ${pick(NOUNS)} utility library`,
        main: "dist/index.js",
        types: "dist/index.d.ts",
        scripts: { build: "tsc", test: "jest", lint: "eslint src/" },
        dependencies: {
          "zod": `^${randomInt(3,4)}.${randomInt(0,5)}.0`,
          "axios": `^${randomInt(1,2)}.${randomInt(0,9)}.0`,
        },
        devDependencies: {
          "typescript": `^${randomInt(4,5)}.${randomInt(0,9)}.0`,
          "jest": `^${randomInt(28,30)}.${randomInt(0,5)}.0`,
        },
        license: pick(["MIT", "Apache-2.0", "ISC", "BSD-3-Clause"]),
      };
      return JSON.stringify(pkg, null, 2);
    },
  },
  {
    slug: "error-code",
    name: "Error Code Generator",
    category: "web",
    short: "Application error codes with HTTP status.",
    description: "Generate a structured application error response with error code, HTTP status and message.",
    keywords: ["error", "exception", "http", "status code", "api error"],
    fields: [],
    generate: () => {
      const [code, status, message] = pick(ERROR_CODES);
      const err = {
        error: {
          code,
          status,
          message,
          requestId: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          docs: `https://docs.example.com/errors/${code.toLowerCase()}`,
        },
      };
      return JSON.stringify(err, null, 2);
    },
  },

  // ===== IDENTITY (extended) =====
  {
    slug: "passport-number",
    name: "Passport Number Generator",
    category: "identity",
    short: "Passport-format numbers.",
    description: "Generate passport-style document numbers in formats used by major countries. For testing only.",
    keywords: ["passport", "travel document", "identity"],
    fields: [
      { key: "country", label: "Country", type: "select", default: "US",
        options: [
          { value: "US", label: "United States" }, { value: "GB", label: "United Kingdom" },
          { value: "DE", label: "Germany" }, { value: "FR", label: "France" }, { value: "JP", label: "Japan" },
        ] },
    ],
    generate: (o) => {
      const gen: Record<string, () => string> = {
        US: () => randomString(1, "ABCDEFGHJKLMNPRSTUVWXYZ") + digits(8),
        GB: () => randomString(2, "ABCDEFGHJKLMNPRSTUVWXYZ") + digits(7),
        DE: () => randomString(1, "CDEFGHJKLMNPRSTVWXYZ") + digits(8),
        FR: () => digits(2) + randomString(2, "ABCDEFGHJKLMNPRSTUVWXYZ") + digits(5),
        JP: () => randomString(2, "ABCDEFGHJKLMNPRSTUVWXYZ") + digits(7),
      };
      return (gen[String(o.country)] ?? gen.US)();
    },
  },
  {
    slug: "drivers-license",
    name: "Driver's License Generator",
    category: "identity",
    short: "US driver's license formats.",
    description: "Generate US driver's license numbers in state-specific formats. For software testing only.",
    keywords: ["driver license", "dmv", "id", "license number"],
    fields: [
      { key: "state", label: "State", type: "select", default: "CA",
        options: [
          { value: "CA", label: "California" }, { value: "NY", label: "New York" },
          { value: "TX", label: "Texas" }, { value: "FL", label: "Florida" }, { value: "WA", label: "Washington" },
        ] },
    ],
    generate: (o) => {
      const gen: Record<string, () => string> = {
        CA: () => randomString(1, "ABCDEFGHJKLMNPRSTUVWXYZ") + digits(7),
        NY: () => digits(9),
        TX: () => digits(8),
        FL: () => randomString(1, "ABCDEFGHJKLMNPRSTUVWXYZ") + digits(12),
        WA: () => (pick(LAST_NAMES2).toUpperCase() + "**").slice(0, 7) + randomString(5, "ABCDEFGHJKLMNPRSTUVWXYZ0123456789") + digits(3),
      };
      return `${String(o.state)}-${(gen[String(o.state)] ?? gen.CA)()}`;
    },
  },
  {
    slug: "employee-id",
    name: "Employee ID Generator",
    category: "identity",
    short: "Corporate employee ID numbers.",
    description: "Generate corporate employee IDs with department prefix and hire year for HR system testing.",
    keywords: ["employee", "staff", "id", "hr"],
    fields: [],
    generate: () => {
      const dept = pick(DEPARTMENTS);
      const prefix = dept.toUpperCase().replace(/\s/g, "").slice(0, 3);
      const year = randomInt(2015, 2025);
      const seq = String(randomInt(1000, 9999));
      return `${prefix}-${year}-${seq}  (${dept})`;
    },
  },
  {
    slug: "nhs-number",
    name: "NHS Number Generator",
    category: "identity",
    short: "Valid UK NHS numbers.",
    description: "Generate UK NHS numbers with a valid mod-11 check digit. For testing NHS system integrations only.",
    keywords: ["nhs", "uk", "health", "patient id"],
    fields: [],
    generate: () => {
      for (let attempts = 0; attempts < 1000; attempts++) {
        const d = Array.from({ length: 9 }, () => randomInt(0, 9));
        const weights = [10, 9, 8, 7, 6, 5, 4, 3, 2];
        const sum = d.reduce((acc, v, i) => acc + v * weights[i], 0);
        const rem = sum % 11;
        const check = 11 - rem;
        if (check < 10) {
          const full = [...d, check];
          return `${full.slice(0, 3).join("")} ${full.slice(3, 6).join("")} ${full.slice(6).join("")}`;
        }
      }
      return "Try again";
    },
  },
  {
    slug: "bank-account-uk",
    name: "UK Bank Account Generator",
    category: "identity",
    short: "UK account number + sort code.",
    description: "Generate a UK bank account number and sort code in standard format. For testing only.",
    keywords: ["bank account", "uk", "sort code", "bacs"],
    fields: [],
    generate: () => {
      const sortCode = `${digits(2)}-${digits(2)}-${digits(2)}`;
      const accountNum = digits(8);
      return `Sort code: ${sortCode}  ·  Account: ${accountNum}`;
    },
  },
  {
    slug: "sort-code",
    name: "UK Sort Code Generator",
    category: "identity",
    short: "British 6-digit bank sort codes.",
    description: "Generate British bank sort codes in XX-XX-XX format. Ranges match real registered ranges.",
    keywords: ["sort code", "uk", "bank", "routing"],
    fields: [],
    generate: () => {
      const ranges = [["01","09"],["10","19"],["20","29"],["30","39"],["40","49"],["50","59"],["60","69"],["70","77"],["80","89"],["90","99"]];
      const [lo, hi] = pick(ranges);
      return `${String(randomInt(parseInt(lo), parseInt(hi))).padStart(2,"0")}-${digits(2)}-${digits(2)}`;
    },
  },
  {
    slug: "social-handle",
    name: "Social Media Handle Generator",
    category: "identity",
    short: "Random @usernames.",
    description: "Generate social media-style @handles and profile names for testing.",
    keywords: ["username", "handle", "social media", "profile", "twitter"],
    fields: [
      { key: "platform", label: "Platform style", type: "select", default: "twitter",
        options: [
          { value: "twitter", label: "X / Twitter (@handle)" },
          { value: "instagram", label: "Instagram" },
          { value: "github", label: "GitHub" },
        ] },
    ],
    generate: (o) => {
      const adj = pick(ADJECTIVES);
      const noun = pick(NOUNS);
      const num = randomInt(0, 1) === 1 ? String(randomInt(1, 999)) : "";
      const handle = `${adj}${noun}${num}`;
      const prefix = o.platform === "github" ? "" : "@";
      return `${prefix}${handle}`;
    },
  },
  {
    slug: "loyalty-card",
    name: "Loyalty Card Generator",
    category: "identity",
    short: "Membership / loyalty card numbers.",
    description: "Generate loyalty program membership card numbers with brand prefix.",
    keywords: ["loyalty", "membership", "rewards", "card"],
    fields: [],
    generate: () => {
      const brand = pick(LOYALTY_BRANDS);
      const number = digits(4) + " " + digits(4) + " " + digits(4) + " " + digits(4);
      const tier = pick(["Silver", "Gold", "Platinum", "Diamond"]);
      return `${brand}\n${number}\n${tier} Member`;
    },
  },
  {
    slug: "ein-number",
    name: "EIN Generator",
    category: "identity",
    short: "US Employer Identification Numbers.",
    description: "Generate US Employer Identification Numbers (EIN) in the IRS XX-XXXXXXX format. For testing only.",
    keywords: ["ein", "tax id", "employer", "irs", "us tax"],
    fields: [],
    generate: () => {
      const prefixes = ["01","02","03","04","05","06","10","11","12","13","14","15","16","20","21","22","23","24","25","26","27","30","31","32","33","34","35","36","37","38","39","40","41","42","43","44","45","46","47","48","50","51","52","53","54","55","56","57","58","59","60","61","62","63","64","65","66","67","68","71","72","73","74","75","76","77","80","81","82","83","84","85","86","87","88","90","91","92","93","94","95","98","99"];
      return `${pick(prefixes)}-${digits(7)}`;
    },
  },
  {
    slug: "npi-number",
    name: "NPI Number Generator",
    category: "identity",
    short: "US National Provider Identifier.",
    description: "Generate US NPI (National Provider Identifier) 10-digit numbers with valid Luhn check digit.",
    keywords: ["npi", "provider", "healthcare", "cms", "us"],
    fields: [],
    generate: () => {
      const prefix = "80840"; // Luhn prefix for NPI
      let body = prefix;
      while (body.length < 9) body += randomInt(0, 9);
      const forLuhn = "80840" + body.slice(5) + "0";
      const check = luhnCheckDigit(forLuhn.slice(0, 9));
      return body + check;
    },
  },

  // ===== TEXT & CONTENT (extended) =====
  {
    slug: "book-title",
    name: "Book Title Generator",
    category: "text",
    short: "Fictional book titles.",
    description: "Generate creative fictional book titles for placeholder content and mockups.",
    keywords: ["book", "title", "fiction", "novel", "placeholder"],
    fields: [
      { key: "genre", label: "Genre", type: "select", default: "any",
        options: [{ value: "any", label: "Any" }, { value: "fantasy", label: "Fantasy" }, { value: "thriller", label: "Thriller" }] },
    ],
    generate: () => {
      const { article, adj, noun, prep, noun2 } = BOOK_TITLE_WORDS;
      const patterns = [
        () => `${pick(article)} ${pick(adj)} ${pick(noun)}`,
        () => `${pick(noun)} ${pick(prep)} ${pick(noun2)}`,
        () => `${pick(article)} ${pick(adj)} ${pick(noun)} ${pick(prep)} ${pick(noun2)}`,
        () => `${pick(adj)} ${pick(noun2)}`,
      ];
      return pick(patterns)();
    },
  },
  {
    slug: "movie-title",
    name: "Movie Title Generator",
    category: "text",
    short: "Fictional film titles.",
    description: "Generate fictional movie and film titles for placeholder content.",
    keywords: ["movie", "film", "title", "cinema"],
    fields: [],
    generate: () => {
      const genre = pick(MOVIE_GENRES);
      const patterns = [
        () => `${pick(ADJECTIVES).charAt(0).toUpperCase() + pick(ADJECTIVES).slice(1)} ${pick(NOUNS).charAt(0).toUpperCase() + pick(NOUNS).slice(1)}`,
        () => `The ${pick(BOOK_TITLE_WORDS.adj)} ${pick(BOOK_TITLE_WORDS.noun)}`,
        () => `${pick(FIRST_NAMES_M)}'s ${pick(BOOK_TITLE_WORDS.noun)}`,
        () => `${pick(BOOK_TITLE_WORDS.noun)} ${randomInt(2, 4)}`,
      ];
      return `${pick(patterns)()}  [${genre}]`;
    },
  },
  {
    slug: "product-name",
    name: "Product Name Generator",
    category: "text",
    short: "Marketing product names.",
    description: "Generate commercial product names for e-commerce and catalog mockups.",
    keywords: ["product", "name", "marketing", "brand", "ecommerce"],
    fields: [],
    generate: () => {
      const adj = pick(ADJECTIVES).charAt(0).toUpperCase() + pick(ADJECTIVES).slice(1);
      const noun = pick(NOUNS).charAt(0).toUpperCase() + pick(NOUNS).slice(1);
      const suffix = pick(["Pro", "Max", "Plus", "Ultra", "Lite", "Elite", "Series", "Edition", "X"]);
      const category = pick(["Wireless", "Portable", "Smart", "Premium", "Digital", "Compact"]);
      return `${category} ${adj} ${noun} ${suffix}`;
    },
  },
  {
    slug: "review-text",
    name: "Customer Review Generator",
    category: "text",
    short: "Product reviews.",
    description: "Generate realistic customer review text for e-commerce and product testing.",
    keywords: ["review", "rating", "customer", "feedback", "testimonial"],
    fields: [
      { key: "stars", label: "Star rating", type: "select", default: "5",
        options: ["1","2","3","4","5"].map(v => ({ value: v, label: "★".repeat(Number(v)) })) },
    ],
    generate: (o) => {
      const stars = Number(o.stars);
      const rating = "★".repeat(stars) + "☆".repeat(5 - stars) + ` (${stars}/5)`;
      const opener = pick(REVIEW_PHRASES.openers);
      const body = pick(REVIEW_PHRASES.bodies);
      const closer = pick(REVIEW_PHRASES.closers);
      return `${rating}\n${opener} ${body} ${closer}`;
    },
  },
  {
    slug: "blog-title",
    name: "Blog Post Title Generator",
    category: "text",
    short: "SEO-friendly blog titles.",
    description: "Generate clickable blog post titles in common formats (How-to, listicle, question, etc.).",
    keywords: ["blog", "title", "seo", "content", "headline"],
    fields: [],
    generate: () => {
      const adj = pick(ADJECTIVES).charAt(0).toUpperCase() + pick(ADJECTIVES).slice(1);
      const noun = pick(NOUNS).charAt(0).toUpperCase() + pick(NOUNS).slice(1);
      const n = randomInt(5, 25);
      const patterns = [
        () => `How to ${pick(["Build", "Create", "Master", "Optimize", "Scale"])} Your ${noun} in ${randomInt(5, 30)} Days`,
        () => `${n} ${adj} Ways to ${pick(["Improve", "Boost", "Supercharge", "Automate"])} Your ${noun}`,
        () => `Why Your ${noun} Strategy Is ${pick(["Failing", "Outdated", "Missing the Point", "Costing You Money"])}`,
        () => `The Complete Guide to ${adj} ${noun} in ${new Date().getFullYear()}`,
        () => `${noun} Best Practices: A ${adj} Developer's Handbook`,
        () => `Is ${noun} ${pick(["Dead", "the Future", "Worth It", "Overrated"])}? Here's the Truth`,
      ];
      return pick(patterns)();
    },
  },
  {
    slug: "app-name",
    name: "App Name Generator",
    category: "text",
    short: "Software application names.",
    description: "Generate creative software application and SaaS product names.",
    keywords: ["app", "software", "saas", "startup", "product name"],
    fields: [],
    generate: () => {
      const patterns = [
        () => pick(APP_PREFIXES) + pick(APP_SUFFIXES),
        () => pick(ADJECTIVES).charAt(0).toUpperCase() + pick(ADJECTIVES).slice(1) + pick(APP_SUFFIXES),
        () => pick(APP_PREFIXES) + pick(NOUNS).charAt(0).toUpperCase() + pick(NOUNS).slice(1),
        () => pick(NOUNS).charAt(0).toUpperCase() + pick(NOUNS).slice(1) + pick(APP_SUFFIXES),
      ];
      return pick(patterns)();
    },
  },
  {
    slug: "tagline",
    name: "Brand Tagline Generator",
    category: "text",
    short: "Brand and marketing taglines.",
    description: "Pick a random real brand tagline or generate a new one for mock branding projects.",
    keywords: ["tagline", "slogan", "brand", "marketing", "copywriting"],
    fields: [],
    generate: () => {
      const real = randomInt(0, 1) === 1;
      if (real) return pick(TAGLINES);
      const adj = pick(ADJECTIVES).charAt(0).toUpperCase() + pick(ADJECTIVES).slice(1);
      const noun = pick(NOUNS).charAt(0).toUpperCase() + pick(NOUNS).slice(1);
      const patterns = [
        `${adj}. ${noun}. Done.`,
        `The ${adj} way to ${pick(NOUNS)}.`,
        `Built for the ${adj} ${noun}.`,
        `Your ${adj} ${noun} awaits.`,
        `Think ${adj}. Think ${noun}.`,
      ];
      return pick(patterns);
    },
  },
  {
    slug: "proverb",
    name: "Proverb Generator",
    category: "text",
    short: "Wisdom proverbs from around the world.",
    description: "Pick a random proverb or saying from a curated collection of real-world wisdom.",
    keywords: ["proverb", "saying", "quote", "wisdom"],
    fields: [],
    generate: () => pick(PROVERBS),
  },

  // ===== COLORS & DESIGN (extended) =====
  {
    slug: "cmyk-color",
    name: "CMYK Color Generator",
    category: "color",
    short: "Random CMYK print colors.",
    description: "Generate random CMYK color values (Cyan, Magenta, Yellow, Key/Black) for print design.",
    keywords: ["cmyk", "color", "print", "design"],
    fields: [],
    generate: () => {
      const c = randomInt(0, 100), m = randomInt(0, 100), y = randomInt(0, 100), k = randomInt(0, 60);
      const r = Math.round(255 * (1 - c / 100) * (1 - k / 100));
      const g = Math.round(255 * (1 - m / 100) * (1 - k / 100));
      const b = Math.round(255 * (1 - y / 100) * (1 - k / 100));
      const hex = `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
      return `cmyk(${c}%, ${m}%, ${y}%, ${k}%)  →  rgb(${r}, ${g}, ${b})  →  ${hex.toUpperCase()}`;
    },
  },
  {
    slug: "material-color",
    name: "Material Design Color Generator",
    category: "color",
    short: "Google Material Design palette.",
    description: "Pick a random color from the official Google Material Design color palette.",
    keywords: ["material design", "google", "color", "palette"],
    fields: [],
    generate: () => {
      const [name, shade, hex] = pick(MATERIAL_COLORS);
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `${name} ${shade}  →  ${hex.toUpperCase()}  rgb(${r}, ${g}, ${b})`;
    },
  },
  {
    slug: "color-full",
    name: "Color Full-Format Generator",
    category: "color",
    short: "One color in Hex, RGB, HSL and CMYK.",
    description: "Generate a single random color and express it in all common formats: Hex, RGB, HSL and CMYK.",
    keywords: ["color", "hex", "rgb", "hsl", "cmyk", "format"],
    fields: [],
    generate: () => {
      const r = randomInt(0, 255), g = randomInt(0, 255), b = randomInt(0, 255);
      const hex = `#${[r, g, b].map(v => v.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
      const rn = r / 255, gn = g / 255, bn = b / 255;
      const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn), delta = max - min;
      const l = (max + min) / 2;
      const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
      let h = 0;
      if (delta !== 0) {
        if (max === rn) h = ((gn - bn) / delta) % 6;
        else if (max === gn) h = (bn - rn) / delta + 2;
        else h = (rn - gn) / delta + 4;
      }
      h = Math.round((h * 60 + 360) % 360);
      const k = 1 - max;
      const c = k < 1 ? Math.round((1 - max / (1 - k)) * 100) : 0;
      const m = k < 1 ? Math.round((1 - gn / (1 - k)) * 100) : 0;
      const y = k < 1 ? Math.round((1 - bn / (1 - k)) * 100) : 0;
      return `HEX:  ${hex}\nRGB:  rgb(${r}, ${g}, ${b})\nHSL:  hsl(${h}deg, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)\nCMYK: cmyk(${c}%, ${m}%, ${y}%, ${Math.round(k * 100)}%)`;
    },
  },
  {
    slug: "color-accessible",
    name: "Accessible Color Pair Generator",
    category: "color",
    short: "WCAG AA contrast-safe color pairs.",
    description: "Generate a foreground/background color pair that meets WCAG 2.1 AA contrast ratio (≥4.5:1).",
    keywords: ["accessibility", "wcag", "contrast", "a11y", "color"],
    fields: [],
    generate: () => {
      const luminance = (r: number, g: number, b: number) => {
        const s = [r, g, b].map(v => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
        return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
      };
      const contrast = (l1: number, l2: number) => (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      for (let i = 0; i < 500; i++) {
        const fg = { r: randomInt(0,255), g: randomInt(0,255), b: randomInt(0,255) };
        const bg = { r: randomInt(0,255), g: randomInt(0,255), b: randomInt(0,255) };
        const ratio = contrast(luminance(fg.r, fg.g, fg.b), luminance(bg.r, bg.g, bg.b));
        if (ratio >= 4.5) {
          const toHex = (c: {r:number;g:number;b:number}) => `#${[c.r,c.g,c.b].map(v=>v.toString(16).padStart(2,"0")).join("").toUpperCase()}`;
          return `FG: ${toHex(fg)}  ·  BG: ${toHex(bg)}\nContrast ratio: ${ratio.toFixed(2)}:1  (WCAG AA ✓)`;
        }
      }
      return "FG: #FFFFFF  ·  BG: #000000\nContrast ratio: 21.00:1  (WCAG AAA ✓)";
    },
  },

  // ===== VISUAL TOOLS (extended) =====
  {
    slug: "qr-vcard",
    name: "QR vCard Generator",
    category: "visual",
    short: "QR code encoding a contact card (vCard).",
    description: "Generate a QR code containing a vCard 3.0 contact record — scannable by any smartphone.",
    keywords: ["qr", "vcard", "contact", "nfc", "business card"],
    fields: [
      { key: "name", label: "Full name", type: "text", default: "Jane Smith" },
      { key: "org", label: "Organisation", type: "text", default: "DataForge Inc." },
      { key: "phone", label: "Phone", type: "text", default: "+1 555 123 4567" },
      { key: "email", label: "Email", type: "text", default: "jane@example.com" },
    ],
    generate: async (o) => {
      const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${o.name}\nORG:${o.org}\nTEL:${o.phone}\nEMAIL:${o.email}\nEND:VCARD`;
      const QRCode = (await import("qrcode")).default;
      return await (QRCode as { toDataURL: (t: string, opts: Record<string, unknown>) => Promise<string> }).toDataURL(vcard, { width: 256, margin: 2 });
    },
  },
  {
    slug: "qr-wifi",
    name: "QR WiFi Generator",
    category: "visual",
    short: "QR code for WiFi credentials.",
    description: "Generate a QR code that encodes WiFi credentials — scan to connect instantly on Android/iOS.",
    keywords: ["qr", "wifi", "wireless", "credentials", "network"],
    fields: [
      { key: "ssid", label: "Network name (SSID)", type: "text", default: "MyWiFiNetwork" },
      { key: "password", label: "Password", type: "text", default: "MySecretPass123" },
      { key: "security", label: "Security", type: "select", default: "WPA",
        options: [{ value: "WPA", label: "WPA/WPA2" }, { value: "WEP", label: "WEP" }, { value: "", label: "Open" }] },
    ],
    generate: async (o) => {
      const wifi = `WIFI:T:${o.security};S:${o.ssid};P:${o.password};;`;
      const QRCode = (await import("qrcode")).default;
      return await (QRCode as { toDataURL: (t: string, opts: Record<string, unknown>) => Promise<string> }).toDataURL(wifi, { width: 256, margin: 2 });
    },
  },

  // ===== CRYPTO & SECURITY (extended) =====
  {
    slug: "pgp-fingerprint",
    name: "PGP Fingerprint Generator",
    category: "security",
    short: "PGP/GPG key fingerprints.",
    description: "Generate a realistic PGP key fingerprint in standard colon-separated hex format.",
    keywords: ["pgp", "gpg", "fingerprint", "public key", "crypto"],
    fields: [],
    generate: () => {
      const hex = randomHex(20).toUpperCase();
      const groups: string[] = [];
      for (let i = 0; i < 40; i += 4) groups.push(hex.slice(i, i + 4));
      return groups.join(" ");
    },
  },
  {
    slug: "otp-code",
    name: "OTP Code Generator",
    category: "security",
    short: "6-digit one-time passcodes.",
    description: "Generate a 6-digit one-time passcode (OTP) as used by TOTP authenticator apps.",
    keywords: ["otp", "totp", "2fa", "one time password", "authenticator"],
    fields: [num("digits", "Digits", 6, 4, 8)],
    generate: (o) => digits(Number(o.digits)),
  },
  {
    slug: "rsa-stub",
    name: "RSA Key Stub Generator",
    category: "security",
    short: "RSA public key PEM stub.",
    description: "Generate a dummy RSA public key stub in PEM format (random bytes — not a real key). For UI testing.",
    keywords: ["rsa", "pem", "public key", "ssl", "certificate"],
    fields: [
      { key: "bits", label: "Key size", type: "select", default: "2048",
        options: [{ value: "1024", label: "1024-bit" }, { value: "2048", label: "2048-bit" }, { value: "4096", label: "4096-bit" }] },
    ],
    generate: (o) => {
      const byteLen = Number(o.bits) / 8;
      const bodyBytes = randomBytes(byteLen);
      let bin = ""; bodyBytes.forEach(b => (bin += String.fromCharCode(b)));
      const b64 = btoa(bin).match(/.{1,64}/g)?.join("\n") ?? btoa(bin);
      return `-----BEGIN PUBLIC KEY-----\n${b64}\n-----END PUBLIC KEY-----`;
    },
  },
  {
    slug: "csp-header",
    name: "CSP Header Generator",
    category: "security",
    short: "Content-Security-Policy headers.",
    description: "Generate a realistic Content-Security-Policy HTTP header for web application security.",
    keywords: ["csp", "content security policy", "headers", "security", "xss"],
    fields: [],
    generate: () => {
      const self = "'self'";
      const nonce = `'nonce-${bytesToBase64Url(randomBytes(16))}'`;
      const directives = [
        `default-src ${self}`,
        `script-src ${self} ${nonce} https://cdn.jsdelivr.net`,
        `style-src ${self} 'unsafe-inline'`,
        `img-src ${self} data: https:`,
        `connect-src ${self} https://api.example.com`,
        `font-src ${self} https://fonts.gstatic.com`,
        `frame-ancestors 'none'`,
        `base-uri ${self}`,
        `form-action ${self}`,
      ];
      return `Content-Security-Policy: ${directives.join("; ")}`;
    },
  },
  {
    slug: "aes-key",
    name: "AES Key Generator",
    category: "hex",
    short: "AES-128 / 192 / 256 secret keys.",
    description: "Generate cryptographically secure AES encryption keys in hex and base64 for 128, 192 or 256-bit key sizes.",
    keywords: ["aes", "key", "encryption", "symmetric", "crypto"],
    fields: [
      { key: "bits", label: "Key size", type: "select", default: "256",
        options: [{ value: "128", label: "AES-128 (16 bytes)" }, { value: "192", label: "AES-192 (24 bytes)" }, { value: "256", label: "AES-256 (32 bytes)" }] },
    ],
    generate: (o) => {
      const bytes = randomBytes(Number(o.bits) / 8);
      const hex = Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
      let bin = ""; bytes.forEach(b => (bin += String.fromCharCode(b)));
      const b64 = btoa(bin);
      return `AES-${o.bits} Key\nHex:    ${hex}\nBase64: ${b64}`;
    },
  },
  {
    slug: "hmac-key",
    name: "HMAC Key Generator",
    category: "hex",
    short: "HMAC-SHA256/512 secret keys.",
    description: "Generate a secure HMAC secret key in hex and base64 for request signing and MAC authentication.",
    keywords: ["hmac", "mac", "key", "signing", "sha256"],
    fields: [
      { key: "algo", label: "Algorithm", type: "select", default: "SHA-256",
        options: [{ value: "SHA-256", label: "HMAC-SHA256 (32 bytes)" }, { value: "SHA-512", label: "HMAC-SHA512 (64 bytes)" }] },
    ],
    generate: (o) => {
      const bytes = randomBytes(o.algo === "SHA-512" ? 64 : 32);
      const hex = Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
      let bin = ""; bytes.forEach(b => (bin += String.fromCharCode(b)));
      return `HMAC-${String(o.algo).replace("SHA-","SHA")} Key\nHex:    ${hex}\nBase64: ${btoa(bin)}`;
    },
  },

  // ===== ADDRESS & NETWORK (extended) =====
  {
    slug: "hostname",
    name: "Hostname Generator",
    category: "address",
    short: "Server / device hostnames.",
    description: "Generate realistic server or device hostnames in common data-centre naming conventions.",
    keywords: ["hostname", "server", "network", "dns"],
    fields: [],
    generate: () => {
      const roles = ["web","api","db","cache","worker","proxy","monitor","backup","queue","auth"];
      const envs = ["prod","staging","dev","test"];
      const region = pick(["us-east","eu-west","ap-south","us-west","eu-central"]);
      const n = randomInt(1, 9);
      return `${pick(roles)}-${pick(envs)}-${region}-${n.toString().padStart(2,"0")}`;
    },
  },
  {
    slug: "fqdn",
    name: "FQDN Generator",
    category: "address",
    short: "Fully Qualified Domain Names.",
    description: "Generate fully qualified domain names (FQDN) as used in DNS zones and TLS certificates.",
    keywords: ["fqdn", "domain", "dns", "certificate"],
    fields: [],
    generate: () => {
      const sub = pick(["www","api","app","mail","cdn","assets","dashboard","portal","admin","auth"]);
      const domain = `${pick(ADJECTIVES)}${pick(NOUNS)}`;
      const tld = pick(TLDS2);
      return `${sub}.${domain}.${tld}.`;
    },
  },
  {
    slug: "email-header",
    name: "Email Header Generator",
    category: "address",
    short: "Full SMTP email header block.",
    description: "Generate a realistic email header block including Received, From, To, Subject, and authentication headers.",
    keywords: ["email", "smtp", "header", "mime", "mta"],
    fields: [],
    generate: () => {
      const fromName = `${pick(FIRST_NAMES_M)} ${pick(LAST_NAMES2)}`;
      const fromEmail = `${pick(NOUNS)}${randomInt(1,99)}@${pick(ADJECTIVES)}${pick(NOUNS)}.com`;
      const toEmail = `${pick(NOUNS)}@example.com`;
      const msgId = `<${randomHex(16)}@mail.${pick(NOUNS)}.com>`;
      const ts = new Date(Date.now() - randomInt(0, 86400000)).toUTCString();
      return `Return-Path: <${fromEmail}>\nReceived: from mail.${pick(NOUNS)}.com ([${randomInt(1,254)}.${randomInt(0,255)}.${randomInt(0,255)}.${randomInt(1,254)}])\n        by mx.example.com with ESMTPS\n        id ${randomString(16,"abcdefghijklmnopqrstuvwxyz0123456789")}; ${ts}\nFrom: "${fromName}" <${fromEmail}>\nTo: ${toEmail}\nSubject: ${pick(BOOK_TITLE_WORDS.adj)} update from ${pick(COMPANY_PREFIX)}\nDate: ${ts}\nMessage-ID: ${msgId}\nMIME-Version: 1.0\nDKIM-Signature: v=1; a=rsa-sha256; d=${pick(NOUNS)}.com; s=mail;\n        h=from:to:subject:date; b=${randomString(40,"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/")}`;
    },
  },
  {
    slug: "bgp-asn",
    name: "BGP ASN Generator",
    category: "address",
    short: "BGP Autonomous System Numbers.",
    description: "Generate BGP ASNs in both 16-bit (legacy) and 32-bit (extended) formats.",
    keywords: ["bgp", "asn", "autonomous system", "routing", "network"],
    fields: [
      { key: "type", label: "Format", type: "select", default: "16bit",
        options: [{ value: "16bit", label: "16-bit (1–65535)" }, { value: "32bit", label: "32-bit (1–4294967295)" }] },
    ],
    generate: (o) => {
      const asn = o.type === "32bit" ? randomInt(65536, 4294967295) : randomInt(1, 65534);
      const asn32 = `AS${Math.floor(asn / 65536)}.${asn % 65536}`;
      return o.type === "32bit" ? `AS${asn}  (${asn32})` : `AS${asn}`;
    },
  },
  {
    slug: "isp-info",
    name: "ISP / AS Info Generator",
    category: "address",
    short: "Simulated ISP and AS info.",
    description: "Generate simulated ISP, ASN and hosting organisation info as returned by IP geolocation APIs.",
    keywords: ["isp", "asn", "hosting", "ip", "geolocation"],
    fields: [],
    generate: () => {
      const isp = pick(ISP_NAMES);
      const asn = randomInt(1, 65534);
      const ip = Array.from({ length: 4 }, () => randomInt(1, 254)).join(".");
      const c = pick(COUNTRIES);
      return `IP:   ${ip}\nISP:  ${isp}\nASN:  AS${asn}\nOrg:  ${isp}\nCC:   ${c.code} (${c.name})\nCity: ${pick(["New York","London","Frankfurt","Singapore","Tokyo"])}`;
    },
  },

  // ===== DATE & TIME (extended) =====
  {
    slug: "relative-date",
    name: "Relative Date Generator",
    category: "datetime",
    short: "'3 days ago' / 'in 2 weeks' strings.",
    description: "Generate relative date expressions as used in UIs (e.g. 'just now', '2 hours ago', 'in 5 days').",
    keywords: ["relative date", "time ago", "humanize", "moment", "dayjs"],
    fields: [],
    generate: () => {
      const past = randomInt(0, 1) === 1;
      const units: [number, string][] = [[60,"second"],[3600,"minute"],[86400,"hour"],[604800,"day"],[2592000,"week"],[31536000,"month"]];
      const [secs, unit] = pick(units);
      const amount = randomInt(1, Math.floor(secs / (units[0][0] || 1)));
      const plural = amount !== 1 ? "s" : "";
      if (amount === 0 && !past) return "just now";
      return past ? `${amount} ${unit}${plural} ago` : `in ${amount} ${unit}${plural}`;
    },
  },
  {
    slug: "date-range",
    name: "Date Range Generator",
    category: "datetime",
    short: "Random date ranges with duration.",
    description: "Generate a start and end date range with human-readable duration.",
    keywords: ["date range", "period", "start", "end", "duration"],
    fields: [num("minDays", "Min days", 1, 1, 365), num("maxDays", "Max days", 30, 1, 3650)],
    generate: (o) => {
      const duration = randomInt(Number(o.minDays), Number(o.maxDays));
      const start = new Date(Date.now() - randomInt(0, 365 * 86400000));
      const end = new Date(start.getTime() + duration * 86400000);
      const years = Math.floor(duration / 365);
      const months = Math.floor((duration % 365) / 30);
      const days = duration % 30;
      const parts = [years && `${years}y`, months && `${months}mo`, days && `${days}d`].filter(Boolean);
      return `${start.toISOString().slice(0, 10)} → ${end.toISOString().slice(0, 10)}\nDuration: ${duration} days (${parts.join(" ")})`;
    },
  },
  {
    slug: "business-hours",
    name: "Business Hours Generator",
    category: "datetime",
    short: "Random business operating hours.",
    description: "Generate a business's weekly operating hours schedule.",
    keywords: ["business hours", "schedule", "opening hours", "timetable"],
    fields: [],
    generate: () => {
      const open = randomInt(7, 10);
      const close = randomInt(17, 21);
      const lunch = randomInt(0, 1) === 1 ? `  (closed ${randomInt(12,13)}:00–${randomInt(13,14)}:00)` : "";
      const days: Record<string, string> = {
        "Mon–Fri": `${open}:00 – ${close}:00${lunch}`,
        "Saturday": randomInt(0, 1) === 1 ? `${open + 1}:00 – ${close - 2}:00` : "Closed",
        "Sunday": pick(["Closed", `${open + 2}:00 – ${close - 3}:00`]),
      };
      return Object.entries(days).map(([day, hours]) => `${day.padEnd(9)} ${hours}`).join("\n");
    },
  },
  {
    slug: "iso-week",
    name: "ISO Week Number Generator",
    category: "datetime",
    short: "ISO 8601 week numbers.",
    description: "Generate a random date and compute its ISO 8601 week number (Week 1 = the week with the first Thursday).",
    keywords: ["iso week", "week number", "iso 8601", "date"],
    fields: [num("year", "Year", new Date().getFullYear(), 2000, 2100)],
    generate: (o) => {
      const year = Number(o.year);
      const day = new Date(year, randomInt(0, 11), randomInt(1, 28));
      const jan4 = new Date(year, 0, 4);
      const startOfWeek1 = new Date(jan4.getTime() - ((jan4.getDay() || 7) - 1) * 86400000);
      const weekNum = Math.floor((day.getTime() - startOfWeek1.getTime()) / (7 * 86400000)) + 1;
      const dayName = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][day.getDay()];
      return `${day.toISOString().slice(0, 10)} (${dayName})  →  Week ${weekNum}, ${year}  (ISO 8601)`;
    },
  },
  {
    slug: "fiscal-quarter",
    name: "Fiscal Quarter Generator",
    category: "datetime",
    short: "Fiscal quarter and year.",
    description: "Generate a random fiscal quarter designation — supports calendar-year and common fiscal year offsets.",
    keywords: ["fiscal quarter", "q1", "q2", "financial year", "reporting"],
    fields: [
      { key: "offset", label: "Fiscal year start", type: "select", default: "Jan",
        options: [
          { value: "Jan", label: "January (US/UK default)" },
          { value: "Apr", label: "April (UK tax year)" },
          { value: "Jul", label: "July (AU fiscal)" },
          { value: "Oct", label: "October" },
        ] },
    ],
    generate: (o) => {
      const offsets: Record<string, number> = { Jan: 0, Apr: 3, Jul: 6, Oct: 9 };
      const offset = offsets[String(o.offset)] ?? 0;
      const year = randomInt(2020, 2027);
      const month = randomInt(0, 11);
      const adj = (month - offset + 12) % 12;
      const q = Math.floor(adj / 3) + 1;
      const fyStart = month >= offset ? year : year - 1;
      return `Q${q} FY${fyStart}/${String(fyStart + 1).slice(2)}  (month ${month + 1}, fiscal offset: ${String(o.offset)})`;
    },
  },

  // ===== REFERENCE DATA (extended) =====
  {
    slug: "language",
    name: "Language Generator",
    category: "reference",
    short: "ISO 639 language codes.",
    description: "Pick a random language with its ISO 639-1 code, English name and native name.",
    keywords: ["language", "iso 639", "locale", "internationalization", "i18n"],
    fields: [],
    generate: () => {
      const [code, name, native] = pick(ISO_LANGUAGES);
      return `${name} (${code.toUpperCase()}) — ${native}`;
    },
  },
  {
    slug: "airport",
    name: "Airport Code Generator",
    category: "reference",
    short: "IATA airport codes.",
    description: "Pick a random IATA airport code with the airport name, city and country.",
    keywords: ["airport", "iata", "travel", "aviation"],
    fields: [],
    generate: () => {
      const [code, name, city, country] = pick(AIRPORTS);
      return `${code} — ${name}\n${city}, ${country}`;
    },
  },
  {
    slug: "stock-ticker",
    name: "Stock Ticker Generator",
    category: "reference",
    short: "Real stock tickers with exchange.",
    description: "Pick a real publicly-traded company's stock ticker symbol with its exchange.",
    keywords: ["stock", "ticker", "finance", "nasdaq", "nyse", "shares"],
    fields: [],
    generate: () => {
      const [ticker, company, exchange] = pick(STOCK_TICKERS);
      const price = randomFloat(10, 3000, 2);
      const change = randomFloat(-8, 8, 2);
      const sign = change >= 0 ? "▲" : "▼";
      return `${ticker} (${exchange}) — ${company}\n$${price.toFixed(2)}  ${sign}${Math.abs(change).toFixed(2)}%`;
    },
  },
  {
    slug: "programming-language",
    name: "Programming Language Generator",
    category: "reference",
    short: "Programming languages with metadata.",
    description: "Pick a random programming language with its creator and year of creation.",
    keywords: ["programming language", "code", "developer", "language history"],
    fields: [],
    generate: () => {
      const [name, creator, year] = pick(PROGRAMMING_LANGUAGES);
      return `${name} — created ${year} by ${creator}`;
    },
  },
  {
    slug: "cloud-region",
    name: "Cloud Region Generator",
    category: "reference",
    short: "AWS / GCP / Azure region identifiers.",
    description: "Pick a random cloud provider region identifier for infrastructure and DevOps tooling.",
    keywords: ["aws", "gcp", "azure", "cloud", "region", "devops"],
    fields: [],
    generate: () => {
      const [provider, region, location] = pick(CLOUD_REGIONS);
      return `${provider}  ${region}  (${location})`;
    },
  },
  {
    slug: "car-model",
    name: "Vehicle Make & Year Generator",
    category: "reference",
    short: "Random car make, model and year.",
    description: "Generate a random vehicle manufacturer and model year for form testing and sample data.",
    keywords: ["car", "vehicle", "automobile", "make", "model"],
    fields: [],
    generate: () => {
      const [make, country, founded] = pick(CAR_BRANDS);
      const modelYear = randomInt(2005, 2025);
      const models: Record<string, string[]> = {
        Toyota: ["Camry","Corolla","RAV4","Highlander","Prius"],
        Honda: ["Civic","Accord","CR-V","Pilot","HR-V"],
        Ford: ["F-150","Mustang","Explorer","Escape","Bronco"],
        BMW: ["3 Series","5 Series","X3","X5","7 Series"],
        Tesla: ["Model 3","Model S","Model X","Model Y","Cybertruck"],
      };
      const model = models[make]?.[randomInt(0, (models[make]?.length ?? 1) - 1)] ?? `Model ${randomString(3,"ABCDEFGHJKLMNPRSTUVWXYZ")}`;
      return `${modelYear} ${make} ${model}  (${country}, est. ${founded})`;
    },
  },
  {
    slug: "public-holiday",
    name: "Public Holiday Generator",
    category: "reference",
    short: "Random public holidays.",
    description: "Generate a random public holiday with country, date and observance type.",
    keywords: ["holiday", "public holiday", "calendar", "national day"],
    fields: [],
    generate: () => {
      const holidays = [
        ["New Year's Day","Jan 1","Global"],["Valentine's Day","Feb 14","US/UK/CA"],
        ["St Patrick's Day","Mar 17","Ireland/US"],["Good Friday","Mar-Apr (variable)","Christian"],
        ["Labour Day","May 1","EU/Global"],["Independence Day","Jul 4","United States"],
        ["Bastille Day","Jul 14","France"],["Diwali","Oct-Nov (variable)","India"],
        ["Thanksgiving","4th Thu Nov","United States"],["Christmas Day","Dec 25","Global"],
        ["Boxing Day","Dec 26","UK/CA/AU"],["Hanukkah","Nov-Dec (variable)","Jewish"],
        ["Eid al-Fitr","1 Shawwal (variable)","Muslim"],["Golden Week","Apr 29 – May 5","Japan"],
        ["National Day","Oct 1","China"],
      ] as const;
      const [name, date, region] = pick(holidays);
      return `${name}  —  ${date}  [${region}]`;
    },
  },

  // ── Barcode & ID Numbers ─────────────────────────────────────────────────

  {
    slug: "ean-13",
    name: "EAN-13 Barcode",
    category: "identity",
    short: "Valid 13-digit EAN barcode number.",
    description: "Generate a valid EAN-13 (European Article Number) barcode with correct check digit. Used globally for retail product identification.",
    keywords: ["ean-13","ean","barcode","product","retail","gtin","gs1"],
    fields: [
      {
        key: "prefix",
        label: "GS1 Prefix",
        type: "select",
        default: "random",
        options: [
          { value: "random", label: "Random" },
          { value: "978", label: "978 (Bookland/ISBN)" },
          { value: "979", label: "979 (Bookland/ISBN)" },
          { value: "020", label: "020 (In-store)" },
          { value: "200", label: "200 (Restricted)" },
          { value: "300", label: "300 (France)" },
          { value: "400", label: "400 (Germany)" },
          { value: "500", label: "500 (UK)" },
          { value: "690", label: "690 (China)" },
          { value: "754", label: "754 (Canada)" },
          { value: "890", label: "890 (India)" },
        ],
      },
    ],
    generate: (opts) => {
      const PREFIXES = ["020","030","040","050","060","070","080","090",
        "300","400","450","460","471","489","500","520",
        "539","540","560","569","590","600","611","619",
        "690","750","754","759","780","800","850","858",
        "860","880","890","893","899","978","979"];
      const prefix = opts.prefix === "random" ? pick(PREFIXES) : String(opts.prefix);
      const body = prefix + digits(9 - prefix.length);
      const check = ean13CheckDigit(body);
      const full = body + check;
      return `${full}\nFormatted: ${full.slice(0,1)} ${full.slice(1,7)} ${full.slice(7,13)}`;
    },
  },

  {
    slug: "ean-8",
    name: "EAN-8 Barcode",
    category: "identity",
    short: "Valid 8-digit EAN barcode number.",
    description: "Generate a valid EAN-8 barcode with correct check digit. A short-form EAN used on small retail packages.",
    keywords: ["ean-8","ean","barcode","product","retail","short"],
    fields: [],
    generate: () => {
      // EAN-8 uses same check algorithm as EAN-13 (weights 1,3 alternating)
      const body = digits(7);
      const check = ean13CheckDigit(body);
      const full = body + check;
      return `${full}\nFormatted: ${full.slice(0,4)} ${full.slice(4,8)}`;
    },
  },

  {
    slug: "upc-a",
    name: "UPC-A Barcode",
    category: "identity",
    short: "Valid 12-digit UPC-A barcode.",
    description: "Generate a valid UPC-A (Universal Product Code) barcode number used in North America for retail products.",
    keywords: ["upc","upc-a","barcode","product","retail","north america","gs1"],
    fields: [
      {
        key: "number_system",
        label: "Number System Digit",
        type: "select",
        default: "random",
        options: [
          { value: "random", label: "Random" },
          { value: "0", label: "0 — Standard" },
          { value: "1", label: "1 — Reserved" },
          { value: "2", label: "2 — Variable weight" },
          { value: "3", label: "3 — Drug/Health" },
          { value: "4", label: "4 — In-store use" },
          { value: "5", label: "5 — Coupons" },
          { value: "6", label: "6 — Standard" },
          { value: "7", label: "7 — Standard" },
          { value: "8", label: "8 — Reserved" },
          { value: "9", label: "9 — Coupons" },
        ],
      },
    ],
    generate: (opts) => {
      const ns = opts.number_system === "random" ? String(randomInt(0, 9)) : String(opts.number_system);
      const body = ns + digits(10);
      const check = ean13CheckDigit(body); // UPC-A check same as EAN-13
      const full = body + check;
      return `${full}\nFormatted: ${full.slice(0,1)} ${full.slice(1,6)} ${full.slice(6,11)} ${full.slice(11,12)}`;
    },
  },

  {
    slug: "upc-e",
    name: "UPC-E Barcode",
    category: "identity",
    short: "6-digit compressed UPC-E barcode.",
    description: "Generate a UPC-E barcode — the compressed 8-digit form of UPC-A used on small packages. Encodes a full 12-digit UPC-A in 6 digits.",
    keywords: ["upc-e","upc","barcode","small package","compressed"],
    fields: [],
    generate: () => {
      // UPC-E: number system 0 or 1, 6 manufacturer/product digits, 1 check
      const ns = randomInt(0, 1);
      const body = digits(6);
      // Check digit derived from the expanded UPC-A equivalent
      const expanded = ns === 0
        ? `0${body.slice(0,2)}00000${body.slice(2,5)}${body.slice(5,6)}`
        : `1${body.slice(0,2)}00000${body.slice(2,5)}${body.slice(5,6)}`;
      const check = ean13CheckDigit(expanded.slice(0,11));
      return `${ns}${body}${check}\nExpanded UPC-A: ${expanded.slice(0,11)}${check}`;
    },
  },

  {
    slug: "isbn-13",
    name: "ISBN-13",
    category: "identity",
    short: "Valid 13-digit ISBN book number.",
    description: "Generate a valid ISBN-13 (International Standard Book Number) with correct check digit. Uses the 978 or 979 Bookland prefix.",
    keywords: ["isbn","isbn-13","book","publishing","library","ean-13"],
    fields: [
      {
        key: "prefix",
        label: "Prefix",
        type: "select",
        default: "978",
        options: [
          { value: "978", label: "978 (traditional)" },
          { value: "979", label: "979 (extended)" },
        ],
      },
    ],
    generate: (opts) => {
      const prefix = String(opts.prefix);
      const body = prefix + digits(9);
      const check = isbn13CheckDigit(body);
      const full = body + check;
      return `ISBN ${full.slice(0,3)}-${full.slice(3,4)}-${full.slice(4,8)}-${full.slice(8,12)}-${full.slice(12)}`;
    },
  },

  {
    slug: "isbn-10",
    name: "ISBN-10",
    category: "identity",
    short: "Valid 10-digit legacy ISBN book number.",
    description: "Generate a valid ISBN-10 (legacy format, pre-2007) with correct mod-11 check digit. Check digit may be 0–9 or X.",
    keywords: ["isbn","isbn-10","book","publishing","library","legacy"],
    fields: [],
    generate: () => {
      const body = digits(9);
      // ISBN-10 check: sum = Σ d[i]*(10-i) for i=0..8; check = (11 - sum%11) % 11
      let sum = 0;
      for (let i = 0; i < 9; i++) sum += (body.charCodeAt(i) - 48) * (10 - i);
      const checkVal = (11 - (sum % 11)) % 11;
      const check = checkVal === 10 ? "X" : String(checkVal);
      const full = body + check;
      return `ISBN ${full.slice(0,1)}-${full.slice(1,4)}-${full.slice(4,9)}-${full.slice(9)}`;
    },
  },

  {
    slug: "issn",
    name: "ISSN",
    category: "identity",
    short: "Valid 8-digit ISSN serial number.",
    description: "Generate a valid ISSN (International Standard Serial Number) for magazines, journals, and periodicals. Uses mod-11 check digit.",
    keywords: ["issn","serial","journal","magazine","periodical","publishing"],
    fields: [],
    generate: () => {
      const body = digits(7);
      let sum = 0;
      for (let i = 0; i < 7; i++) sum += (body.charCodeAt(i) - 48) * (8 - i);
      const checkVal = (11 - (sum % 11)) % 11;
      const check = checkVal === 10 ? "X" : String(checkVal);
      const full = body + check;
      return `ISSN ${full.slice(0,4)}-${full.slice(4,8)}`;
    },
  },

  {
    slug: "isin",
    name: "ISIN",
    category: "identity",
    short: "International Securities Identification Number.",
    description: "Generate a valid ISIN (ISO 6166) used to identify stocks, bonds, and other securities globally. Luhn check digit on numeric-expanded code.",
    keywords: ["isin","securities","stock","bond","finance","iso6166"],
    fields: [
      {
        key: "country",
        label: "Country",
        type: "select",
        default: "US",
        options: [
          { value: "US", label: "US (United States)" },
          { value: "GB", label: "GB (United Kingdom)" },
          { value: "DE", label: "DE (Germany)" },
          { value: "JP", label: "JP (Japan)" },
          { value: "FR", label: "FR (France)" },
          { value: "CA", label: "CA (Canada)" },
          { value: "AU", label: "AU (Australia)" },
          { value: "CH", label: "CH (Switzerland)" },
          { value: "CN", label: "CN (China)" },
          { value: "IN", label: "IN (India)" },
          { value: "BR", label: "BR (Brazil)" },
          { value: "KR", label: "KR (South Korea)" },
        ],
      },
    ],
    generate: (opts) => {
      const cc = String(opts.country);
      const nsin = randomString(9, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ");
      // Expand letters to numbers: A=10..Z=35
      const raw = (cc + nsin).split("").map(c =>
        c >= "A" && c <= "Z" ? (c.charCodeAt(0) - 55).toString() : c
      ).join("");
      const check = luhnCheckDigit(raw);
      return `${cc}${nsin}${check}`;
    },
  },

  {
    slug: "duns",
    name: "D-U-N-S Number",
    category: "identity",
    short: "9-digit Dun & Bradstreet business identifier.",
    description: "Generate a D-U-N-S (Data Universal Numbering System) 9-digit business identifier used by Dun & Bradstreet, Apple, and the US government.",
    keywords: ["duns","dun bradstreet","business","company","identifier"],
    fields: [],
    generate: () => {
      const n = digits(9);
      return `${n.slice(0,2)}-${n.slice(2,5)}-${n.slice(5,9)}`;
    },
  },

  {
    slug: "gln",
    name: "GLN (Global Location Number)",
    category: "identity",
    short: "13-digit GS1 location identifier.",
    description: "Generate a valid GLN (Global Location Number / GS1-13) used to identify physical locations, legal entities, and functions in supply chains.",
    keywords: ["gln","global location number","gs1","supply chain","location"],
    fields: [],
    generate: () => {
      const body = digits(12);
      const check = ean13CheckDigit(body);
      const full = body + check;
      return `GLN: ${full}\nFormatted: ${full.slice(0,1)} ${full.slice(1,7)} ${full.slice(7,12)} ${full.slice(12)}`;
    },
  },

  {
    slug: "itf-14",
    name: "ITF-14 Barcode",
    category: "identity",
    short: "14-digit shipping container barcode.",
    description: "Generate a valid ITF-14 (Interleaved 2 of 5, 14 digits) barcode used on shipping containers and cartons. GS1 standard with EAN check digit.",
    keywords: ["itf-14","shipping","carton","barcode","gs1","warehouse"],
    fields: [],
    generate: () => {
      const body = digits(13);
      const check = ean13CheckDigit(body);
      const full = body + check;
      return `${full}\nFormatted: (${full.slice(0,1)}) ${full.slice(1,7)} ${full.slice(7,13)} ${full.slice(13)}`;
    },
  },

  {
    slug: "gs1-128",
    name: "GS1-128 Application Identifier",
    category: "identity",
    short: "GS1-128 AI string for shipping labels.",
    description: "Generate a GS1-128 barcode string with Application Identifiers (GTIN-14, lot number, expiry date, serial) for logistics and shipping labels.",
    keywords: ["gs1-128","gs1","application identifier","gtin","shipping","logistics"],
    fields: [
      {
        key: "include_expiry",
        label: "Include Expiry Date",
        type: "checkbox",
        default: true,
      },
      {
        key: "include_serial",
        label: "Include Serial Number",
        type: "checkbox",
        default: true,
      },
    ],
    generate: (opts) => {
      const body = digits(13);
      const check = ean13CheckDigit(body);
      const gtin = body + check;
      const lot = randomString(8, "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
      const year = randomInt(25, 28).toString().padStart(2, "0");
      const month = randomInt(1, 12).toString().padStart(2, "0");
      const day = randomInt(1, 28).toString().padStart(2, "0");
      const serial = randomString(10, "0123456789");
      let result = `(01)${gtin}(10)${lot}`;
      if (opts.include_expiry) result += `(17)${year}${month}${day}`;
      if (opts.include_serial) result += `(21)${serial}`;
      return result;
    },
  },

  {
    slug: "ndc",
    name: "NDC (National Drug Code)",
    category: "identity",
    short: "US FDA 10-digit drug identifier.",
    description: "Generate a US FDA National Drug Code (NDC) in the standard 4-4-2, 5-3-2, or 5-4-1 labeler-product-package format.",
    keywords: ["ndc","national drug code","fda","pharma","drug","healthcare"],
    fields: [
      {
        key: "format",
        label: "Format",
        type: "select",
        default: "5-4-1",
        options: [
          { value: "5-4-1", label: "5-4-1 (most common)" },
          { value: "5-3-2", label: "5-3-2" },
          { value: "4-4-2", label: "4-4-2" },
        ],
      },
    ],
    generate: (opts) => {
      const fmt = String(opts.format);
      const [a, b, c] = fmt.split("-").map(Number);
      const part1 = digits(a);
      const part2 = digits(b);
      const part3 = digits(c);
      return `NDC ${part1}-${part2}-${part3}`;
    },
  },

  {
    slug: "imei",
    name: "IMEI Number",
    category: "identity",
    short: "15-digit IMEI with Luhn check.",
    description: "Generate a valid 15-digit IMEI (International Mobile Equipment Identity) number used to identify mobile phones. Includes correct Luhn check digit.",
    keywords: ["imei","mobile","phone","device","gsm","luhn"],
    fields: [],
    generate: () => {
      const tacs = ["35674108","35406810","35956704","86498202","35761104","35322706","35377006"];
      const tac = pick(tacs);
      const body = tac + digits(6);
      const check = luhnCheckDigit(body);
      return `${body}${check}`;
    },
  },

  {
    slug: "lei",
    name: "LEI (Legal Entity Identifier)",
    category: "identity",
    short: "20-character ISO 17442 entity code.",
    description: "Generate a valid-format LEI (Legal Entity Identifier, ISO 17442) — a 20-character alphanumeric code used to identify legal entities in financial transactions.",
    keywords: ["lei","legal entity","finance","iso17442","regulatory","kyc"],
    fields: [],
    generate: () => {
      const lou = randomString(4, "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
      const reserved = "00";
      const entity = randomString(12, "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
      const body = lou + reserved + entity;
      const numeric = (body + "00").split("").map(c =>
        c >= "A" && c <= "Z" ? (c.charCodeAt(0) - 55).toString() : c
      ).join("");
      let rem = 0;
      for (const ch of numeric) rem = (rem * 10 + parseInt(ch)) % 97;
      const checkNum = (98 - rem).toString().padStart(2, "0");
      return `${body}${checkNum}`;
    },
  },

  // ===== NEW GENERATORS =====

  {
    slug: "uuid-v1",
    name: "UUID v1 Generator",
    category: "developer",
    short: "Timestamp-based UUID (version 1).",
    description: "Generate a UUID version 1 using the current timestamp. The node section uses cryptographically random bytes.",
    keywords: ["uuid", "v1", "timestamp", "identifier", "guid"],
    fields: [
      { key: "uppercase", label: "Uppercase", type: "checkbox", default: false },
    ],
    generate: (o) => {
      const EPOCH_DIFF = 122192928000000000n;
      const ts = BigInt(Date.now()) * 10000n + EPOCH_DIFF;
      const timeLow = (ts & 0xFFFFFFFFn).toString(16).padStart(8, "0");
      const timeMid = ((ts >> 32n) & 0xFFFFn).toString(16).padStart(4, "0");
      const timeHigh = ((ts >> 48n) & 0x0FFFn | 0x1000n).toString(16).padStart(4, "0");
      const clockSeq = (randomInt(0, 0x3FFF) | 0x8000).toString(16).padStart(4, "0");
      const node = Array.from({ length: 6 }, () => randomInt(0, 255).toString(16).padStart(2, "0")).join("");
      const id = `${timeLow}-${timeMid}-${timeHigh}-${clockSeq}-${node}`;
      return o.uppercase ? id.toUpperCase() : id;
    },
  },

  {
    slug: "uuid-v5",
    name: "UUID v5 Generator",
    category: "developer",
    short: "SHA-1 namespace hashed UUID (version 5).",
    description: "Generate a UUID version 5 by hashing a name string in the DNS namespace using SHA-1. Same name always produces the same UUID.",
    keywords: ["uuid", "v5", "namespace", "hash", "deterministic", "identifier"],
    fields: [
      { key: "name", label: "Input name", type: "text", default: "example.com" },
    ],
    generate: async (o) => {
      const NS_DNS = new Uint8Array([0x6b,0xa7,0xb8,0x10,0x9d,0xad,0x11,0xd1,0x80,0xb4,0x00,0xc0,0x4f,0xd4,0x30,0xc8]);
      const nameBytes = new TextEncoder().encode(String(o.name || "example.com"));
      const combined = new Uint8Array(NS_DNS.length + nameBytes.length);
      combined.set(NS_DNS); combined.set(nameBytes, NS_DNS.length);
      const hashBuf = await crypto.subtle.digest("SHA-1", combined);
      const h = new Uint8Array(hashBuf);
      h[6] = (h[6] & 0x0f) | 0x50;
      h[8] = (h[8] & 0x3f) | 0x80;
      const hex = Array.from(h.slice(0,16), b => b.toString(16).padStart(2,"0")).join("");
      return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`;
    },
  },

  {
    slug: "full-profile",
    name: "Full Person Profile",
    category: "identity",
    short: "Complete fake identity record as JSON.",
    description: "Generate a full fictional person profile: name, email, phone, DOB, address, job, username, UUID and test credit card — ideal for database seeding and UI mockups.",
    keywords: ["person", "profile", "identity", "fake", "mock", "seed", "fixture", "json"],
    fields: [
      { key: "gender", label: "Gender", type: "select", default: "any", options: [
        { value: "any", label: "Any" }, { value: "m", label: "Male" }, { value: "f", label: "Female" },
      ]},
      { key: "format", label: "Output format", type: "select", default: "json", options: [
        { value: "json", label: "JSON" }, { value: "text", label: "Plain text" },
      ]},
    ],
    generate: (o) => {
      const first = o.gender === "m" ? pick(FIRST_NAMES_M) : o.gender === "f" ? pick(FIRST_NAMES_F) : pick([...FIRST_NAMES_M, ...FIRST_NAMES_F]);
      const last = pick(LAST_NAMES2);
      const email = `${first.toLowerCase()}.${last.toLowerCase()}${randomInt(1,99)}@example.com`;
      const [state, abbr] = pick(STATES);
      const address = `${randomInt(1,9999)} ${pick(STREETS)}, ${pick(CITIES)}, ${abbr} ${digits(5)}`;
      const age = randomInt(18, 65);
      const dob = new Date(new Date().getFullYear() - age, randomInt(0,11), randomInt(1,28)).toISOString().slice(0,10);
      const ccBody = "4" + digits(14);
      const cc = (ccBody.slice(0,15) + luhnCheckDigit(ccBody.slice(0,15))).replace(/(.{4})/g,"$1 ").trim();
      const expY = (new Date().getFullYear() + randomInt(1,5)).toString().slice(-2);
      const expM = randomInt(1,12).toString().padStart(2,"0");
      if (o.format === "text") {
        return [
          `Name:     ${first} ${last}`,
          `Email:    ${email}`,
          `Phone:    +1 ${digits(3)} ${digits(3)} ${digits(4)}`,
          `DOB:      ${dob}  (age ${age})`,
          `Address:  ${address}, USA`,
          `Job:      ${pick(JOB_TITLES)} · ${pick(COMPANY_PREFIX)} ${pick(COMPANY_SUFFIX)}`,
          `Dept:     ${pick(DEPARTMENTS)}`,
          `Username: ${pick(ADJECTIVES)}_${pick(NOUNS)}${randomInt(1,999)}`,
          `UUID:     ${crypto.randomUUID()}`,
          `Visa:     ${cc}  exp ${expM}/${expY}`,
        ].join("\n");
      }
      return JSON.stringify({
        id: crypto.randomUUID(),
        name: { first, last, full: `${first} ${last}` },
        email,
        phone: `+1 ${digits(3)} ${digits(3)} ${digits(4)}`,
        dob, age,
        gender: o.gender === "any" ? pick(["male","female"]) : o.gender === "m" ? "male" : "female",
        address: { line1: address, country: "USA", state },
        job: { title: pick(JOB_TITLES), company: `${pick(COMPANY_PREFIX)} ${pick(COMPANY_SUFFIX)}`, department: pick(DEPARTMENTS) },
        username: `${pick(ADJECTIVES)}_${pick(NOUNS)}${randomInt(1,999)}`,
        creditCard: { number: cc, brand: "visa", expires: `${expM}/${expY}` },
      }, null, 2);
    },
  },

  {
    slug: "file-path",
    name: "File Path Generator",
    category: "developer",
    short: "Unix or Windows-style file paths.",
    description: "Generate realistic random file paths for test fixtures, path-parsing tests and documentation examples.",
    keywords: ["file path", "unix", "windows", "directory", "filesystem", "path"],
    fields: [
      { key: "os", label: "OS style", type: "select", default: "unix", options: [
        { value: "unix",    label: "Unix / macOS" },
        { value: "windows", label: "Windows" },
      ]},
      { key: "depth", label: "Directory depth", type: "number", default: 3, min: 1, max: 6 },
    ],
    generate: (o) => {
      const depth = Math.min(6, Math.max(1, Number(o.depth)));
      const dirs = Array.from({ length: depth }, () => pick([...NOUNS, ...ADJECTIVES]));
      const exts = ["txt","json","csv","log","md","ts","py","go","sql","xml","yaml","png","pdf","env","sh","lock"];
      const file = `${pick(NOUNS)}_${randomInt(1,999)}.${pick(exts)}`;
      if (o.os === "windows") {
        const drive = pick(["C","D","E"]);
        return `${drive}:\\${dirs.join("\\")}\\${file}`;
      }
      const root = pick(["/home/user","/var/data","/opt","/usr/local","/tmp","/srv","/etc/config"]);
      return `${root}/${dirs.join("/")}/${file}`;
    },
  },

  {
    slug: "proverb",
    name: "Proverb Generator",
    category: "text",
    short: "Random proverbs and wisdom sayings.",
    description: "Pick a random proverb or saying from a curated international collection.",
    keywords: ["proverb", "quote", "saying", "wisdom", "phrase"],
    fields: [],
    generate: () => pick(PROVERBS),
  },

  {
    slug: "airport",
    name: "Airport Code Generator",
    category: "reference",
    short: "Real IATA airport codes.",
    description: "Pick a real IATA airport code with airport name, city and country.",
    keywords: ["airport", "iata", "flight", "aviation", "travel"],
    fields: [],
    generate: () => {
      const [code, name, city, country] = pick(AIRPORTS);
      return `${code}  —  ${name}  (${city}, ${country})`;
    },
  },

  {
    slug: "stock-ticker",
    name: "Stock Ticker Generator",
    category: "reference",
    short: "Real stock ticker symbols.",
    description: "Pick a real stock ticker symbol with company name and exchange for financial UI and testing.",
    keywords: ["stock", "ticker", "finance", "equity", "market", "symbol"],
    fields: [],
    generate: () => {
      const [symbol, company, exchange] = pick(STOCK_TICKERS);
      return `${symbol}  —  ${company}  [${exchange}]`;
    },
  },

  {
    slug: "programming-language",
    name: "Programming Language Generator",
    category: "reference",
    short: "Random programming languages.",
    description: "Pick a random programming language from a comprehensive list.",
    keywords: ["programming", "language", "code", "tech", "software", "developer"],
    fields: [],
    generate: () => {
      const [name, creator, year] = pick(PROGRAMMING_LANGUAGES);
      return `${name}  (by ${creator}, ${year})`;
    },
  },

  {
    slug: "cloud-region",
    name: "Cloud Region Generator",
    category: "reference",
    short: "AWS / GCP / Azure region codes.",
    description: "Pick a random cloud infrastructure region from AWS, GCP or Azure for DevOps testing.",
    keywords: ["cloud", "aws", "gcp", "azure", "region", "datacenter", "devops"],
    fields: [],
    generate: () => {
      const [provider, region, location] = pick(CLOUD_REGIONS);
      return `${provider}  ${region}  (${location})`;
    },
  },

  {
    slug: "car-brand",
    name: "Car Brand Generator",
    category: "reference",
    short: "Random car manufacturers with year.",
    description: "Pick a random automobile manufacturer with country of origin and a model year for vehicle data mockups.",
    keywords: ["car", "vehicle", "automobile", "brand", "make", "manufacturer"],
    fields: [],
    generate: () => {
      const [make, country, founded] = pick(CAR_BRANDS);
      const year = randomInt(2015, new Date().getFullYear() + 1);
      return `${year} ${make}  (${country} · est. ${founded})`;
    },
  },

  {
    slug: "app-name",
    name: "App Name Generator",
    category: "text",
    short: "Brandable app and startup names.",
    description: "Generate creative app/startup names from tech-industry prefix-suffix combinations.",
    keywords: ["app name", "startup", "brand", "product name", "tech", "saas"],
    fields: [],
    generate: () => {
      const style = randomInt(0, 2);
      if (style === 0) return pick(APP_PREFIXES) + pick(APP_SUFFIXES);
      if (style === 1) return pick(APP_PREFIXES) + pick(APP_PREFIXES).toLowerCase();
      return pick(ADJECTIVES).replace(/^\w/, c => c.toUpperCase()) + pick(APP_SUFFIXES);
    },
  },

  {
    slug: "review-snippet",
    name: "Review Snippet Generator",
    category: "text",
    short: "Fake product and service reviews.",
    description: "Generate realistic-sounding product or service review snippets for UI mockups and e-commerce demos.",
    keywords: ["review", "testimonial", "feedback", "rating", "ecommerce", "ux"],
    fields: [
      { key: "rating", label: "Star rating", type: "select", default: "any", options: [
        { value: "any", label: "Random" },
        { value: "5",   label: "5 ★ Excellent" },
        { value: "4",   label: "4 ★ Good" },
        { value: "3",   label: "3 ★ Average" },
        { value: "2",   label: "2 ★ Poor" },
      ]},
    ],
    generate: (o) => {
      const rating = o.rating === "any" ? randomInt(2, 5) : Number(o.rating);
      const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
      const text = `${pick(REVIEW_PHRASES.openers)} ${pick(REVIEW_PHRASES.bodies)} ${pick(REVIEW_PHRASES.closers)}`;
      return `${stars} (${rating}/5)\n"${text}"`;
    },
  },

  {
    slug: "tagline",
    name: "Tagline Generator",
    category: "text",
    short: "Marketing taglines and slogans.",
    description: "Generate a catchy marketing tagline or product slogan for pitch decks and mockups.",
    keywords: ["tagline", "slogan", "marketing", "copywriting", "brand", "pitch"],
    fields: [],
    generate: () => pick(TAGLINES),
  },

  {
    slug: "iso-language",
    name: "Language Generator",
    category: "reference",
    short: "Real ISO 639-1 language codes.",
    description: "Pick a random human language with its ISO 639-1 code, English name and native name.",
    keywords: ["language", "iso", "locale", "internationalization", "i18n", "l10n"],
    fields: [],
    generate: () => {
      const [code, name, native] = pick(ISO_LANGUAGES);
      return `${code}  ${name}  (${native})`;
    },
  },

  {
    slug: "material-color",
    name: "Material Design Color",
    category: "color",
    short: "Material Design palette colours.",
    description: "Pick a random colour from the Material Design palette with name, shade and hex value.",
    keywords: ["material design", "color", "palette", "google", "ui", "android"],
    fields: [],
    generate: () => {
      const [name, shade, hex] = pick(MATERIAL_COLORS);
      return `${name} ${shade}  →  ${hex}`;
    },
  },
];

function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  if (n % 3 === 0) return n === 3;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

export interface ToolMeta {
  slug: string;
  name: string;
  category: string;
  short: string;
  keywords: string[];
}

/** Serializable metadata (no functions) — safe to pass to client components. */
export const TOOL_META: ToolMeta[] = GENERATORS.map((g) => ({
  slug: g.slug,
  name: g.name,
  category: g.category,
  short: g.short,
  keywords: g.keywords,
}));

export function getGenerator(slug: string): Generator | undefined {
  return GENERATORS.find((g) => g.slug === slug);
}

export function generatorsByCategory(category: string): Generator[] {
  return GENERATORS.filter((g) => g.category === category);
}

export const TOTAL_GENERATORS = GENERATORS.length;
