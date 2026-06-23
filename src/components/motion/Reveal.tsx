"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/gsap";
import { useGSAP } from "@gsap/react";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  /** "up" (default) | "none" */
  direction?: "up" | "none";
  className?: string;
  once?: boolean;
}

export default function Reveal({
  children,
  delay = 0,
  direction = "up",
  className,
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const reduced = prefersReducedMotion();

      // Reduced motion: just fade, no translate
      const fromVars = reduced
        ? { opacity: 0 }
        : { opacity: 0, y: direction === "up" ? 32 : 0 };

      const toVars = {
        opacity: 1,
        y: 0,
        duration: 0.55,
        delay,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: once ? "play none none none" : "play none none reverse",
          invalidateOnRefresh: true,
        } satisfies ScrollTrigger.Vars,
      };

      gsap.fromTo(el, fromVars, toVars);
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
