"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

export default function CanvasBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);
  const scrollYRef = useRef<number>(0);
  const heroHeightRef = useRef<number>(0);
  const densityRef = useRef<number>(1); // Current interpolated density (0-1)
  const visibilityRef = useRef<boolean>(true); // Track tab visibility

  // Check for reduced motion preference
  const prefersReducedMotion = (): boolean => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  // Check for low-end device
  const isLowEndDevice = (): boolean => {
    if (typeof window === "undefined") return false;
    // Simple heuristic: if device has less than 4 cores or less than 2GB RAM, consider it low-end
    // Note: This is approximate as memory and hardwareConcurrency aren't available on all browsers
    const cores = navigator.hardwareConcurrency || 4;
    return cores <= 2;
  };

  // Easing function for smoother transitions
  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  };

  // Additional easing function for even smoother transitions
  const easeOutQuad = (t: number): number => {
    return t * (2 - t);
  };

  // Linear interpolation function
  const lerp = (start: number, end: number, t: number): number => {
    return start + (end - start) * t;
  };

  // Initialize particles
  const initParticles = (count: number) => {
    const particles: Particle[] = [];
    const canvas = canvasRef.current;
    if (!canvas) return particles;

    for (let i = 0; i < count; i++) {
      // Distribute particles with bias toward center for more natural look
      const distanceFromCenter = Math.sqrt(Math.random());
      const angle = Math.random() * Math.PI * 2;

      // Ensure we have valid canvas dimensions
      const width = canvas.width > 0 ? canvas.width : window.innerWidth;
      const height = canvas.height > 0 ? canvas.height : window.innerHeight;

      particles.push({
        x: width * (0.5 + 0.5 * distanceFromCenter * Math.cos(angle)),
        y: height * (0.5 + 0.5 * distanceFromCenter * Math.sin(angle)),
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.5,
      });
    }

    return particles;
  };

  // Resize canvas to match window size
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Ensure we have valid dimensions
    const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

    // Only update if dimensions have changed
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  };

  // Update particle positions and properties
  const updateParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width <= 0 || canvas.height <= 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate how many particles to show based on density
    const maxParticles = particlesRef.current.length;
    const visibleParticles = Math.floor(maxParticles * densityRef.current);

    // Early exit if no particles should be visible
    if (visibleParticles <= 0) {
      return;
    }

    // Update and draw particles
    for (let i = 0; i < visibleParticles; i++) {
      const particle = particlesRef.current[i];
      if (!particle) continue;

      // Update position with slight movement
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      // Add subtle variation to particle movement for more organic feel
      particle.speedX += (Math.random() - 0.5) * 0.02;
      particle.speedY += (Math.random() - 0.5) * 0.02;

      // Limit speed to prevent particles from moving too erratically
      particle.speedX = Math.max(Math.min(particle.speedX, 1), -1);
      particle.speedY = Math.max(Math.min(particle.speedY, 1), -1);

      // Boundary checks with wrapping
      if (particle.x > canvas.width) particle.x = 0;
      if (particle.x < 0) particle.x = canvas.width;
      if (particle.y > canvas.height) particle.y = 0;
      if (particle.y < 0) particle.y = canvas.height;

      // Calculate opacity based on Y position for gradient effect
      // Particles fade out near the bottom for smooth transition
      const yPosRatio = canvas.height > 0 ? particle.y / canvas.height : 0;
      // Use cubic easing for smoother gradient transition
      const gradientOpacity = Math.pow(1 - yPosRatio, 3);

      // Combine with particle's base opacity and apply density factor
      const finalOpacity = particle.opacity * gradientOpacity * densityRef.current;

      // Only draw particle if it has significant opacity
      if (finalOpacity > 0.01) {
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(136, 192, 208, ${finalOpacity})`; // Frost color
        ctx.fill();
      }
    }
  };

  // Animation loop
  const animate = () => {
    if (prefersReducedMotion()) {
      // Stop animation if reduced motion is preferred
      return;
    }

    // Pause animation when tab is not visible to save resources
    if (!visibilityRef.current) {
      animationFrameRef.current = requestAnimationFrame(animate);
      return;
    }

    // Calculate scroll progress through hero section
    // Ensure we don't divide by zero
    const scrollProgress = heroHeightRef.current > 0
      ? Math.max(0, Math.min(1, scrollYRef.current / heroHeightRef.current))
      : 0;

    // Apply easing to scroll progress for smoother transition
    const easedProgress = easeInOutCubic(scrollProgress);

    // Apply additional easing for even smoother transition
    const finalProgress = easeOutQuad(easedProgress);

    // Interpolate density target (1 = dense, 0 = sparse)
    const targetDensity = 1 - finalProgress;

    // Smoothly interpolate current density using lerp with inertia
    densityRef.current += (targetDensity - densityRef.current) * 0.03;

    // Small optimization: avoid unnecessary updates when density is close to target
    if (Math.abs(targetDensity - densityRef.current) < 0.001) {
      densityRef.current = targetDensity;
    }

    // Update particles based on current density
    updateParticles();

    // Continue animation loop
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Handle scroll events
  const handleScroll = () => {
    scrollYRef.current = window.scrollY;
  };

  // Initialize scroll position
  const initScrollPosition = () => {
    scrollYRef.current = window.scrollY;
  };

  // Handle visibility change (pause animation when tab is not visible)
  const handleVisibilityChange = () => {
    visibilityRef.current = !document.hidden;
  };

  // Reduce frame rate when tab is not active
  const handleBlur = () => {
    visibilityRef.current = false;
  };

  const handleFocus = () => {
    visibilityRef.current = true;
  };

  // Initialize component
  useEffect(() => {
    // Wait for next tick to ensure DOM is ready
    const init = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Set initial canvas size
      resizeCanvas();

      // Store hero height
      const updateHeroHeight = () => {
        const heroElement = document.getElementById("hero");
        if (heroElement) {
          const height = heroElement.offsetHeight;
          // Only update if we got a valid height
          if (height > 0) {
            heroHeightRef.current = height;
          }
        }
      };

      // Try to get hero height immediately
      updateHeroHeight();

      // If hero height is still 0, try again after a short delay
      let timer: NodeJS.Timeout | null = null;
      if (heroHeightRef.current === 0) {
        timer = setTimeout(updateHeroHeight, 100);
        // Also try again after all assets are loaded
        window.addEventListener('load', updateHeroHeight);
      }

      // Initialize particles with dense count (reduce for low-end devices)
      const particleCount = isLowEndDevice() ? 200 : 400;
      particlesRef.current = initParticles(particleCount);

      // Start animation if motion is not reduced
      if (!prefersReducedMotion()) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }

      // Initialize scroll position
      initScrollPosition();

      // Add event listeners
      let resizeTimeout: NodeJS.Timeout;
      const handleResizeAndHeroHeight = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          resizeCanvas();
          updateHeroHeight();
        }, 100);
      };

      window.addEventListener("resize", handleResizeAndHeroHeight);
      window.addEventListener("scroll", handleScroll, { passive: true });
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("blur", handleBlur);
      window.addEventListener("focus", handleFocus);

      // Cleanup
      return () => {
        window.removeEventListener("resize", handleResizeAndHeroHeight);
        window.removeEventListener("scroll", handleScroll);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        window.removeEventListener("blur", handleBlur);
        window.removeEventListener("focus", handleFocus);
        window.removeEventListener('load', updateHeroHeight);
        if (timer) clearTimeout(timer);
        if (resizeTimeout) clearTimeout(resizeTimeout);
        cancelAnimationFrame(animationFrameRef.current);
      };
    };

    // Use requestAnimationFrame to ensure DOM is ready
    const initTimeout = requestAnimationFrame(init);

    // Cleanup
    return () => {
      cancelAnimationFrame(initTimeout);
    };
  }, []);



  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ willChange: "transform" }}
    />
  );
}
