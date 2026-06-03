import { chromium } from "playwright";

const URL = "http://localhost:3137/tools/integer";
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push("CONSOLE: " + m.text()); });
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));

await page.goto(URL, { waitUntil: "networkidle" });

// Single generate
await page.getByRole("button", { name: /^generate$/i }).click();
await page.waitForTimeout(500);
const single = await page.locator("output").innerText().catch(() => "(no output)");

// Bulk generate
await page.getByLabel(/how many/i).fill("5");
await page.getByRole("button", { name: /^generate$/i }).click();
await page.waitForTimeout(500);
const bulkCount = await page.locator('[aria-label="Results"] li').count();

// History
const historyCount = await page.locator('[aria-label="History"] li').count();

console.log("Single result :", JSON.stringify(single));
console.log("Bulk list rows:", bulkCount);
console.log("History rows  :", historyCount);
console.log("ERRORS        :", errors.length ? errors.join("\n") : "none");

await browser.close();
