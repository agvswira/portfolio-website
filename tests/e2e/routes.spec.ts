import { expect, test } from "@playwright/test";

const htmlRoutes = [
  "/",
  "/blog",
  "/blog/awal-perjalanan-masuk-informatika",
  "/blog/mulai-mencatat-dengan-obsidian",
  "/projects/botpass",
  "/projects/eling-bot",
  "/projects/portfolio-website",
];

for (const route of htmlRoutes) {
  test(`${route} renders one main landmark and one H1`, async ({ page }) => {
    const response = await page.goto(route);

    expect(response?.status()).toBe(200);
    await expect(page.locator("main#main")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(1);
  });
}

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
