import { chromium } from "playwright";

const BASE = "http://localhost:3137";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

const errors = [];
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));

async function generate(toolSlug) {
  await page.goto(`${BASE}/tools/${toolSlug}`, { waitUntil: "networkidle" });
  // Wait for the button to be ready after hydration
  const btn = page.getByRole("button", { name: /^generate$/i });
  await btn.waitFor({ state: "visible", timeout: 15000 });
  await page.waitForTimeout(300);
  await btn.click();
  await page.waitForTimeout(600);
  const out = await page.locator('[aria-live="polite"]').innerText();
  // strip "Copy" button labels that appear in the text
  return out.replace(/\s*Copy\s*/g, " ").trim();
}

// ── 1. Homepage search + filter ────────────────────────────────────────────
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
const hero = await page.locator("h1").first().innerText();
console.log("Hero:", hero.slice(0, 60));

const toolCount = await page.locator('[id="tools"] a').count();
console.log("Tool cards on page:", toolCount);

// Search
await page.getByLabel("Search tools").fill("color");
await page.waitForTimeout(300);
const colorHits = await page.locator('[id="tools"] a').count();
console.log(`Search "color" hits: ${colorHits}`);

// Category filter
await page.getByLabel("Search tools").fill("");
await page.waitForTimeout(200);
await page.getByRole("button", { name: /Identity/i }).first().click();
await page.waitForTimeout(200);
const identityHits = await page.locator('[id="tools"] a').count();
console.log(`Identity filter hits: ${identityHits}`);

// ── 2. Generate samples across all categories ──────────────────────────────
console.log("\nGenerator smoke (browser):");
const CHECKS = [
  { slug: "integer",     re: /\d+/ },
  { slug: "prime",       re: /\d+/ },
  { slug: "coin-flip",   re: /Heads|Tails/ },
  { slug: "dice",        re: /=\s*\d+/ },
  { slug: "roman-numeral", re: /=\s*[MDCLXVI]+/ },
  { slug: "password",    re: /\S{8,}/ },
  { slug: "uuid",        re: /[0-9a-f-]{36}/i },
  { slug: "hash",        re: /[0-9a-f]{40,}/ },
  { slug: "base64",      re: /[A-Za-z0-9+/]{10,}/ },
  { slug: "full-name",   re: /\w+ \w+/ },
  { slug: "email",       re: /@example\.com/ },
  { slug: "phone",       re: /\+\d+/ },
  { slug: "credit-card", re: /\d{4}/ },
  { slug: "iban",        re: /[A-Z]{2}\d{2}/ },
  { slug: "json-mock",   re: /\{.*"id".*\}/s },
  { slug: "csv-mock",    re: /\d+,"/ },
  { slug: "user-agent",  re: /Mozilla/ },
  { slug: "http-status", re: /\d{3} \w+/ },
  { slug: "url",         re: /https:\/\// },
  { slug: "jwt",         re: /eyJ/ },
  { slug: "hex-color",   re: /#[0-9a-f]{6}/i },
  { slug: "rgb-color",   re: /rgb\(\d+/ },
  { slug: "hsl-color",   re: /hsl\(\d+/ },
  { slug: "css-gradient", re: /linear-gradient/ },
  { slug: "tailwind-color", re: /\d{3}/ },
  { slug: "api-key",     re: /sk_\w{20,}/ },
  { slug: "totp-secret", re: /[A-Z2-7]{20,}/ },
  { slug: "mnemonic",    re: /\w+ \w+ \w+/ },
  { slug: "nanoid",      re: /\S{21}/ },
  { slug: "ulid",        re: /[0-9A-Z]{26}/ },
  { slug: "cidr",        re: /\/\d{1,2}/ },
  { slug: "ip",          re: /\d+\.\d+\.\d+\.\d+/ },
  { slug: "mac",         re: /[0-9A-F]{2}:[0-9A-F]{2}/i },
  { slug: "address",     re: /USA/ },
  { slug: "country",     re: /\([A-Z]{2}\)/ },
  { slug: "currency",    re: /[A-Z]{3} —/ },
  { slug: "date",        re: /\d{4}-\d{2}-\d{2}/ },
  { slug: "time",        re: /\d{2}:\d{2}:\d{2}/ },
  { slug: "hex",         re: /[0-9a-f]{20,}/ },
  { slug: "secret-key",  re: /[0-9a-f]{40,}|[A-Za-z0-9+/]{30,}/ },
  { slug: "lorem-ipsum", re: /Lorem|lorem/ },
  { slug: "username",    re: /_\w+_\d+|[a-z]+[._][a-z]+/ },
  { slug: "slug",        re: /^[a-z][a-z0-9-]+$/ },
  { slug: "company-name", re: /\w+ \w+/ },
];

let pass = 0, fail = 0;
for (const { slug, re } of CHECKS) {
  try {
    const out = await generate(slug);
    const ok = re.test(out);
    if (ok) { pass++; } else { fail++; }
    console.log(`  ${ok ? "✓" : "✗"} ${slug.padEnd(18)} → ${out.slice(0, 55)}`);
  } catch (e) {
    fail++;
    console.log(`  ✗ ${slug.padEnd(18)} ERROR: ${e.message.slice(0, 60)}`);
  }
}
console.log(`\nResult: ${pass}/${pass+fail} passed, ${fail} failed`);

// ── 3. My IP API ───────────────────────────────────────────────────────────
const r = await page.goto(`${BASE}/api/my-ip`);
const body = await page.locator("pre, body").first().innerText();
console.log("\nMy IP:", r?.status(), body.slice(0, 60));

// ── 4. History persists ────────────────────────────────────────────────────
await generate("integer");
await generate("integer");
await page.goto(`${BASE}/tools/integer`, { waitUntil: "networkidle" });
await page.waitForTimeout(400);
const histRows = await page.locator('[aria-label="History"] li').count();
console.log("\nHistory rows (should be ≥ 2):", histRows);

// ── 5. Screenshots ─────────────────────────────────────────────────────────
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.screenshot({ path: "scripts/home.png" });

await page.goto(`${BASE}/tools/password`, { waitUntil: "networkidle" });
const btn2 = page.getByRole("button", { name: /^generate$/i });
await btn2.waitFor({ state: "visible" });
await page.waitForTimeout(400);
await page.getByLabel(/how many/i).fill("6");
await btn2.click();
await page.waitForTimeout(500);
await page.screenshot({ path: "scripts/tool-password.png", fullPage: true });

await page.goto(`${BASE}/tools/country`, { waitUntil: "networkidle" });
const btn3 = page.getByRole("button", { name: /^generate$/i });
await btn3.waitFor({ state: "visible" });
await page.waitForTimeout(400);
await btn3.click();
await page.waitForTimeout(400);
await page.screenshot({ path: "scripts/tool-country.png", fullPage: true });

console.log("\nPage errors:", errors.length ? errors.join("\n") : "none");
console.log("Screenshots saved to scripts/");
await browser.close();
