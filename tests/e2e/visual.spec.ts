import { expect, test, type Page } from "@playwright/test";

const snapshotName = (name: string) => {
  const environment = process.env.PLAYWRIGHT_SNAPSHOT_ENV;

  return environment ? name.replace(".png", `-${environment}.png`) : name;
};

async function freezeChapterDialForFullPageCapture(page: Page) {
  await page.evaluate(() => {
    const rail = document.querySelector<HTMLElement>("[data-chapter-rail]");
    if (!rail || rail.getClientRects().length === 0) return;

    const clone = rail.cloneNode(true) as HTMLElement;
    rail.remove();
    document.body.append(clone);
    clone.style.position = "absolute";
    clone.style.inset = "0 auto auto 0";
    clone.style.width = "100%";
    clone.style.height = `${window.innerHeight}px`;

    const dial = clone.querySelector<HTMLElement>("[data-chapter-dial]");
    if (dial) dial.style.position = "absolute";
  });
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("homepage visual baseline", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await freezeChapterDialForFullPageCapture(page);

  await expect(page).toHaveScreenshot(snapshotName("homepage.png"), {
    animations: "disabled",
    fullPage: true,
    maxDiffPixelRatio: 0.001,
  });
});

test("homepage chapter dial visual states", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop dial only");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);

  const rail = page.locator("[data-chapter-rail]");
  const rotor = rail.locator("[data-chapter-dial-rotor]");
  const rotorRotation = () =>
    rotor.evaluate((element) => {
      const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
      return (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI;
    });
  await rail.evaluate((element) => {
    const content = document.querySelector<HTMLElement>("#about > div");
    if (!content) throw new Error("Homepage content container is missing");
    const width = content.getBoundingClientRect().left - 16;
    element.style.inset = "0 auto auto 0";
    element.style.width = `${width}px`;
    element.style.height = "100vh";
  });

  await page.locator("#about").evaluate((section) => {
    const bounds = section.getBoundingClientRect();
    window.scrollTo(0, window.scrollY + bounds.top + bounds.height / 2 - window.innerHeight / 2);
  });
  await expect(page.getByRole("link", { name: "01 About" })).toHaveAttribute(
    "aria-current",
    "step"
  );
  await expect.poll(rotorRotation).toBeCloseTo(0, 2);
  await expect(rail).toHaveScreenshot(snapshotName("homepage-dial-about.png"), {
    animations: "disabled",
    maxDiffPixels: 50,
  });

  await page.evaluate(() => {
    const about = document.querySelector<HTMLElement>("#about");
    const skills = document.querySelector<HTMLElement>("#skills");
    if (!about || !skills) throw new Error("Chapter sections are missing");
    const center = (section: HTMLElement) => {
      const bounds = section.getBoundingClientRect();
      return window.scrollY + bounds.top + bounds.height / 2;
    };
    window.scrollTo(0, (center(about) + center(skills)) / 2 - window.innerHeight / 2);
  });
  await expect.poll(rotorRotation).toBeCloseTo(-15, 2);
  await expect(rail).toHaveScreenshot(snapshotName("homepage-dial-midpoint.png"), {
    animations: "disabled",
    maxDiffPixels: 50,
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
