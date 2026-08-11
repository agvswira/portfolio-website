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

async function scrollToSectionCenter(page: Page, selector: string) {
  await page.locator(selector).evaluate((section) => {
    const bounds = section.getBoundingClientRect();
    window.scrollTo(0, window.scrollY + bounds.top + bounds.height / 2 - window.innerHeight / 2);
  });
}

async function scrollToAboutHalfEntry(page: Page) {
  await page.locator("#about").evaluate((section) => {
    const bounds = section.getBoundingClientRect();
    window.scrollTo(0, window.scrollY + bounds.top - window.innerHeight / 2);
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

  const states = [
    {
      name: "hero",
      activeName: "01 About",
      rotation: 0,
      scroll: () => page.evaluate(() => window.scrollTo(0, 0)),
    },
    {
      name: "about-half",
      activeName: "01 About",
      rotation: 0,
      scroll: () => scrollToAboutHalfEntry(page),
    },
    {
      name: "about",
      activeName: "01 About",
      rotation: 0,
      scroll: () => scrollToSectionCenter(page, "#about"),
    },
    {
      name: "skills",
      activeName: "02 Skills",
      rotation: -30,
      scroll: () => scrollToSectionCenter(page, "#skills"),
    },
    {
      name: "contact",
      activeName: "05 Contact",
      rotation: -120,
      scroll: () => scrollToSectionCenter(page, "#contact"),
    },
  ];

  for (const state of states) {
    await state.scroll();
    await expect(
      page.locator(`[data-chapter-link][aria-label="${state.activeName}"]`)
    ).toHaveAttribute("aria-current", "step");
    await expect.poll(rotorRotation).toBeCloseTo(state.rotation, 1);
    await expect(rail).toHaveScreenshot(snapshotName(`homepage-dial-${state.name}.png`), {
      animations: "disabled",
      maxDiffPixels: 50,
    });
  }
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
