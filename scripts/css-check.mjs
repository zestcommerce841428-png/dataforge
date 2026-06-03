import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage();
const sheets = [];
const blocked = [];
page.on("response", (r) => {
  const ct = r.headers()["content-type"] || "";
  if (ct.includes("css") || r.url().includes(".css")) sheets.push(`${r.status()} ${r.url()}`);
});
page.on("requestfailed", (r) => blocked.push(`${r.url()} :: ${r.failure()?.errorText}`));
page.on("console", (m) => { if (m.type() === "error") console.log("CONSOLE:", m.text()); });

await page.goto("http://localhost:3137/tools/integer", { waitUntil: "networkidle" });

// Inspect computed style of the main heading to confirm Tailwind applied
const fontWeight = await page.locator("h1").first().evaluate((el) => getComputedStyle(el).fontWeight);
const linkCount = await page.locator('link[rel="stylesheet"]').count();
const styleCount = await page.locator("style").count();

console.log("Stylesheet responses:", sheets.length ? sheets.join("\n") : "NONE");
console.log("Blocked requests    :", blocked.length ? blocked.join("\n") : "none");
console.log("<link stylesheet>   :", linkCount, " <style> tags:", styleCount);
console.log("h1 font-weight      :", fontWeight, "(700/800 = Tailwind applied)");
await browser.close();
