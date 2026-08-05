import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

const vercelConfig = JSON.parse(readFileSync("vercel.json", "utf8")) as {
  headers: Array<{ source: string; headers: Array<{ key: string; value: string }> }>;
};
const contentSecurityPolicy = vercelConfig.headers
  .find(({ source }) => source === "/(.*)")
  ?.headers.find(({ key }) => key === "Content-Security-Policy")?.value;

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

test("native contact fallback shows feedback without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.route("**/api/contact", (route) =>
    route.fulfill({ status: 303, headers: { location: "/#contact-success" } })
  );
  await page.goto("/");

  await page.getByLabel("Nama").fill("Pengunjung Tanpa JavaScript");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill("visitor@example.com");
  await page
    .getByRole("textbox", { name: "Pesan", exact: true })
    .fill("Halo, saya mengirim formulir tanpa JavaScript.");
  await page.getByRole("button", { name: "Kirim Pesan", exact: true }).click();

  await expect(page).toHaveURL(/\/#contact-success$/);
  await expect(page.locator("#contact-success")).toBeVisible();
  await expect(page.locator("#contact-success")).toContainText("Pesan berhasil terkirim");

  await page.goto("/#contact-error");
  await expect(page.locator("#contact-error")).toBeVisible();
  await expect(page.locator("#contact-error")).toContainText("Pesan belum berhasil dikirim");
  await context.close();
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

test("content routes expose canonical social metadata and structured data", async ({ page }) => {
  await page.goto("/blog/awal-perjalanan-masuk-informatika");

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://aguswira.dev/blog/awal-perjalanan-masuk-informatika"
  );
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    "https://aguswira.dev/images/og.png"
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image"
  );
  const blogData = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent()) ?? "null"
  ) as Array<{ "@type": string }>;
  expect(blogData.map((item) => item["@type"])).toEqual(["Person", "BlogPosting"]);

  await page.goto("/projects/botpass");
  const projectData = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent()) ?? "null"
  ) as Array<{ "@type": string }>;
  expect(projectData.map((item) => item["@type"])).toEqual(["Person", "CreativeWork"]);

  const image = await page.request.get("/images/og.png");
  expect(image.status()).toBe(200);
  expect(image.headers()["content-type"]).toBe("image/png");
});

test("hash-based production CSP permits the intended homepage behavior", async ({ page }) => {
  expect(contentSecurityPolicy).toBeTruthy();
  const violations: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && message.text().includes("Content Security Policy")) {
      violations.push(message.text());
    }
  });
  await page.route("**/*", async (route) => {
    const response = await route.fetch();
    const headers = response.headers();
    if (headers["content-type"]?.includes("text/html")) {
      headers["content-security-policy"] = contentSecurityPolicy ?? "default-src 'none'";
    }
    await route.fulfill({ response, headers });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "DApp" }).click();
  await expect(page.locator("[data-project-card]:visible")).toHaveCount(1);
  expect(violations).toEqual([]);
});

test("contact and chat expose provider errors through their live regions", async ({ page }) => {
  await page.route("**/api/contact", (route) =>
    route.fulfill({
      status: 429,
      contentType: "application/json",
      body: '{"error":"Terlalu banyak permintaan. Coba lagi nanti."}',
    })
  );
  await page.route("**/api/chat", (route) =>
    route.fulfill({
      status: 502,
      contentType: "application/json",
      body: '{"error":"Gagal menghubungi AI."}',
    })
  );
  await page.goto("/");

  await page.getByLabel("Nama").fill("Pengunjung Test");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill("visitor@example.com");
  await page
    .getByRole("textbox", { name: "Pesan", exact: true })
    .fill("Halo, saya ingin membahas sebuah proyek bersama.");
  await page.getByRole("button", { name: "Kirim Pesan", exact: true }).click();
  await expect(page.locator("[data-contact-status]")).toContainText("Terlalu banyak permintaan");

  await page.getByRole("button", { name: "Buka chat" }).click();
  await page.getByLabel("Pesan untuk asisten").fill("Apa proyek Wira?");
  await page.getByRole("button", { name: "Kirim pesan", exact: true }).click();
  await expect(page.locator("[data-chat-status]")).toHaveText("Gagal menghubungi AI.");
});
