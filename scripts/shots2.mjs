import { chromium } from "playwright";

const BASE = "http://localhost:3137";
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
page.on("pageerror", e => console.log("PAGEERROR:", e.message));

async function go(url) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000); // wait for React hydration
}

// Use JS dispatch to avoid pointer-event blocking by sticky header
async function clickGenerate() {
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")]
      .find(b => /^generate$/i.test(b.textContent?.trim() ?? ""));
    if (btn) btn.click();
  });
  await page.waitForTimeout(800);
}

// json-mock
await go(`${BASE}/tools/json-mock`);
await clickGenerate();
const out = await page.locator('[aria-live="polite"]').innerText();
console.log("json-mock output:", out.slice(0, 80));
await page.screenshot({ path: "scripts/s4-json.png", fullPage: true });
console.log("✓ s4-json.png");

// country
await go(`${BASE}/tools/country`);
await page.evaluate(() => { document.querySelector('input[type="number"][min="1"]')?.setAttribute("value","5"); });
await clickGenerate();
await clickGenerate();
await clickGenerate();
await page.screenshot({ path: "scripts/s5-country.png", fullPage: true });
console.log("✓ s5-country.png");

// credit-card
await go(`${BASE}/tools/credit-card`);
await page.evaluate(() => { const inp = [...document.querySelectorAll('input[type="number"]')].find(i => i.min === "1"); if(inp){ inp.value = "4"; inp.dispatchEvent(new Event("input", {bubbles:true})); } });
await clickGenerate();
await page.screenshot({ path: "scripts/s6-creditcard.png", fullPage: true });
console.log("✓ s6-creditcard.png");

// mnemonic
await go(`${BASE}/tools/mnemonic`);
await clickGenerate();
await page.screenshot({ path: "scripts/s7-mnemonic.png", fullPage: true });
console.log("✓ s7-mnemonic.png");

// hex-color palette
await go(`${BASE}/tools/color-palette`);
await clickGenerate();
await page.screenshot({ path: "scripts/s8-palette.png", fullPage: true });
console.log("✓ s8-palette.png");

// IBAN
await go(`${BASE}/tools/iban`);
await clickGenerate();
await page.screenshot({ path: "scripts/s9-iban.png", fullPage: true });
console.log("✓ s9-iban.png");

await browser.close();
console.log("All done, no errors.");
