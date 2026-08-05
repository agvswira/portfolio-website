import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("desktop homepage interactions and accessibility", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("main#main")).toBeVisible();
  await expect(page.locator("h1")).toHaveCount(1);

  const dappFilter = page.getByRole("button", { name: "DApp" });
  await dappFilter.click();
  await expect(dappFilter).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-project-card]:visible")).toHaveCount(1);
  await expect(page.locator("[data-project-card]:visible")).toContainText("BOTPass");

  const chatToggle = page.getByRole("button", { name: "Buka chat" });
  await chatToggle.click();
  await expect(page.getByRole("dialog", { name: "Tanya tentang Wira" })).toBeVisible();
  await expect(page.getByLabel("Pesan untuk asisten")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Tanya tentang Wira" })).toBeHidden();
  await expect(chatToggle).toBeFocused();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("mobile menu closes with Escape and returns focus", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile project only");
  await page.goto("/");

  const toggle = page.getByRole("button", { name: "Buka menu" });
  await toggle.click();
  await expect(page.getByRole("navigation", { name: "Navigasi mobile" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("navigation", { name: "Navigasi mobile" })).toBeHidden();
  await expect(toggle).toBeFocused();
});

test("reduced motion disables continuous marquee animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const duration = await page
    .locator("[data-marquee]")
    .evaluate((element) => getComputedStyle(element).animationDuration);
  expect(duration).toBe("0s");
});

test("contact form preserves its JSON contract without a live provider", async ({ page }) => {
  await page.route("**/api/contact", async (route) => {
    expect(route.request().postDataJSON()).toMatchObject({
      name: "Pengunjung Test",
      email: "visitor@example.com",
    });
    await route.fulfill({ status: 200, contentType: "application/json", body: '{"success":true}' });
  });
  await page.goto("/");

  await page.getByLabel("Nama").fill("Pengunjung Test");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill("visitor@example.com");
  await page
    .getByRole("textbox", { name: "Pesan", exact: true })
    .fill("Halo, saya ingin membahas sebuah proyek bersama.");
  await page.getByRole("button", { name: "Kirim Pesan", exact: true }).click();

  await expect(page.locator("[data-contact-status]")).toContainText("Pesan berhasil terkirim");
});

test("chat renders a buffered OpenAI-compatible SSE response", async ({ page }) => {
  await page.route("**/api/chat", async (route) => {
    expect(route.request().postDataJSON()).toEqual({
      messages: [{ role: "user", content: "Apa proyek Wira?" }],
    });
    await route.fulfill({
      status: 200,
      headers: { "content-type": "text/event-stream; charset=utf-8" },
      body: 'data: {"choices":[{"delta":{"content":"Wira membangun BOTPass."}}]}\n\ndata: [DONE]\n\n',
    });
  });
  await page.goto("/");

  await page.getByRole("button", { name: "Buka chat" }).click();
  await page.getByLabel("Pesan untuk asisten").fill("Apa proyek Wira?");
  await page.getByRole("button", { name: "Kirim pesan", exact: true }).click();

  await expect(page.locator('[data-chat-role="user"]')).toHaveText("Apa proyek Wira?");
  await expect(page.locator('[data-chat-role="assistant"]')).toHaveText("Wira membangun BOTPass.");
});
