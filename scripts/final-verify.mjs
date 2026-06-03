import { chromium } from "playwright";
const BASE = "http://localhost:3137";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.on("pageerror", e => console.log("ERR:", e.message));

async function go(url) {
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
}
async function gen(slug) {
  await go(`${BASE}/tools/${slug}`);
  const btn = page.getByRole("button", { name: /^generate$/i });
  await btn.waitFor({ state: "visible", timeout: 8000 });
  await page.waitForTimeout(400);
  await btn.click({ timeout: 15000 });
  await page.waitForTimeout(800);
  return (await page.locator('[aria-live="polite"]').innerText()).replace(/\s*Copy\s*/g, " ").trim();
}

// 1. Total tools shown on homepage
await go(`${BASE}/`);
const toolCount = await page.locator('[id="tools"] a').count();
console.log(`Homepage tool cards: ${toolCount}`);
await page.screenshot({ path: "scripts/final-home.png" });

// 2. Search
await page.getByLabel("Search tools").fill("qr");
await page.waitForTimeout(300);
const qrHits = await page.locator('[id="tools"] a').count();
console.log(`Search "qr" hits: ${qrHits}`);
await page.screenshot({ path: "scripts/final-search.png" });

// 3. New generators smoke test
const checks = [
  { slug: "binary-number",   re: /BIN:/ },
  { slug: "unix-timestamp",  re: /ms:/ },
  { slug: "lottery-numbers", re: /Bonus/ },
  { slug: "cron-expression", re: /#/ },
  { slug: "sql-insert",      re: /INSERT INTO/ },
  { slug: "env-variable",    re: /=/ },
  { slug: "docker-name",     re: /_/ },
  { slug: "license-plate",   re: /[A-Z0-9]{5,}/ },
  { slug: "vin",             re: /[A-Z0-9]{17}/ },
  { slug: "uk-postcode",     re: /[A-Z]+\d+ \d[A-Z]{2}/ },
  { slug: "vat-number",      re: /^[A-Z]{2}/ },
  { slug: "product-sku",     re: /-/ },
  { slug: "tracking-number", re: /\d{8,}|1Z/ },
  { slug: "swift-bic",       re: /XXX$/ },
  { slug: "aba-routing",     re: /^\d{9}/ },
  { slug: "dns-record",      re: /IN\s+(A|AAAA|CNAME|MX|TXT|NS)/ },
  { slug: "text-case",       re: /camelCase/ },
  { slug: "hashtag",         re: /#\w+/ },
  { slug: "emoji",           re: /U\+/ },
  { slug: "color-name",      re: /#[0-9A-F]{6}/i },
  { slug: "markdown",        re: /^#\s/m },
  { slug: "lorem-paragraph", re: /\w+\.\s+\w+/ },
  { slug: "timezone",        re: /(UTC|GMT)[+-]/ },
  { slug: "percentage",      re: /%$/ },
  { slug: "crypto-tx",       re: /^(0x|[0-9a-f])/i },
  { slug: "order-id",        re: /ORD-|#\d{4}|\d{3}-\d{7}/ },
  { slug: "port-number",     re: /^\d{2,5}$/ },
  { slug: "http-header",     re: /:/ },
];
console.log("\nNew generator smoke (browser):");
let pass = 0, fail = 0;
for (const { slug, re } of checks) {
  try {
    const out = await gen(slug);
    const ok = re.test(out);
    console.log(`  ${ok ? "✓" : "✗"} ${slug.padEnd(20)} → ${out.slice(0, 50)}`);
    ok ? pass++ : fail++;
  } catch (e) {
    console.log(`  ✗ ${slug.padEnd(20)} ERROR: ${e.message.slice(0, 50)}`);
    fail++;
  }
}
console.log(`\n${pass}/${pass+fail} passed`);

// 4. Screenshots of key new tools
await gen("sql-insert");
await page.screenshot({ path: "scripts/final-sql.png", fullPage: true });

await gen("cron-expression");
await page.screenshot({ path: "scripts/final-cron.png", fullPage: true });

// 5. Crypto page
await go(`${BASE}/crypto`);
await page.waitForTimeout(2000);
await page.screenshot({ path: "scripts/final-crypto.png" });
const cryptoH1 = await page.locator("h1").first().innerText();
console.log(`\nCrypto page h1: "${cryptoH1}"`);

// 6. Count routes confirmed
const status = await Promise.all(["/", "/crypto", "/tools/qr-code", "/tools/barcode", "/tools/vin",
  "/tools/binary-number", "/tools/sql-insert", "/tools/cron-expression", "/api/my-ip"]
  .map(u => page.goto(`${BASE}${u}`, { timeout: 15000 }).then(r => `${u}: ${r?.status()}`).catch(e => `${u}: ERR`)));
console.log("\nRoute checks:");
status.forEach(s => console.log(" ", s));

await browser.close();
