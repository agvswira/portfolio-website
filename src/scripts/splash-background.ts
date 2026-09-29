import { splashConfig } from "@/lib/splash/config";
import { createFluidEngine, type FluidEngine } from "@/lib/splash/fluid-engine";

const mounted = new WeakMap<HTMLCanvasElement, () => void>();

export function mountSplashBackground(canvas: HTMLCanvasElement): () => void {
  mounted.get(canvas)?.();

  const finePointer = window.matchMedia("(pointer: fine) and (hover: hover)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let engine: FluidEngine | null = null;
  let failed = false;
  let previousPointer: { x: number; y: number } | null = null;
  let disposed = false;

  const resetPointer = () => {
    previousPointer = null;
  };

  const destroyEngine = () => {
    engine?.destroy();
    engine = null;
  };

  const syncAvailability = () => {
    const shouldRun = splashConfig.enabled && finePointer.matches && !reducedMotion.matches;
    if (!shouldRun) {
      destroyEngine();
      resetPointer();
      return;
    }
    if (!engine && !failed && !document.hidden) {
      engine = createFluidEngine(canvas, splashConfig);
      failed = !engine;
    }
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!engine || !finePointer.matches || event.pointerType === "touch") return;
    const x = event.clientX;
    const y = event.clientY;
    if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) {
      resetPointer();
      return;
    }

    if (!previousPointer) {
      previousPointer = { x, y };
      return;
    }

    const deltaX = Math.max(-72, Math.min(72, x - previousPointer.x));
    const deltaY = Math.max(-72, Math.min(72, y - previousPointer.y));
    previousPointer = { x, y };
    if (deltaX === 0 && deltaY === 0) return;

    engine.pointerMove({
      x: x / Math.max(1, window.innerWidth),
      y: 1 - y / Math.max(1, window.innerHeight),
      dx: deltaX / Math.max(1, window.innerWidth),
      dy: -deltaY / Math.max(1, window.innerHeight),
    });
  };

  const onPointerOut = (event: PointerEvent) => {
    if (event.relatedTarget === null) resetPointer();
  };

  const onVisibilityChange = () => {
    resetPointer();
    if (document.hidden) engine?.pause();
    else syncAvailability();
  };

  const onContextLost = (event: Event) => {
    event.preventDefault();
    destroyEngine();
    failed = true;
    resetPointer();
  };

  const onContextRestored = () => {
    failed = false;
    syncAvailability();
  };

  const onPreferenceChange = () => {
    failed = false;
    resetPointer();
    syncAvailability();
  };

  canvas.addEventListener("webglcontextlost", onContextLost);
  canvas.addEventListener("webglcontextrestored", onContextRestored);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerleave", resetPointer, { passive: true });
  window.addEventListener("pointerout", onPointerOut, { passive: true });
  window.addEventListener("blur", resetPointer);
  document.addEventListener("visibilitychange", onVisibilityChange);
  finePointer.addEventListener("change", onPreferenceChange);
  reducedMotion.addEventListener("change", onPreferenceChange);

  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    destroyEngine();
    canvas.removeEventListener("webglcontextlost", onContextLost);
    canvas.removeEventListener("webglcontextrestored", onContextRestored);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerleave", resetPointer);
    window.removeEventListener("pointerout", onPointerOut);
    window.removeEventListener("blur", resetPointer);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    finePointer.removeEventListener("change", onPreferenceChange);
    reducedMotion.removeEventListener("change", onPreferenceChange);
    mounted.delete(canvas);
  };

  mounted.set(canvas, cleanup);
  syncAvailability();
  return cleanup;
}
