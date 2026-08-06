import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

import { shouldRunMotion } from "@/lib/ui-state";

function initChapterState(): void {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-chapter-link]"));
  const chapters = links
    .map((link) => document.querySelector<HTMLElement>(link.hash))
    .filter((section): section is HTMLElement => section !== null);
  if (links.length === 0 || chapters.length === 0) return;

  let frame = 0;
  const update = () => {
    frame = 0;
    const viewportMarker = window.innerHeight * 0.5;
    let active = chapters[0];

    for (const chapter of chapters) {
      if (chapter.getBoundingClientRect().top <= viewportMarker) active = chapter;
    }

    for (const link of links) {
      if (link.hash === `#${active.id}`) {
        link.setAttribute("aria-current", "step");
      } else {
        link.removeAttribute("aria-current");
      }
    }
  };
  const requestUpdate = () => {
    if (frame === 0) frame = window.requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
}

export function initMotion(): void {
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();

  initChapterState();

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
      const progress = document.querySelector<HTMLElement>("[data-chapter-progress]");
      const contact = document.querySelector<HTMLElement>("#contact");
      if (!wrapper || !rail || !progress || !contact) return;

      ScrollTrigger.create({
        trigger: wrapper,
        start: "top top+=64",
        endTrigger: contact,
        end: "bottom bottom",
        pin: rail,
        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });

      gsap.to(progress, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: wrapper,
          start: "top center",
          endTrigger: contact,
          end: "bottom center",
          scrub: 0.6,
        },
      });
    }
  );
}
