import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

import { shouldRunMotion } from "@/lib/ui-state";

const CHAPTER_STEP_ANGLE = 30;

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
  if (chapters.length < 2) return 0;

  const viewportCenter = window.scrollY + window.innerHeight * 0.5;
  const centers = chapters.map((chapter) => {
    const bounds = chapter.getBoundingClientRect();
    return window.scrollY + bounds.top + bounds.height * 0.5;
  });

  if (viewportCenter <= centers[0]) return 0;
  if (viewportCenter >= centers[centers.length - 1]) return centers.length - 1;

  for (let index = 0; index < centers.length - 1; index += 1) {
    const start = centers[index];
    const end = centers[index + 1];
    if (viewportCenter <= end) {
      return index + (viewportCenter - start) / (end - start);
    }
  }

  return centers.length - 1;
}

function initChapterState(manageActiveState: boolean): () => void {
  const rail = document.querySelector<HTMLElement>("[data-chapter-rail]");
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-chapter-link]"));
  const entries = links.flatMap((link) => {
    const chapter = document.querySelector<HTMLElement>(link.hash);
    return chapter ? [{ link, chapter }] : [];
  });
  const chapterLinks = entries.map(({ link }) => link);
  const chapters = entries.map(({ chapter }) => chapter);
  if (!rail || entries.length === 0) return () => undefined;

  let frame = 0;
  const update = () => {
    frame = 0;
    const progress = getChapterProgress(chapters);
    const activeIndex = Math.round(progress);
    const angle = activeIndex * CHAPTER_STEP_ANGLE;

    if (manageActiveState) setActiveChapter(chapterLinks, activeIndex);

    rail.style.setProperty("--chapter-rotor-angle", `${-angle}deg`);
    rail.style.setProperty("--chapter-label-angle", `${angle}deg`);
  };
  const requestUpdate = () => {
    if (frame === 0) frame = window.requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);

  const visibilityObserver = new IntersectionObserver((observations) => {
    for (const observation of observations) {
      const link = observation.target as HTMLAnchorElement;
      link.tabIndex = observation.isIntersecting ? 0 : -1;
    }
  });
  entries.forEach(({ link }) => visibilityObserver.observe(link));

  return () => {
    if (frame !== 0) window.cancelAnimationFrame(frame);
    window.removeEventListener("scroll", requestUpdate);
    window.removeEventListener("resize", requestUpdate);
    visibilityObserver.disconnect();
    entries.forEach(({ link }) => link.removeAttribute("tabindex"));
  };
}

export function initMotion(): void {
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();

  media.add(
    {
      chapterViewport: "(min-width: 1024px)",
      noReduce: "(prefers-reduced-motion: no-preference)",
    },
    (context) => {
      const conditions = context.conditions as { chapterViewport: boolean; noReduce: boolean };
      if (!conditions.chapterViewport) return;
      return initChapterState(!conditions.noReduce);
    }
  );

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
      if (!conditions.chapterDesktop || !conditions.noReduce) return;

      const wrapper = document.querySelector<HTMLElement>("[data-chapter-scroll]");
      const rail = document.querySelector<HTMLElement>("[data-chapter-rail]");
      const rotor = document.querySelector<HTMLElement>("[data-chapter-dial-rotor]");
      const labels = Array.from(document.querySelectorAll<HTMLElement>("[data-chapter-label]"));
      const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-chapter-link]"));
      const chapters = links.flatMap((link) => {
        const chapter = document.querySelector<HTMLElement>(link.hash);
        return chapter ? [chapter] : [];
      });
      const contact = document.querySelector<HTMLElement>("#contact");
      if (
        !wrapper ||
        !rail ||
        !rotor ||
        !contact ||
        labels.length !== chapters.length ||
        chapters.length === 0
      ) {
        return;
      }

      const updateRenderedState = () => {
        const rotation = Number(gsap.getProperty(rotor, "rotation"));
        const activeIndex = Math.round(-rotation / CHAPTER_STEP_ANGLE);
        setActiveChapter(links, activeIndex);
      };
      const rotateRotor = gsap.quickTo(rotor, "rotation", {
        duration: 0.35,
        ease: "power2.out",
        onUpdate: updateRenderedState,
      });
      const rotateLabels = labels.map((label) =>
        gsap.quickTo(label, "rotation", {
          duration: 0.35,
          ease: "power2.out",
        })
      );
      const updateDial = () => {
        const progress = getChapterProgress(chapters);
        const angle = progress * CHAPTER_STEP_ANGLE;
        rotateRotor(-angle);
        rotateLabels.forEach((rotateLabel, index) => {
          rotateLabel(angle - index * CHAPTER_STEP_ANGLE);
        });
      };

      const dialTrigger = ScrollTrigger.create({
        trigger: wrapper,
        start: "top bottom",
        endTrigger: contact,
        end: "bottom top",
        invalidateOnRefresh: true,
        onRefresh: updateDial,
        onUpdate: updateDial,
      });

      updateDial();
      updateRenderedState();

      return () => {
        dialTrigger.kill();
      };
    }
  );
}
