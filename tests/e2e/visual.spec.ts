import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("homepage visual baseline", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);

  await expect(page).toHaveScreenshot("homepage.png", {
    animations: "disabled",
    fullPage: true,
    maxDiffPixelRatio: 0.001,
  });
});

test("project case-study visual baseline", async ({ page }) => {
  await page.goto("/projects/botpass");
  await page.evaluate(() => document.fonts.ready);

  await expect(page).toHaveScreenshot("project-botpass.png", {
    animations: "disabled",
    fullPage: true,
    maxDiffPixelRatio: 0.001,
  });
});
