/**
 * Uses Playwright's dispatchEvent (bypasses pointer-event interception)
 * to click Generate and screenshot each tool.
 */
import { chromium } from "playwright";
const BASE = "http://localhost:3137";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
page.on("pageerror", e => console.log("ERR:", e.message));

async function shot(slug, file, count = 1) {
  await page.goto(`${BASE}/tools/${slug}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);

  // Set count
  if (count > 1) {
    const numInputs = await page.$$('input[type="number"]');
    // Last number input is "How many?"
    if (numInputs.length > 0) {
      const last = numInputs[numInputs.length - 1];
      await last.fill(String(count));
    }
  }

  // Dispatch click on Generate button via React-compatible event
  await page.locator('button:has-text("Generate")').dispatchEvent("click");
  await page.waitForTimeout(1000);

  await page.screenshot({ path: `scripts/${file}`, fullPage: true });
  const out = await page.locator('[aria-live="polite"]').innerText().catch(() => "");
  console.log(`✓ ${file} → ${out.slice(0, 60).replace(/\n/g, " ")}`);
}

await shot("json-mock",     "s4-json.png");
await shot("country",       "s5-country.png", 5);
await shot("credit-card",   "s6-creditcard.png", 4);
await shot("mnemonic",      "s7-mnemonic.png");
await shot("color-palette", "s8-palette.png", 5);
await shot("iban",          "s9-iban.png", 4);
await shot("ulid",          "s10-ulid.png", 6);
await shot("jwt",           "s11-jwt.png");

await browser.close();
console.log("All screenshots saved.");
