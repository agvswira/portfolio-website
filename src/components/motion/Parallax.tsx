"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion, isMobile } from "@/lib/gsap";
import { useGSAP } from "@gsap/react";

interface ParallaxProps {
  children: React.ReactNode;
  /** Parallax speed: negative = slow (moves less), positive = fast (moves more). Range: -1..1 */
  speed?: number;
  /** Allow parallax on mobile (default: false) */
  mobile?: boolean;
  className?: string;
}

const MAX_TRAVEL = 200; // px

export default function Parallax({
  children,
  speed = -0.12,
  mobile = false,
  className,
}: ParallaxProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      if (!mobile && isMobile()) return;

      const el = containerRef.current;
      if (!el) return;

      const yTravel = speed * MAX_TRAVEL;

      gsap.fromTo(
        el,
        { y: 0 },
        {
          y: yTravel,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className={`parallax-layer ${className ?? ""}`}>
      {children}
    </div>
  );
}
