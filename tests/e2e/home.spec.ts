import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

const vercelConfig = JSON.parse(readFileSync("vercel.json", "utf8")) as {
  headers: Array<{ source: string; headers: Array<{ key: string; value: string }> }>;
};
const contentSecurityPolicy = vercelConfig.headers
  .find(({ source }) => source === "/(.*)")
  ?.headers.find(({ key }) => key === "Content-Security-Policy")?.value;

const chapters = [
  { id: "about", name: "01 About" },
  { id: "skills", name: "02 Skills" },
  { id: "projects", name: "03 Projects" },
  { id: "blog", name: "04 Blog" },
  { id: "contact", name: "05 Contact" },
] as const;

async function scrollToSectionCenter(page: Page, selector: string) {
  await page.locator(selector).evaluate((section) => {
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    const bounds = section.getBoundingClientRect();
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, window.scrollY + bounds.top + bounds.height / 2 - window.innerHeight / 2);
    root.style.scrollBehavior = previousBehavior;
  });
}

async function scrollToAboutRevealProgress(page: Page, progress: number) {
  await page.locator("#about").evaluate((section, revealProgress) => {
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    const bounds = section.getBoundingClientRect();
    const absoluteTop = window.scrollY + bounds.top;
    const revealStart = absoluteTop - window.innerHeight * 0.75;
    const revealEnd = absoluteTop + bounds.height / 2 - window.innerHeight / 2;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, revealStart + (revealEnd - revealStart) * revealProgress);
    root.style.scrollBehavior = previousBehavior;
  }, progress);
}

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

test("chapter dial stays hidden and outside keyboard navigation in the hero", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "desktop project only");
  await page.goto("/");

  const rail = page.locator("[data-chapter-rail]");
  await expect(rail).toBeHidden();
  await expect(rail).toHaveAttribute("aria-hidden", "true");
  await expect(rail).toHaveAttribute("inert", "");

  const focusedChapterLinks: string[] = [];
  for (let index = 0; index < 30; index += 1) {
    await page.keyboard.press("Tab");
    const focusedHref = await page.evaluate(() => {
      const focused = document.activeElement as HTMLElement | null;
      return focused?.matches("[data-chapter-link]") ? focused.getAttribute("href") : null;
    });
    if (focusedHref) focusedChapterLinks.push(focusedHref);
  }
  expect(focusedChapterLinks).toEqual([]);
});

test("chapter dial fades in with About and hides again when returning to the hero", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "desktop project only");
  await page.goto("/");

  const rail = page.locator("[data-chapter-rail]");
  const rotor = rail.locator("[data-chapter-dial-rotor]");
  const opacity = () =>
    rail.evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity));

  await scrollToAboutRevealProgress(page, 0);
  await expect.poll(opacity).toBeCloseTo(0, 2);
  await expect(rail).toHaveAttribute("aria-hidden", "true");

  await scrollToAboutRevealProgress(page, 0.5);
  await expect(rail).not.toHaveAttribute("aria-hidden");
  await expect(rail).not.toHaveAttribute("inert");
  await expect(rail).toBeVisible();
  await expect.poll(opacity).toBeCloseTo(0.5, 2);

  await scrollToSectionCenter(page, "#about");
  await expect.poll(opacity).toBeCloseTo(1, 2);
  await expect(rail.getByRole("link", { name: "01 About" })).toHaveAttribute("tabindex", "0");
  await expect
    .poll(() =>
      rotor.evaluate((element) => {
        const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
        return (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI;
      })
    )
    .toBeCloseTo(0, 1);

  await scrollToAboutRevealProgress(page, 0.5);
  await expect(rail).toBeVisible();
  await expect.poll(opacity).toBeCloseTo(0.5, 2);

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(rail).toHaveAttribute("aria-hidden", "true");
  await expect(rail).toHaveAttribute("inert", "");
  await expect(rail).toBeHidden();
  await expect.poll(opacity).toBeCloseTo(0, 2);
});

test("chapter numbers inherit the site font family", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop project only");
  await page.goto("/");
  await scrollToSectionCenter(page, "#about");

  const fontFamilies = await page.evaluate(() => {
    const label = document.querySelector<HTMLElement>("[data-chapter-label]");
    if (!label) throw new Error("Chapter label is missing");
    return {
      body: getComputedStyle(document.body).fontFamily,
      label: getComputedStyle(label).fontFamily,
    };
  });
  const genericFamilies = fontFamilies.label
    .split(",")
    .map((family) => family.trim().replaceAll('"', "").toLowerCase());

  expect(fontFamilies.label).toBe(fontFamilies.body);
  expect(genericFamilies).not.toContain("monospace");
  expect(genericFamilies).not.toContain("serif");
});

test("chapter numbers are never lighter than the body text", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop project only");
  await page.goto("/");
  await scrollToSectionCenter(page, "#about");

  const weights = await page.evaluate(() => {
    return {
      body: Number.parseInt(getComputedStyle(document.body).fontWeight, 10),
      labels: Array.from(document.querySelectorAll<HTMLElement>("[data-chapter-label]")).map(
        (label) => Number.parseInt(getComputedStyle(label).fontWeight, 10)
      ),
    };
  });

  expect(weights.labels).toHaveLength(5);
  for (const labelWeight of weights.labels) {
    expect(labelWeight).toBeGreaterThanOrEqual(weights.body);
  }
});

test("desktop chapter dial keeps one fixed indicator through every scroll state", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "desktop project only");
  await page.goto("/");

  const rail = page.locator("[data-chapter-rail]");
  const dot = rail.locator("[data-chapter-dot]");
  await scrollToSectionCenter(page, "#about");
  await expect(rail).toBeVisible();
  await expect(rail.getByRole("link")).toHaveCount(5);
  await expect(rail.locator("[data-chapter-dial-rotor]")).toBeVisible();
  await expect(rail.locator("[data-chapter-label]")).toHaveCount(5);
  await expect(dot).toHaveCount(1);
  expect(await rail.evaluate((element) => getComputedStyle(element).position)).toBe("fixed");
  expect(
    await rail
      .locator("[data-chapter-dial]")
      .evaluate((element) => getComputedStyle(element).position)
  ).toBe("fixed");

  const initialDot = await dot.boundingBox();
  expect(initialDot).not.toBeNull();

  for (const chapter of chapters) {
    await scrollToSectionCenter(page, `#${chapter.id}`);
    await expect(rail.getByRole("link", { name: chapter.name })).toHaveAttribute(
      "aria-current",
      "step"
    );

    const bounds = await dot.boundingBox();
    expect(bounds, `dot bounds at #${chapter.id}`).not.toBeNull();
    expect(
      Math.abs((bounds?.x ?? 0) - (initialDot?.x ?? 0)),
      `dot x at #${chapter.id}`
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs((bounds?.y ?? 0) - (initialDot?.y ?? 0)),
      `dot y at #${chapter.id}`
    ).toBeLessThanOrEqual(1);
  }

  const contactLink = rail.getByRole("link", { name: "05 Contact" });
  await contactLink.click();
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.locator("#contact")).toBeInViewport();
});

test("chapter progress clamps and angular distance controls visibility", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "desktop project only");
  await page.goto("/");

  const rail = page.locator("[data-chapter-rail]");
  const rotor = rail.locator("[data-chapter-dial-rotor]");
  const rotorRotation = () =>
    rotor.evaluate((element) => {
      const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
      return (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI;
    });

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect.poll(rotorRotation).toBeCloseTo(0, 1);
  await expect(rail.locator('[data-chapter-link][href="#about"]')).toHaveAttribute(
    "aria-current",
    "step"
  );

  await scrollToSectionCenter(page, "#about");
  await expect(rail.getByRole("link", { name: "01 About" })).toHaveAttribute(
    "aria-current",
    "step"
  );
  const aboutStyles = await rail.locator("[data-chapter-link]").evaluateAll((links) =>
    links.map((link) => ({
      opacity: Number.parseFloat(getComputedStyle(link).opacity),
      pointerEvents: getComputedStyle(link).pointerEvents,
    }))
  );
  aboutStyles.forEach(({ opacity }, index) => {
    expect(opacity).toBeCloseTo([1, 0.45, 0.2, 0.08, 0][index] ?? 0, 4);
  });
  expect(aboutStyles[4]?.pointerEvents).toBe("none");
  await expect(rail.getByRole("link", { name: "05 Contact" })).toHaveAttribute("tabindex", "-1");

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect.poll(rotorRotation).toBeCloseTo(-120, 1);
  await expect(rail.getByRole("link", { name: "05 Contact" })).toHaveAttribute(
    "aria-current",
    "step"
  );
});

test("chapter dial never leaves keyboard focus on a hidden step", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop project only");
  await page.goto("/");

  const rail = page.getByRole("navigation", { name: "Bab halaman" });
  const aboutLink = rail.getByRole("link", { name: "01 About" });
  await scrollToSectionCenter(page, "#about");
  await aboutLink.focus();
  await expect(aboutLink).toBeFocused();

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(rail.getByRole("link", { name: "05 Contact" })).toHaveAttribute(
    "aria-current",
    "step"
  );

  const focusedState = await page.evaluate(() => {
    const focused = document.activeElement as HTMLElement | null;
    return {
      isChapterLink: focused?.matches("[data-chapter-link]") ?? false,
      opacity: focused ? Number.parseFloat(getComputedStyle(focused).opacity) : 0,
      pointerEvents: focused ? getComputedStyle(focused).pointerEvents : "none",
      tabIndex: focused?.tabIndex ?? -1,
    };
  });
  expect(focusedState).toEqual({
    isChapterLink: true,
    opacity: expect.any(Number),
    pointerEvents: "auto",
    tabIndex: 0,
  });
  expect(focusedState.opacity).toBeGreaterThan(0);
});

test("chapter labels remain upright and crossfade at fractional progress", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "desktop project only");
  await page.goto("/");

  const rail = page.getByRole("navigation", { name: "Bab halaman" });
  const rotor = rail.locator("[data-chapter-dial-rotor]");

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
  const renderedState = await rail.locator("[data-step-index]").evaluateAll((steps) => {
    const getRotation = (element: Element) => {
      const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
      return (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI;
    };
    const rotor = document.querySelector<HTMLElement>("[data-chapter-dial-rotor]");
    if (!rotor) throw new Error("Chapter rotor is missing");
    const rotorRotation = getRotation(rotor);
    return steps.map((step) => {
      const label = step.querySelector<HTMLElement>("[data-chapter-label]");
      const link = step.querySelector<HTMLElement>("[data-chapter-link]");
      const number = step.querySelector<HTMLElement>(".chapter-dial-number");
      if (!label || !link || !number) throw new Error("Chapter label is incomplete");
      const effectiveRotation = rotorRotation + getRotation(step) + getRotation(label);
      return {
        fontSize: Number.parseFloat(getComputedStyle(number).fontSize),
        opacity: Number.parseFloat(getComputedStyle(link).opacity),
        orientationError: Math.abs(((effectiveRotation + 180) % 360) - 180),
      };
    });
  });
  for (const { orientationError } of renderedState) {
    expect(orientationError).toBeLessThanOrEqual(0.5);
  }

  const expectedMidpointFontSize =
    (Math.max(16.8, Math.min(16 * 1.25, 12.8 * 1.3)) + Math.max(24, Math.min(32, 12.8 * 1.9))) / 2;
  expect(renderedState[0]?.opacity).toBeCloseTo(0.725, 2);
  expect(renderedState[1]?.opacity).toBeCloseTo(0.725, 2);
  expect(renderedState[0]?.fontSize).toBeCloseTo(expectedMidpointFontSize, 1);
  expect(renderedState[1]?.fontSize).toBeCloseTo(expectedMidpointFontSize, 1);
  await expect(rail.getByRole("link", { name: "02 Skills" })).toHaveAttribute(
    "aria-current",
    "step"
  );
});

test("chapter dial renders the frost ring and fixed halo", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop project only");
  await page.goto("/");

  const styles = await page.evaluate(() => {
    const rotor = document.querySelector<HTMLElement>("[data-chapter-dial-rotor]");
    const dot = document.querySelector<HTMLElement>("[data-chapter-dot]");
    if (!rotor || !dot) throw new Error("Chapter dial is missing");
    const rotorStyle = getComputedStyle(rotor);
    const highlightStyle = getComputedStyle(rotor, "::before");
    const dotStyle = getComputedStyle(dot);

    return {
      borderColor: rotorStyle.borderTopColor,
      dotBoxShadow: dotStyle.boxShadow,
      dotHeight: Number.parseFloat(dotStyle.height),
      dotWidth: Number.parseFloat(dotStyle.width),
      highlightBackground: highlightStyle.backgroundImage,
    };
  });

  expect(styles.borderColor).toBe("rgba(136, 192, 208, 0.22)");
  expect(styles.highlightBackground).toContain("conic-gradient");
  expect(styles.dotWidth).toBe(7);
  expect(styles.dotHeight).toBe(7);
  expect(styles.dotBoxShadow).toContain("rgba(136, 192, 208, 0.12) 0px 0px 0px 6px");
  expect(styles.dotBoxShadow).toContain("rgba(136, 192, 208, 0.45) 0px 0px 22px 0px");
});

test("visible chapter labels keep measured radial space outside the ring", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "desktop project only");
  await page.goto("/");

  for (const chapterId of ["about", "skills", "contact"]) {
    await scrollToSectionCenter(page, `#${chapterId}`);

    const geometry = await page.evaluate(() => {
      const dial = document.querySelector<HTMLElement>("[data-chapter-dial]");
      if (!dial) throw new Error("Chapter dial is missing");

      const ring = dial.getBoundingClientRect();
      const center = {
        x: ring.left + ring.width / 2,
        y: ring.top + ring.height / 2,
      };
      const radius = Math.min(ring.width, ring.height) / 2;

      const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
      return {
        expectedGap: Math.min(
          Math.max(rootFontSize * 0.875, window.innerWidth * 0.011),
          rootFontSize * 1.25
        ),
        gaps: Array.from(document.querySelectorAll<HTMLElement>("[data-chapter-label]"))
          .filter((label) => {
            const link = label.closest<HTMLElement>("[data-chapter-link]");
            return link && Number.parseFloat(getComputedStyle(link).opacity) > 0;
          })
          .map((label) => {
            const bounds = label.getBoundingClientRect();
            const closestX = Math.min(Math.max(center.x, bounds.left), bounds.right);
            const closestY = Math.min(Math.max(center.y, bounds.top), bounds.bottom);
            return Math.hypot(closestX - center.x, closestY - center.y) - radius;
          }),
      };
    });

    expect(geometry.gaps.length, `visible labels at #${chapterId}`).toBeGreaterThanOrEqual(3);
    for (const gap of geometry.gaps) {
      expect(gap, `radial label gap at #${chapterId}`).toBeGreaterThanOrEqual(
        geometry.expectedGap - 0.5
      );
    }
  }
});

test("desktop chapter dial stays clear of the content gutter", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop project only");

  for (const width of [1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");

    for (const chapter of chapters) {
      await scrollToSectionCenter(page, `#${chapter.id}`);
      await expect(page.getByRole("link", { name: chapter.name })).toHaveAttribute(
        "aria-current",
        "step"
      );

      const geometry = await page.evaluate(() => {
        const content = document.querySelector<HTMLElement>("#about > div");
        const candidates = Array.from(
          document.querySelectorAll<HTMLElement>("[data-chapter-label], [data-chapter-dot]")
        ).filter((element) => {
          if (element.matches("[data-chapter-dot]")) return true;
          const link = element.closest<HTMLElement>("[data-chapter-link]");
          return link && Number.parseFloat(getComputedStyle(link).opacity) > 0;
        });
        if (!content || candidates.length === 0) throw new Error("Chapter geometry is missing");

        return {
          contentLeft: content.getBoundingClientRect().left,
          visualRight: Math.max(
            ...candidates.map((element) => element.getBoundingClientRect().right)
          ),
        };
      });

      expect(
        geometry.visualRight,
        `${width}px at #${chapter.id}: dial right ${geometry.visualRight}, content left ${geometry.contentLeft}`
      ).toBeLessThanOrEqual(geometry.contentLeft - 16);
    }
  }
});

test("chapter dial follows the content gutter on ultrawide screens", async ({ page, isMobile }) => {
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
  expect((rotorBounds?.x ?? 0) + (rotorBounds?.width ?? 0)).toBeCloseTo(660, 0);
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

test("chapter dial stays hidden below the desktop breakpoint", async ({ page, isMobile }) => {
  test.skip(isMobile, "covered by the desktop breakpoint boundary");
  await page.setViewportSize({ width: 1023, height: 768 });
  await page.goto("/");
  const rail = page.locator("[data-chapter-rail]");
  await expect(rail).toBeHidden();

  await page.setViewportSize({ width: 1024, height: 768 });
  await scrollToSectionCenter(page, "#about");
  await expect(rail).toBeVisible();
});

test("reduced motion disables continuous homepage animation", async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const duration = await page
    .locator("[data-marquee]")
    .evaluate((element) => getComputedStyle(element).animationDuration);
  expect(duration).toBe("0s");

  if (isMobile) return;

  const rail = page.locator("[data-chapter-rail]");
  await expect(rail).toBeHidden();
  await expect(rail).toHaveAttribute("aria-hidden", "true");
  await expect(rail).toHaveAttribute("inert", "");

  await scrollToAboutRevealProgress(page, 0.5);
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
  const reducedVisibility = await rail.evaluate((element) => ({
    ariaHidden: element.getAttribute("aria-hidden"),
    inert: element.hasAttribute("inert"),
    opacity: Number.parseFloat(getComputedStyle(element).opacity),
  }));
  expect(reducedVisibility).toMatchObject({ ariaHidden: null, inert: false });
  expect(reducedVisibility.opacity).toBeCloseTo(0.5, 3);

  const railPosition = await page
    .locator("[data-chapter-rail]")
    .evaluate((element) => getComputedStyle(element).position);
  expect(railPosition).toBe("fixed");

  const visibilityTransition = await rail.evaluate((element) =>
    getComputedStyle(element)
      .transitionDuration.split(",")
      .map((duration) => Number.parseFloat(duration) * (duration.includes("ms") ? 0.001 : 1))
  );
  expect(Math.max(...visibilityTransition)).toBeLessThanOrEqual(0.01);

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
