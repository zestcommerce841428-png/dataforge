import { test, expect } from "@playwright/test";

// Top 8 generators smoke test — verifies the page loads and generate works
const TOOLS = [
  { slug: "password",    label: "Password" },
  { slug: "uuid",        label: "UUID" },
  { slug: "json-mock",   label: "JSON Mock" },
  { slug: "credit-card", label: "Test Credit Card" },
  { slug: "mnemonic",    label: "BIP39 Mnemonic" },
  { slug: "hash",        label: "Hash" },
  { slug: "hex-color",   label: "Hex Colour" },
  { slug: "my-ip",       label: "My IP" },
];

for (const tool of TOOLS) {
  test(`generator: ${tool.slug}`, async ({ page }) => {
    await page.goto(`/tools/${tool.slug}`);

    // Page title contains tool name
    await expect(page).toHaveTitle(new RegExp(tool.label, "i"));

    // Generate button exists
    const btn = page.getByRole("button", { name: /generate/i }).first();
    await expect(btn).toBeVisible();

    // Click generate
    await btn.click();

    // Some output appears — result section should not show empty state
    const emptyState = page.getByText("No output yet");
    await expect(emptyState).not.toBeVisible({ timeout: 5000 });
  });
}

test("homepage loads and shows tool grid", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/DataForge/i);
  await expect(page.getByRole("heading", { name: /All generators/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Password/i }).first()).toBeVisible();
});

test("search filters tools", async ({ page }) => {
  await page.goto("/");
  const search = page.getByRole("searchbox", { name: /Search tools/i });
  await search.fill("uuid");
  await expect(page.getByRole("link", { name: /UUID/i })).toBeVisible();
  // Non-matching tools should disappear
  await expect(page.getByRole("link", { name: /Lottery/i })).not.toBeVisible();
});

test("/ shortcut focuses search", async ({ page }) => {
  await page.goto("/");
  // Press slash outside any input
  await page.keyboard.press("/");
  const search = page.getByRole("searchbox", { name: /Search tools/i });
  await expect(search).toBeFocused();
});

test("public API returns results", async ({ request }) => {
  const res = await request.get("/api/generate?tool=uuid&count=3");
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.tool).toBe("uuid");
  expect(body.results).toHaveLength(3);
  expect(body.results[0]).toMatch(/^[0-9a-f-]{36}$/i);
});

test("public API tools list", async ({ request }) => {
  const res = await request.get("/api/generate/tools");
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.total).toBeGreaterThan(100);
  expect(Array.isArray(body.tools)).toBe(true);
});
