import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

import { shouldRunMotion } from "@/lib/ui-state";

const CHAPTER_STEP_ANGLE = 30;

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

function setActiveChapter(links: HTMLAnchorElement[], activeIndex: number): void {
  links.forEach((link, index) => {
    if (index === activeIndex) {
      link.setAttribute("aria-current", "step");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function getChapterProgress(chapters: HTMLElement[]): number {
  const lastIndex = chapters.length - 1;
  if (lastIndex < 1) return 0;

  const viewportCenter = window.scrollY + window.innerHeight * 0.5;
  const centers = chapters.map((chapter) => {
    const bounds = chapter.getBoundingClientRect();
    return window.scrollY + bounds.top + bounds.height * 0.5;
  });

  if (viewportCenter <= centers[0]) return 0;
  if (viewportCenter >= centers[lastIndex]) return lastIndex;

  for (let index = 0; index < centers.length - 1; index += 1) {
    const start = centers[index];
    const end = centers[index + 1];
    if (viewportCenter <= end) {
      const segmentProgress = end === start ? 0 : (viewportCenter - start) / (end - start);
      return clamp(index + segmentProgress, 0, lastIndex);
    }
  }

  return lastIndex;
}

function getChapterOpacity(distance: number): number {
  if (distance > 3) return 0;
  if (distance <= 1) return 1 - distance * 0.55;
  if (distance <= 2) return 0.45 - (distance - 1) * 0.25;
  return 0.2 - (distance - 2) * 0.12;
}

function getChapterFontSizes(): { active: number; inactive: number } {
  const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  const viewportUnit = window.innerWidth / 100;

  return {
    active: clamp(1.9 * viewportUnit, 1.5 * rootFontSize, 2 * rootFontSize),
    inactive: clamp(1.3 * viewportUnit, 1.05 * rootFontSize, 1.25 * rootFontSize),
  };
}

function getChapterLabelGap(): number {
  const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  return clamp(window.innerWidth * 0.011, rootFontSize * 0.875, rootFontSize * 1.25);
}

function getChapterLabelOffset(
  anchorRadius: number,
  ringRadius: number,
  labelHeight: number,
  relativeAngle: number,
  gap: number
): number {
  const radians = (relativeAngle * Math.PI) / 180;
  const sine = Math.abs(Math.sin(radians));
  const cosine = Math.abs(Math.cos(radians));
  const targetRadius = ringRadius + gap;
  const halfHeight = labelHeight / 2;
  const horizontalIntersection = cosine > 0 ? targetRadius / cosine : Number.POSITIVE_INFINITY;

  if (horizontalIntersection * sine <= halfHeight) {
    return Math.max(gap, horizontalIntersection - anchorRadius);
  }

  const radialDistance =
    (labelHeight * sine + Math.sqrt(4 * targetRadius ** 2 - labelHeight ** 2 * cosine ** 2)) / 2;
  return Math.max(gap, radialDistance - anchorRadius);
}

function updateChapterPresentation(
  links: HTMLAnchorElement[],
  numbers: HTMLElement[],
  rotor: HTMLElement,
  progress: number
): void {
  const renderedProgress = clamp(progress, 0, links.length - 1);
  const activeIndex = Math.round(renderedProgress + Number.EPSILON);
  const fontSizes = getChapterFontSizes();
  const labelGap = getChapterLabelGap();
  const anchorRadius = rotor.clientWidth / 2;
  const ringRadius = rotor.offsetWidth / 2;
  const focusedLink = links.find((link) => link === document.activeElement);

  setActiveChapter(links, activeIndex);
  links.forEach((link, index) => {
    const distance = Math.abs(index - renderedProgress);
    const emphasis = Math.max(0, 1 - distance);
    const fontSize = fontSizes.inactive + (fontSizes.active - fontSizes.inactive) * emphasis;
    const opacity = getChapterOpacity(distance);
    const hidden = opacity < 0.05;

    link.style.opacity = String(opacity);
    link.style.pointerEvents = hidden ? "none" : "auto";
    link.tabIndex = hidden ? -1 : 0;
    if (hidden) {
      link.setAttribute("aria-hidden", "true");
    } else {
      link.removeAttribute("aria-hidden");
    }
    numbers[index]?.style.setProperty("font-size", `${fontSize}px`);

    const labelHeight = numbers[index]?.getBoundingClientRect().height ?? 0;
    const relativeAngle = (index - renderedProgress) * CHAPTER_STEP_ANGLE;
    const labelOffset = getChapterLabelOffset(
      anchorRadius,
      ringRadius,
      labelHeight,
      relativeAngle,
      labelGap
    );
    link.style.setProperty("--chapter-label-offset", `${labelOffset}px`);
  });

  if (focusedLink?.tabIndex === -1) {
    links[activeIndex]?.focus({ preventScroll: true });
  }
}

function getChapterElements() {
  const rail = document.querySelector<HTMLElement>("[data-chapter-rail]");
  const dial = document.querySelector<HTMLElement>("[data-chapter-dial]");
  const rotor = document.querySelector<HTMLElement>("[data-chapter-dial-rotor]");
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-chapter-link]"));
  const entries = links.flatMap((link) => {
    const chapter = document.querySelector<HTMLElement>(link.hash);
    const label = link.querySelector<HTMLElement>("[data-chapter-label]");
    const number = link.querySelector<HTMLElement>(".chapter-dial-number");
    const dot = link
      .closest<HTMLElement>("[data-step-index]")
      ?.querySelector<HTMLElement>("[data-chapter-dot]");
    return chapter && dot && label && number ? [{ chapter, dot, label, link, number }] : [];
  });

  if (!dial || !rail || !rotor || entries.length !== links.length || entries.length === 0) {
    return null;
  }

  return {
    dial,
    rail,
    rotor,
    links: entries.map(({ link }) => link),
    dots: entries.map(({ dot }) => dot),
    labels: entries.map(({ label }) => label),
    numbers: entries.map(({ number }) => number),
    chapters: entries.map(({ chapter }) => chapter),
  };
}

function getDocumentCenter(element: HTMLElement): number {
  const bounds = element.getBoundingClientRect();
  return window.scrollY + bounds.top + bounds.height / 2;
}

function waitForChapterLayoutAssets(): Promise<void> {
  const images = Array.from(document.querySelectorAll<HTMLImageElement>("#hero img, #about img"));
  const imagePromises = images.map((image) => {
    if (image.complete) return image.decode().catch(() => undefined);
    return new Promise<void>((resolve) => {
      image.addEventListener("load", () => resolve(), { once: true });
      image.addEventListener("error", () => resolve(), { once: true });
    });
  });

  return Promise.all([document.fonts.ready, ...imagePromises]).then(() => undefined);
}

function setRailInert(rail: HTMLElement, dialTop: number, dialHeight: number): void {
  const outsideViewport = dialTop >= window.innerHeight || dialTop + dialHeight <= 0;

  if (
    outsideViewport &&
    rail.contains(document.activeElement) &&
    document.activeElement instanceof HTMLElement
  ) {
    document.activeElement.blur();
  }
  rail.toggleAttribute("inert", outsideViewport);
}

function initChapterDial(reducedMotion: boolean): () => void {
  const elements = getChapterElements();
  if (!elements) return () => undefined;

  const { chapters, dial, dots, labels, links, numbers, rail, rotor } = elements;
  const about = chapters[0];
  const contact = chapters.at(-1);
  if (!about || !contact) return () => undefined;

  let aboutCenterDocY = getDocumentCenter(about);
  let contactCenterDocY = getDocumentCenter(contact);
  let activeDotIndex = -1;
  let dotTimeline: gsap.core.Timeline | null = null;
  let active = true;

  const measureAnchors = () => {
    aboutCenterDocY = getDocumentCenter(about);
    contactCenterDocY = getDocumentCenter(contact);
  };
  const positionDial = () => {
    const viewportCenter = window.innerHeight / 2;
    const centerY = Math.min(
      Math.max(viewportCenter, aboutCenterDocY - window.scrollY),
      contactCenterDocY - window.scrollY
    );
    const dialHeight = dial.offsetHeight;
    const dialTop = centerY - dialHeight / 2;

    dial.style.transform = `translate3d(0, ${dialTop}px, 0)`;
    setRailInert(rail, dialTop, dialHeight);
  };
  const reconcileDots = (activeIndex: number) => {
    dots.forEach((dot, index) => {
      gsap.set(dot, { opacity: index === activeIndex ? 1 : 0 });
    });
  };
  const updateActiveDot = (nextIndex: number) => {
    if (nextIndex === activeDotIndex) return;

    const previousIndex = activeDotIndex;
    activeDotIndex = nextIndex;
    dotTimeline?.kill();
    gsap.killTweensOf(dots);

    if (reducedMotion || previousIndex < 0) {
      reconcileDots(nextIndex);
      return;
    }

    dots.forEach((dot, index) => {
      if (index !== previousIndex && index !== nextIndex) gsap.set(dot, { opacity: 0 });
    });
    const previousDot = dots[previousIndex];
    const nextDot = dots[nextIndex];
    if (!previousDot || !nextDot) {
      reconcileDots(nextIndex);
      return;
    }

    gsap.set(nextDot, { opacity: 0 });
    dotTimeline = gsap
      .timeline({ onComplete: () => reconcileDots(nextIndex) })
      .to(previousDot, { duration: 0.25, ease: "none", opacity: 0, overwrite: "auto" }, 0)
      .to(nextDot, { duration: 0.25, ease: "none", opacity: 1, overwrite: "auto" }, 0.125);
  };
  const renderPresentation = (renderedProgress: number, counterRotation: number) => {
    labels.forEach((label, index) => {
      label.style.transform = `rotate(${counterRotation - index * CHAPTER_STEP_ANGLE}deg)`;
    });
    rotor.style.setProperty(
      "--chapter-highlight-angle",
      `${renderedProgress * CHAPTER_STEP_ANGLE}deg`
    );
    updateChapterPresentation(links, numbers, rotor, renderedProgress);
    updateActiveDot(Math.round(renderedProgress + Number.EPSILON));
  };

  const rotateRotor = reducedMotion
    ? null
    : gsap.quickTo(rotor, "rotation", {
        duration: 0.35,
        ease: "power2.out",
        onUpdate: () => {
          const rotation = Number(gsap.getProperty(rotor, "rotation"));
          const renderedProgress = clamp(-rotation / CHAPTER_STEP_ANGLE, 0, chapters.length - 1);
          renderPresentation(renderedProgress, -rotation);
        },
      });
  const updateDial = () => {
    const progress = getChapterProgress(chapters);

    positionDial();
    if (reducedMotion) {
      const activeIndex = Math.round(progress + Number.EPSILON);
      const angle = activeIndex * CHAPTER_STEP_ANGLE;
      rail.style.setProperty("--chapter-rotor-angle", `${-angle}deg`);
      renderPresentation(activeIndex, angle);
    } else {
      rotateRotor?.(-progress * CHAPTER_STEP_ANGLE);
    }
  };

  const dialTrigger = ScrollTrigger.create({
    start: 0,
    end: "max",
    invalidateOnRefresh: true,
    onRefreshInit: measureAnchors,
    onRefresh: () => {
      measureAnchors();
      updateDial();
    },
    onUpdate: updateDial,
  });

  measureAnchors();
  updateDial();
  if (!reducedMotion) renderPresentation(0, 0);
  void waitForChapterLayoutAssets().then(() => {
    if (!active) return;
    window.requestAnimationFrame(() => {
      if (active) ScrollTrigger.refresh();
    });
  });

  return () => {
    active = false;
    dialTrigger.kill();
    dotTimeline?.kill();
    gsap.killTweensOf([rotor, ...dots]);
    gsap.set(rotor, { clearProps: "transform" });
    dial.style.removeProperty("transform");
    rail.style.removeProperty("--chapter-rotor-angle");
    rail.removeAttribute("inert");
    rotor.style.removeProperty("--chapter-highlight-angle");
    labels.forEach((label) => label.style.removeProperty("transform"));
    links.forEach((link) => {
      link.style.removeProperty("opacity");
      link.style.removeProperty("pointer-events");
      link.style.removeProperty("--chapter-label-offset");
      link.removeAttribute("aria-hidden");
      link.removeAttribute("tabindex");
    });
    dots.forEach((dot) => dot.style.removeProperty("opacity"));
    numbers.forEach((number) => number.style.removeProperty("font-size"));
  };
}

export function initMotion(): void {
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();

  media.add(
    {
      desktop: "(min-width: 768px)",
      noReduce: "(prefers-reduced-motion: no-preference)",
    },
    (context) => {
      const conditions = context.conditions as { desktop: boolean; noReduce: boolean };
      if (
        !shouldRunMotion({
          mobile: !conditions.desktop,
          reducedMotion: !conditions.noReduce,
        })
      ) {
        return;
      }

      const hero = document.querySelector<HTMLElement>("#hero");
      if (hero) {
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "+=120%",
            scrub: true,
            pin: true,
            anticipatePin: 1,
          },
        });
        timeline.to("[data-hero-sky]", { yPercent: -5, ease: "none" }, 0);
        timeline.to("[data-mountain='far']", { yPercent: -15, scale: 1.04, ease: "none" }, 0);
        timeline.to("[data-mountain='mid']", { yPercent: -35, ease: "none" }, 0);
        timeline.to("[data-mountain='near']", { yPercent: -70, opacity: 0.4, ease: "none" }, 0);
        timeline.to("[data-hero-content]", { yPercent: -20, opacity: 0, ease: "none" }, 0);
      }

      for (const element of gsap.utils.toArray<HTMLElement>("[data-reveal]")) {
        gsap.from(element, {
          y: 28,
          opacity: 0,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: { trigger: element, start: "top 88%", once: true },
        });
      }

      void document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
  );

  media.add(
    {
      chapterDesktop: "(min-width: 1024px)",
      noReduce: "(prefers-reduced-motion: no-preference)",
    },
    (context) => {
      const conditions = context.conditions as { chapterDesktop: boolean; noReduce: boolean };
      if (!conditions.chapterDesktop) return;
      return initChapterDial(!conditions.noReduce);
    }
  );
}
