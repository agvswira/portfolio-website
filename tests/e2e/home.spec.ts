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

test("desktop chapter dial stays pinned and tracks the active section", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "desktop project only");
  await page.goto("/");

  const rail = page.getByRole("navigation", { name: "Bab halaman" });
  const rotor = rail.locator("[data-chapter-dial-rotor]");
  await expect(rail).toBeVisible();
  await expect(rail.getByRole("link")).toHaveCount(5);
  await expect(rotor).toBeVisible();
  await expect(rail.locator("[data-chapter-label]")).toHaveCount(5);
  await expect(rail.locator("[data-chapter-dot]")).toHaveCount(5);

  const aboutLink = rail.getByRole("link", { name: "01 About" });
  const projectsLink = rail.getByRole("link", { name: "03 Projects" });
  const contactLink = rail.getByRole("link", { name: "05 Contact" });
  await page.locator("#about").evaluate((section) => {
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    const bounds = section.getBoundingClientRect();
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, window.scrollY + bounds.top + bounds.height / 2 - window.innerHeight / 2);
    root.style.scrollBehavior = previousBehavior;
  });
  await expect(aboutLink).toHaveAttribute("aria-current", "step");
  const initialTop = (await rail.boundingBox())?.y;
  const initialTransform = await rotor.evaluate((element) => getComputedStyle(element).transform);
  const initialDot = await aboutLink.locator("[data-chapter-dot]").boundingBox();
  expect(initialTop).toBeDefined();
  expect(initialDot).not.toBeNull();
  await expect(contactLink).toHaveAttribute("tabindex", "-1");

  await page.evaluate(() => {
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    const about = document.querySelector<HTMLElement>("#about");
    const skills = document.querySelector<HTMLElement>("#skills");
    if (!about || !skills) throw new Error("Chapter sections are missing");
    const getCenter = (section: HTMLElement) => {
      const bounds = section.getBoundingClientRect();
      return window.scrollY + bounds.top + bounds.height / 2;
    };
    const midpoint = (getCenter(about) + getCenter(skills)) / 2;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, midpoint - window.innerHeight / 2);
    root.style.scrollBehavior = previousBehavior;
  });
  await expect
    .poll(() =>
      rotor.evaluate((element) => {
        const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
        return (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI;
      })
    )
    .toBeCloseTo(-15, 1);
  const orientationErrors = await rail.locator("[data-step-index]").evaluateAll((steps) => {
    const getRotation = (element: Element) => {
      const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
      return (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI;
    };
    const rotor = document.querySelector<HTMLElement>("[data-chapter-dial-rotor]");
    if (!rotor) throw new Error("Chapter rotor is missing");
    const rotorRotation = getRotation(rotor);
    return steps.map((step) => {
      const label = step.querySelector<HTMLElement>("[data-chapter-label]");
      if (!label) throw new Error("Chapter label is missing");
      const combined = rotorRotation + getRotation(step) + getRotation(label);
      return Math.abs(((combined + 180) % 360) - 180);
    });
  });
  for (const error of orientationErrors) expect(error).toBeLessThanOrEqual(0.5);

  await page.locator("#projects").evaluate((section) => {
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    const bounds = section.getBoundingClientRect();
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, window.scrollY + bounds.top + bounds.height / 2 - window.innerHeight / 2);
    root.style.scrollBehavior = previousBehavior;
  });
  await expect(projectsLink).toHaveAttribute("aria-current", "step");
  await expect
    .poll(() => rotor.evaluate((element) => getComputedStyle(element).transform))
    .not.toBe(initialTransform);
  const projectTop = (await rail.boundingBox())?.y;
  const projectDot = projectsLink.locator("[data-chapter-dot]");
  expect(projectTop).toBeDefined();
  expect(Math.abs((projectTop ?? 0) - (initialTop ?? 0))).toBeLessThanOrEqual(2);
  await expect
    .poll(async () => {
      const bounds = await projectDot.boundingBox();
      return Math.abs((bounds?.x ?? 0) - (initialDot?.x ?? 0));
    })
    .toBeLessThanOrEqual(2);
  await expect
    .poll(async () => {
      const bounds = await projectDot.boundingBox();
      return Math.abs((bounds?.y ?? 0) - (initialDot?.y ?? 0));
    })
    .toBeLessThanOrEqual(2);

  await expect(contactLink).toHaveAttribute("tabindex", "0");
  await contactLink.click();
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.locator("#contact")).toBeInViewport();
});

test("chapter dial keeps a cropped composition on ultrawide screens", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "desktop project only");
  await page.setViewportSize({ width: 2560, height: 1000 });
  await page.goto("/");
  await page.locator("#about").evaluate((section) => {
    const root = document.documentElement;
    const bounds = section.getBoundingClientRect();
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, window.scrollY + bounds.top + bounds.height / 2 - window.innerHeight / 2);
  });

  const rotorBounds = await page.locator("[data-chapter-dial-rotor]").boundingBox();
  expect(rotorBounds).not.toBeNull();
  expect(rotorBounds?.x).toBeLessThan(0);
  expect((rotorBounds?.x ?? 0) + (rotorBounds?.width ?? 0)).toBeLessThan(640);
});

test("project cards use covers and concise summaries", async ({ page }) => {
  await page.goto("/");

  const cards = page.locator("[data-project-card]");
  await expect(cards).toHaveCount(3);
  await expect(cards.locator("img")).toHaveCount(3);
  await expect(cards.filter({ hasText: "Outcome" })).toHaveCount(0);

  const elingCard = cards.filter({ hasText: "Eling — WhatsApp Reminder Bot" });
  await expect(elingCard.getByText("Discontinued", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Discontinued", exact: true })).toHaveCount(0);
  await expect(page.locator('#contact a[href^="mailto:"]')).toHaveCount(1);

  for (const image of await cards.locator("img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate((element) => ({
          width: (element as HTMLImageElement).naturalWidth,
          height: (element as HTMLImageElement).naturalHeight,
        }))
      )
      .toEqual({ width: 1200, height: 630 });
  }
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
  await expect(page.getByRole("navigation", { name: "Bab halaman" })).toBeHidden();
});

test("reduced motion disables continuous homepage animation", async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const duration = await page
    .locator("[data-marquee]")
    .evaluate((element) => getComputedStyle(element).animationDuration);
  expect(duration).toBe("0s");

  if (isMobile) return;

  const railPosition = await page
    .locator("[data-chapter-rail]")
    .evaluate((element) => getComputedStyle(element).position);
  expect(railPosition).toBe("sticky");

  const rotor = page.locator("[data-chapter-dial-rotor]");
  await page.locator("#projects").scrollIntoViewIfNeeded();
  await expect(page.getByRole("link", { name: "03 Projects" })).toHaveAttribute(
    "aria-current",
    "step"
  );
  await expect(rotor).toBeVisible();
  const reducedMotionState = await rotor.evaluate((element) => {
    const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
    return {
      inlineTransform: element.style.transform,
      rotation: (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI,
    };
  });
  expect(reducedMotionState.inlineTransform).toBe("");
  expect(reducedMotionState.rotation).toBeCloseTo(-60, 1);
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
