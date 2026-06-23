"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/gsap";
import { useGSAP } from "@gsap/react";

interface RevealGroupProps {
  children: React.ReactNode;
  /** CSS selector for child items to stagger. Default: "> *" */
  selector?: string;
  stagger?: number;
  className?: string;
  /** Use ScrollTrigger.batch for grid items */
  batch?: boolean;
}

export default function RevealGroup({
  children,
  selector = "> *",
  stagger = 0.1,
  className,
  batch = false,
}: RevealGroupProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const reduced = prefersReducedMotion();

      if (batch) {
        // ScrollTrigger.batch for grid/list items
        const items = container.querySelectorAll(selector);
        if (!items.length) return;

        gsap.set(items, { opacity: 0, y: reduced ? 0 : 28 });

        ScrollTrigger.batch(items, {
          start: "top 88%",
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger,
              ease: "power2.out",
            }),
          once: true,
        });
      } else {
        const items = container.querySelectorAll(selector);
        if (!items.length) return;

        gsap.fromTo(
          items,
          { opacity: 0, y: reduced ? 0 : 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger,
            ease: "power2.out",
            scrollTrigger: {
              trigger: container,
              start: "top 85%",
              once: true,
              invalidateOnRefresh: true,
            },
          }
        );
      }
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
