/**
 * Uses React's internal __reactFiber to trigger the onClick handler directly.
 * This is the only reliable way in headless Playwright when pointer events hang.
 */
import { chromium } from "playwright";
const BASE = "http://localhost:3137";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
page.on("pageerror", e => console.log("ERR:", e.message));

async function reactClick(page) {
  return page.evaluate(() => {
    // Find the Generate button
    const btn = [...document.querySelectorAll("button")]
      .find(b => b.textContent?.trim() === "Generate");
    if (!btn) { console.error("Generate button not found"); return; }

    // Get React fiber and fire the onClick prop directly
    const fiberKey = Object.keys(btn).find(k => k.startsWith("__reactFiber") || k.startsWith("__reactInternalInstance"));
    if (!fiberKey) { btn.click(); return; }  // fallback

    let fiber = btn[fiberKey];
    while (fiber) {
      const props = fiber.memoizedProps || fiber.pendingProps;
      if (props && typeof props.onClick === "function") {
        props.onClick({ type: "click", preventDefault() {}, stopPropagation() {} });
        return;
      }
      fiber = fiber.return;
    }
    btn.click(); // final fallback
  });
}

async function shot(slug, file, count = 1) {
  await page.goto(`${BASE}/tools/${slug}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  if (count > 1) {
    // Set count field via React fiber on the last number input
    await page.evaluate((n) => {
      const inputs = [...document.querySelectorAll('input[type="number"]')];
      const countInput = inputs[inputs.length - 1]; // "How many?" is always last
      if (!countInput) return;
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
      nativeInputValueSetter?.call(countInput, String(n));
      countInput.dispatchEvent(new Event("input", { bubbles: true }));
    }, count);
    await page.waitForTimeout(300);
  }

  await reactClick(page);
  await page.waitForTimeout(1200);

  const out = await page.locator('[aria-live="polite"]').innerText().catch(() => "");
  const changed = !out.includes("Press");
  console.log(`${changed ? "✓" : "✗"} ${file.padEnd(22)} → ${out.slice(0, 65).replace(/\n/g, " ")}`);

  await page.screenshot({ path: `scripts/${file}`, fullPage: true });
}

await shot("json-mock",     "s4-json.png");
await shot("country",       "s5-country.png",    5);
await shot("credit-card",   "s6-creditcard.png", 4);
await shot("mnemonic",      "s7-mnemonic.png");
await shot("color-palette", "s8-palette.png",    5);
await shot("iban",          "s9-iban.png",        4);
await shot("ulid",          "s10-ulid.png",       6);
await shot("jwt",           "s11-jwt.png");
await shot("user-agent",    "s12-useragent.png",  3);
await shot("dice",          "s13-dice.png",       5);

await browser.close();
console.log("Done.");
