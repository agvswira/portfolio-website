import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

import { shouldRunMotion } from "@/lib/ui-state";

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
}
