"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

// Module-level so Marquee can read velocity without prop drilling
let _lenis: Lenis | null = null;
export function getLenis(): Lenis | null {
  return _lenis;
}

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const stopRef = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    stopRef.current = false;

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    _lenis = lenis;

    // Sync Lenis position to ScrollTrigger every tick
    lenis.on("scroll", () => ScrollTrigger.update());

    const raf = (time: number) => {
      if (stopRef.current) return;
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    return () => {
      stopRef.current = true;
      lenis.destroy();
      _lenis = null;
    };
  }, []);

  return <>{children}</>;
}
