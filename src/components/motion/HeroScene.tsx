"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion, isMobile, refreshAfterAssets } from "@/lib/gsap";
import { useGSAP } from "@gsap/react";

interface HeroSceneProps {
  children: React.ReactNode;
  /** Show optional 1px horizon accent line (default: true) */
  showHorizon?: boolean;
}

/**
 * HeroScene — parallax mountain layers (flat solid Nord colors) + ScrollTrigger pin/scrub.
 *
 * Layer z-stack (back → front):
 *   0. Sky          #242933 — slowest
 *   1. Far mountain #3B4252 — slow + scale
 *   2. Mid mountain #434C5E — medium
 *   3. Near mountain #4C566A — fast, sweeps up
 *   4. Hero content — fades + moves up
 *
 * On mobile (≤767px) or reduced-motion: static stacked silhouettes, no pin/scrub.
 */
export default function HeroScene({ children, showHorizon = true }: HeroSceneProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const mtFarRef = useRef<HTMLDivElement>(null);
  const mtMidRef = useRef<HTMLDivElement>(null);
  const mtNearRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || isMobile()) return;

      const section = sectionRef.current;
      if (!section) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=120%",
          scrub: true,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        } satisfies ScrollTrigger.Vars,
      });

      // Sky — nearly static
      tl.to(skyRef.current, { y: "-5%", ease: "none" }, 0);

      // Far mountain — slow + slight scale
      tl.fromTo(
        mtFarRef.current,
        { y: "0%", scale: 1 },
        { y: "-15%", scale: 1.04, ease: "none" },
        0
      );
      // Change far mountain color to match background
      tl.to("#far-mountain-path", {
        attr: { fill: "#242933" },
        ease: "none"
      }, 0);

      // Mid mountain — medium speed
      tl.to(mtMidRef.current, { y: "-35%", ease: "none" }, 0);
      // Change mid mountain color to match background
      tl.to("#mid-mountain-path", {
        attr: { fill: "#242933" },
        ease: "none"
      }, 0);

      // Near mountain — fast, sweeps up and out
      tl.to(mtNearRef.current, { y: "-70%", opacity: 0.4, ease: "none" }, 0);
      // Change near mountain color to match background
      tl.to("#near-mountain-path", {
        attr: { fill: "#242933" },
        ease: "none"
      }, 0);

      // Content — rise + fade
      tl.to(contentRef.current, { y: "-20%", opacity: 0, ease: "none" }, 0);

      refreshAfterAssets();
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative w-full h-screen overflow-hidden"
      aria-label="Hero section"
    >
      {/* ── Layer 0: Sky ─────────────────────────────── */}
      <div
        ref={skyRef}
        aria-hidden="true"
        className="absolute inset-0 parallax-layer"
        style={{ background: "#242933", zIndex: 0 }}
      />

      {/* ── Layer 1: Far mountain ────────────────────── */}
      <div
        ref={mtFarRef}
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 parallax-layer"
        style={{ zIndex: 1 }}
      >
        {/* Optional horizon accent line */}
        {showHorizon && (
          <div
            className="absolute left-0 right-0"
            style={{
              bottom: "calc(35% + 1px)",
              height: "1px",
              background: "#5E81AC",
              opacity: 0.5,
            }}
          />
        )}
        <svg
          viewBox="0 0 1440 480"
          preserveAspectRatio="xMidYMax slice"
          className="w-full"
          style={{ display: "block", marginBottom: -1 }}
        >
          <path
            id="far-mountain-path"
            d="M0,480 L0,320 Q120,260 200,280 Q320,310 440,240 Q520,190 600,200 Q700,215 780,180 Q860,150 960,170 Q1040,185 1120,160 Q1220,130 1320,150 Q1380,160 1440,145 L1440,480 Z"
            fill="#3B4252"
          />
        </svg>
      </div>

      {/* ── Layer 2: Mid mountain ────────────────────── */}
      <div
        ref={mtMidRef}
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 parallax-layer"
        style={{ zIndex: 2 }}
      >
        <svg
          viewBox="0 0 1440 480"
          preserveAspectRatio="xMidYMax slice"
          className="w-full"
          style={{ display: "block", marginBottom: -1 }}
        >
          <path
            id="mid-mountain-path"
            d="M0,480 L0,360 Q80,330 160,340 Q260,355 360,300 Q440,260 520,270 Q620,285 720,240 Q800,210 880,225 Q960,240 1040,210 Q1140,175 1240,195 Q1340,215 1440,190 L1440,480 Z"
            fill="#434C5E"
          />
        </svg>
      </div>

      {/* ── Layer 3: Near mountain ───────────────────── */}
      <div
        ref={mtNearRef}
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 parallax-layer"
        style={{ zIndex: 3 }}
      >
        <svg
          viewBox="0 0 1440 480"
          preserveAspectRatio="xMidYMax slice"
          className="w-full"
          style={{ display: "block", marginBottom: -1 }}
        >
          <path
            id="near-mountain-path"
            d="M0,480 L0,400 Q100,375 200,385 Q300,395 400,355 Q480,325 560,335 Q660,350 760,310 Q840,280 920,295 Q1000,310 1080,280 Q1180,245 1280,265 Q1360,280 1440,260 L1440,480 Z"
            fill="#4C566A"
          />
        </svg>
      </div>

      {/* ── Scene seam — fog gradient at bottom ──────── */}
      <div aria-hidden="true" className="scene-seam" style={{ zIndex: 4 }} />

      {/* ── Layer 4: Hero content ────────────────────── */}
      <div
        ref={contentRef}
        className="absolute inset-0 flex flex-col justify-center items-center"
        style={{ zIndex: 5 }}
      >
        {children}
      </div>
    </section>
  );
}
