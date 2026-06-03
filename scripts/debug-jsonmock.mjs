import { chromium } from "playwright";
const BASE = "http://localhost:3137";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.on("console", m => console.log("CONSOLE", m.type(), m.text().slice(0, 120)));
page.on("pageerror", e => console.log("PAGEERROR", e.message));

await page.goto(`${BASE}/tools/json-mock`, { waitUntil: "domcontentloaded" });
// Let React fully hydrate
await page.waitForTimeout(3000);

// Inspect DOM
const allButtons = await page.$$eval("button", btns => btns.map(b => ({ text: b.textContent?.trim(), disabled: b.disabled })));
console.log("Buttons on page:", JSON.stringify(allButtons));

const h1 = await page.locator("h1").innerText().catch(() => "no h1");
console.log("H1:", h1);

// Try clicking whichever button says Generate
const genBtn = allButtons.find(b => /generate/i.test(b.text || ""));
if (genBtn && !genBtn.disabled) {
  await page.getByRole("button", { name: /generate/i }).first().click();
  await page.waitForTimeout(800);
  const out = await page.locator('[aria-live="polite"]').innerText().catch(() => "no output");
  console.log("Output:", out.slice(0, 100));
}

await page.screenshot({ path: "scripts/debug-json.png", fullPage: true });
await browser.close();
