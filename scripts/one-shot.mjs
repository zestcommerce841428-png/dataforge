/**
 * Takes ONE screenshot of ONE tool. Call with: npx tsx scripts/one-shot.mjs <slug> <file>
 * Uses networkidle + standard Playwright click — the approach that's confirmed to work.
 */
import { chromium } from "playwright";

const [slug, file] = process.argv.slice(2);
if (!slug || !file) { console.error("Usage: one-shot.mjs <slug> <outfile.png>"); process.exit(1); }

const BASE = "http://localhost:3137";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.on("pageerror", e => console.log("ERR:", e.message));

await page.goto(`${BASE}/tools/${slug}`, { waitUntil: "networkidle", timeout: 30000 });

// Set count to 4 for visual richness
await page.evaluate(() => {
  const inputs = [...document.querySelectorAll('input[type="number"]')];
  const last = inputs[inputs.length - 1];
  if (last) {
    const nativeSet = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    nativeSet?.call(last, "4");
    last.dispatchEvent(new Event("input", { bubbles: true }));
    last.dispatchEvent(new Event("change", { bubbles: true }));
  }
});
await page.waitForTimeout(200);

// Click Generate — this works after networkidle
await page.getByRole("button", { name: /^generate$/i }).click({ timeout: 15000 });
await page.waitForTimeout(800);

const out = await page.locator('[aria-live="polite"]').innerText();
const ok = !out.includes("Press");
console.log(`${ok ? "✓" : "✗"} ${slug} → ${out.slice(0, 60).replace(/\n/g, " ")}`);

await page.screenshot({ path: file, fullPage: true });
await browser.close();
