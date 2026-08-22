import { expect, test } from "@playwright/test";

const htmlRoutes = [
  "/",
  "/blog",
  "/blog/awal-perjalanan-masuk-informatika",
  "/blog/mulai-mencatat-dengan-obsidian",
  "/projects/botpass",
  "/projects/cekdulu",
  "/projects/eling-bot",
  "/projects/portfolio-website",
];

for (const route of htmlRoutes) {
  test(`${route} renders global landmarks and one H1`, async ({ page, isMobile }) => {
    const response = await page.goto(route);

    expect(response?.status()).toBe(200);
    await expect(page.locator("[data-navbar]")).toBeVisible();
    if (isMobile) {
      await expect(page.getByRole("button", { name: "Buka menu" })).toBeVisible();
    } else {
      await expect(page.getByRole("navigation", { name: "Navigasi utama" })).toBeVisible();
    }
    await expect(page.locator("main#main")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(1);
  });
}

test("content routes expose route-aware navbar links and active states", async ({
  page,
  isMobile,
}) => {
  await page.goto("/blog");

  const navigationLabel = isMobile ? "Navigasi mobile" : "Navigasi utama";
  const blogNavigation = page.locator(`nav[aria-label="${navigationLabel}"]`);
  await expect(
    blogNavigation.getByRole("link", { name: "Home", includeHidden: true })
  ).toHaveAttribute("href", "/#hero");
  await expect(
    blogNavigation.getByRole("link", { name: "About", includeHidden: true })
  ).toHaveAttribute("href", "/#about");
  await expect(
    blogNavigation.getByRole("link", { name: "Blog", includeHidden: true })
  ).toHaveAttribute("aria-current", "page");

  await page.goto("/projects/eling-bot");
  const projectNavigation = page.locator(`nav[aria-label="${navigationLabel}"]`);
  await expect(
    projectNavigation.getByRole("link", { name: "Projects", includeHidden: true })
  ).toHaveAttribute("aria-current", "page");
  await expect(
    page.locator("article header").getByText("Discontinued", { exact: true })
  ).toBeVisible();
});

test("global mobile navigation works on content routes", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile project only");
  await page.goto("/projects/botpass");

  const toggle = page.getByRole("button", { name: "Buka menu" });
  await toggle.click();
  await expect(page.getByRole("navigation", { name: "Navigasi mobile" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("navigation", { name: "Navigasi mobile" })).toBeHidden();
  await expect(toggle).toBeFocused();
});

test("404, robots, and sitemap contracts remain intact", async ({ page, request }) => {
  const missing = await page.goto("/route-yang-tidak-ada");
  expect(missing?.status()).toBe(404);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");

  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain("Sitemap: https://aguswira.dev/sitemap.xml");

  const sitemap = await request.get("/sitemap.xml");
  const xml = await sitemap.text();
  expect(sitemap.status()).toBe(200);
  for (const route of htmlRoutes) {
    expect(xml).toContain(`<loc>${new URL(route, "https://aguswira.dev").href}</loc>`);
  }
});
