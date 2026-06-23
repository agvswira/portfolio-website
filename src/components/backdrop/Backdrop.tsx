"use client";

import CanvasBackground from "@/components/background/CanvasBackground";

// Clean minimal backdrop — solid Polar Night wash + optional vignette.
export default function Backdrop() {
  return (
    <>
      <CanvasBackground />
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 pointer-events-none bg-bg-base"
      >
        {/* Optional: super-subtle radial vignette to draw focus to center */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 120% 80% at 50% 0%, transparent 60%, rgba(0,0,0,0.18) 100%)",
          }}
        />
      </div>
    </>
  );
}
