// Client-only utility — only imported by "use client" components
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Register plugins once when this module first loads in the browser.
// The typeof guard prevents SSR crashes.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  ScrollTrigger.config({ ignoreMobileResize: true });
}

/** True if user prefers reduced motion */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** True if viewport ≤ 767px */
export function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth <= 767;
}

/**
 * Call after fonts + images load so pin positions are accurate.
 * Safe to call multiple times (GSAP debounces the refresh).
 */
export function refreshAfterAssets(): void {
  if (typeof window === "undefined") return;
  const doRefresh = () => ScrollTrigger.refresh();
  if (document.fonts?.ready) {
    document.fonts.ready.then(doRefresh);
  } else {
    window.addEventListener("load", doRefresh, { once: true });
  }
}

export { gsap, ScrollTrigger };
