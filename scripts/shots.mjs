/**
 * Takes 5 screenshots covering the key pages/features to visually prove the app.
 * Keeps things simple — no cascading loop, just targeted navigations.
 */
import { chromium } from "playwright";

const BASE = "http://localhost:3137";
const W = 1280, H = 900;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: W, height: H } });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

async function go(url) {
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
}

async function clickGenerate() {
  const btn = page.getByRole("button", { name: /^generate$/i });
  await btn.waitFor({ state: "visible", timeout: 10000 });
  await page.waitForTimeout(500);
  await btn.click();
  await page.waitForTimeout(700);
}

// 1. Homepage
await go(`${BASE}/`);
await page.screenshot({ path: "scripts/s1-home.png" });
console.log("✓ s1-home.png");

// 2. Homepage with search active
await page.getByLabel("Search tools").fill("color");
await page.waitForTimeout(300);
await page.screenshot({ path: "scripts/s2-search.png" });
console.log("✓ s2-search.png");

// 3. Password tool – bulk output + history
await go(`${BASE}/tools/password`);
await page.getByLabel(/how many/i).fill("8");
await clickGenerate();
await page.screenshot({ path: "scripts/s3-password.png", fullPage: true });
console.log("✓ s3-password.png");

// 4. JSON Mock
await go(`${BASE}/tools/json-mock`);
await clickGenerate();
await page.screenshot({ path: "scripts/s4-json.png", fullPage: true });
console.log("✓ s4-json.png");

// 5. Country (reference data)
await go(`${BASE}/tools/country`);
await page.getByLabel(/how many/i).fill("5");
await clickGenerate();
await page.screenshot({ path: "scripts/s5-country.png", fullPage: true });
console.log("✓ s5-country.png");

// 6. Credit-card tool
await go(`${BASE}/tools/credit-card`);
await page.getByLabel(/how many/i).fill("4");
await clickGenerate();
await page.screenshot({ path: "scripts/s6-creditcard.png", fullPage: true });
console.log("✓ s6-creditcard.png");

// 7. Mnemonic
await go(`${BASE}/tools/mnemonic`);
await clickGenerate();
await page.screenshot({ path: "scripts/s7-mnemonic.png", fullPage: true });
console.log("✓ s7-mnemonic.png");

console.log("Errors:", errors.length ? errors.join("; ") : "none");
await browser.close();
