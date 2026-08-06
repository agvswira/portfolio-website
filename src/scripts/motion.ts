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

function getChapterRailVisibility(about: HTMLElement): number {
  const bounds = about.getBoundingClientRect();
  const revealStart = window.innerHeight * 0.75;
  const revealEnd = window.innerHeight * 0.5 - bounds.height * 0.5;
  const revealDistance = revealStart - revealEnd;

  if (revealDistance <= 0) return bounds.top <= revealStart ? 1 : 0;
  return clamp((revealStart - bounds.top) / revealDistance, 0, 1);
}

function setChapterRailAccessibility(rail: HTMLElement, visible: boolean): void {
  if (visible) {
    rail.style.visibility = "visible";
    rail.removeAttribute("aria-hidden");
    rail.removeAttribute("inert");
    return;
  }

  if (rail.contains(document.activeElement) && document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  rail.style.visibility = "hidden";
  rail.setAttribute("aria-hidden", "true");
  rail.setAttribute("inert", "");
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

function updateChapterPresentation(
  links: HTMLAnchorElement[],
  numbers: HTMLElement[],
  progress: number
): void {
  const renderedProgress = clamp(progress, 0, links.length - 1);
  const activeIndex = Math.round(renderedProgress + Number.EPSILON);
  const fontSizes = getChapterFontSizes();
  const focusedLink = links.find((link) => link === document.activeElement);

  setActiveChapter(links, activeIndex);
  links.forEach((link, index) => {
    const distance = Math.abs(index - renderedProgress);
    const emphasis = Math.max(0, 1 - distance);
    const angularlyVisible = distance <= 3;
    const fontSize = fontSizes.inactive + (fontSizes.active - fontSizes.inactive) * emphasis;

    link.style.opacity = String(getChapterOpacity(distance));
    link.style.pointerEvents = angularlyVisible ? "auto" : "none";
    numbers[index]?.style.setProperty("font-size", `${fontSize}px`);

    const bounds = link.getBoundingClientRect();
    const intersectsViewport =
      bounds.right > 0 &&
      bounds.left < window.innerWidth &&
      bounds.bottom > 0 &&
      bounds.top < window.innerHeight;
    link.tabIndex = angularlyVisible && intersectsViewport ? 0 : -1;
  });

  if (focusedLink?.tabIndex === -1) {
    links[activeIndex]?.focus({ preventScroll: true });
  }
}

function getChapterElements() {
  const rail = document.querySelector<HTMLElement>("[data-chapter-rail]");
  const rotor = document.querySelector<HTMLElement>("[data-chapter-dial-rotor]");
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-chapter-link]"));
  const entries = links.flatMap((link) => {
    const chapter = document.querySelector<HTMLElement>(link.hash);
    const label = link.querySelector<HTMLElement>("[data-chapter-label]");
    const number = link.querySelector<HTMLElement>(".chapter-dial-number");
    return chapter && label && number ? [{ chapter, label, link, number }] : [];
  });

  if (!rail || !rotor || entries.length !== links.length || entries.length === 0) return null;

  return {
    rail,
    rotor,
    links: entries.map(({ link }) => link),
    labels: entries.map(({ label }) => label),
    numbers: entries.map(({ number }) => number),
    chapters: entries.map(({ chapter }) => chapter),
  };
}

function initReducedChapterDial(): () => void {
  const elements = getChapterElements();
  if (!elements) return () => undefined;

  const { chapters, labels, links, numbers, rail, rotor } = elements;

  let frame = 0;
  const update = () => {
    frame = 0;
    const progress = getChapterProgress(chapters);
    const visibility = getChapterRailVisibility(chapters[0]);
    const activeIndex = Math.round(progress);
    const angle = activeIndex * CHAPTER_STEP_ANGLE;

    rail.style.opacity = String(visibility);
    setChapterRailAccessibility(rail, visibility > 0);
    rail.style.setProperty("--chapter-rotor-angle", `${-angle}deg`);
    rail.style.setProperty("--chapter-label-angle", `${angle}deg`);
    rotor.style.setProperty("--chapter-highlight-angle", `${angle}deg`);
    updateChapterPresentation(links, numbers, activeIndex);
  };
  const requestUpdate = () => {
    if (frame === 0) frame = window.requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);

  return () => {
    if (frame !== 0) window.cancelAnimationFrame(frame);
    window.removeEventListener("scroll", requestUpdate);
    window.removeEventListener("resize", requestUpdate);
    rail.style.removeProperty("--chapter-rotor-angle");
    rail.style.removeProperty("--chapter-label-angle");
    rail.style.removeProperty("opacity");
    rail.style.removeProperty("visibility");
    setChapterRailAccessibility(rail, false);
    rotor.style.removeProperty("--chapter-highlight-angle");
    labels.forEach((label) => label.style.removeProperty("transform"));
    links.forEach((link) => {
      link.style.removeProperty("opacity");
      link.style.removeProperty("pointer-events");
      link.removeAttribute("tabindex");
    });
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
      if (!conditions.noReduce) return initReducedChapterDial();

      const elements = getChapterElements();
      if (!elements) return;

      const { chapters, labels, links, numbers, rail, rotor } = elements;

      let railVisibilityTarget = 0;

      const updateRenderedState = () => {
        const rotation = Number(gsap.getProperty(rotor, "rotation"));
        const renderedProgress = clamp(-rotation / CHAPTER_STEP_ANGLE, 0, chapters.length - 1);
        const counterRotation = -rotation;

        labels.forEach((label, index) => {
          label.style.transform = `rotate(${counterRotation - index * CHAPTER_STEP_ANGLE}deg)`;
        });
        rotor.style.setProperty(
          "--chapter-highlight-angle",
          `${renderedProgress * CHAPTER_STEP_ANGLE}deg`
        );
        updateChapterPresentation(links, numbers, renderedProgress);
      };
      const rotateRotor = gsap.quickTo(rotor, "rotation", {
        duration: 0.35,
        ease: "power2.out",
        onUpdate: updateRenderedState,
      });
      const fadeRail = gsap.quickTo(rail, "opacity", {
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          if (railVisibilityTarget === 0) setChapterRailAccessibility(rail, false);
        },
      });
      const updateDial = () => {
        const progress = getChapterProgress(chapters);
        const visibility = getChapterRailVisibility(chapters[0]);

        railVisibilityTarget = visibility;
        if (visibility > 0) setChapterRailAccessibility(rail, true);
        fadeRail(visibility);
        rotateRotor(-progress * CHAPTER_STEP_ANGLE);
      };

      const dialTrigger = ScrollTrigger.create({
        start: 0,
        end: "max",
        invalidateOnRefresh: true,
        onRefresh: updateDial,
        onUpdate: updateDial,
      });

      updateDial();
      updateRenderedState();

      return () => {
        dialTrigger.kill();
        gsap.killTweensOf([rail, rotor]);
        gsap.set(rotor, { clearProps: "transform" });
        gsap.set(rail, { clearProps: "opacity,visibility" });
        setChapterRailAccessibility(rail, false);
        rotor.style.removeProperty("--chapter-highlight-angle");
        labels.forEach((label) => label.style.removeProperty("transform"));
        links.forEach((link) => {
          link.style.removeProperty("opacity");
          link.style.removeProperty("pointer-events");
          link.removeAttribute("tabindex");
        });
        numbers.forEach((number) => number.style.removeProperty("font-size"));
      };
    }
  );
}
