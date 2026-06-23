"use client";

import { useRef, useEffect } from "react";
import { getLenis } from "@/components/motion/SmoothScroll";

interface MarqueeProps {
  children: React.ReactNode;
  baseSpeed?: number; // px/frame at velocity 0
  className?: string;
}

/**
 * CSS-driven marquee strip with velocity-linked speed from Lenis scroll.
 * Renders items twice for seamless loop.
 */
export default function Marquee({ children, baseSpeed = 0.5, className = "" }: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const xRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let lastTime = performance.now();

    const animate = (now: number) => {
      const dt = Math.min(now - lastTime, 50); // cap at 50ms
      lastTime = now;

      const lenis = getLenis();
      const velocity = lenis ? Math.abs(lenis.velocity) : 0;
      const speed = baseSpeed + velocity * 0.4;

      xRef.current -= speed * (dt / 16.67);

      const track = trackRef.current;
      if (track) {
        // Reset when first half has scrolled by
        const halfWidth = track.scrollWidth / 2;
        if (Math.abs(xRef.current) >= halfWidth) {
          xRef.current = 0;
        }
        track.style.transform = `translateX(${xRef.current}px)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [baseSpeed]);

  return (
    <div className={`marquee-container ${className}`} aria-hidden="true">
      <div ref={trackRef} className="marquee-track">
        {/* Duplicate content for seamless loop */}
        <div className="flex items-center gap-8 pr-8">{children}</div>
        <div className="flex items-center gap-8 pr-8" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
