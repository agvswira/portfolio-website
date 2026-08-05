import { expect, test } from "@playwright/test";

const snapshotName = (name: string) => {
  const environment = process.env.PLAYWRIGHT_SNAPSHOT_ENV;

  return environment ? name.replace(".png", `-${environment}.png`) : name;
};

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("homepage visual baseline", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);

  await expect(page).toHaveScreenshot(snapshotName("homepage.png"), {
    animations: "disabled",
    fullPage: true,
    maxDiffPixelRatio: 0.001,
  });
});

test("project case-study visual baseline", async ({ page }) => {
  await page.goto("/projects/botpass");
  await page.evaluate(() => document.fonts.ready);

  await expect(page).toHaveScreenshot(snapshotName("project-botpass.png"), {
    animations: "disabled",
    fullPage: true,
    maxDiffPixelRatio: 0.001,
  });
});
