"use client";

import { useRef } from "react";
import { LuChevronDown } from "react-icons/lu";
import { FiGithub, FiLinkedin, FiInstagram } from "react-icons/fi";
import { FaDiscord } from "react-icons/fa";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { PERSONAL, HERO_STATS, SITE } from "@/lib/constants";
import HeroScene from "@/components/motion/HeroScene";
import Button from "@/components/ui/Button";

export default function Hero() {
  const statsRef = useRef<HTMLDivElement>(null);

  // Animate stat numbers on mount (after content appears)
  useGSAP(
    () => {
      const counters = statsRef.current?.querySelectorAll("[data-count]");
      if (!counters) return;
      counters.forEach((el) => {
        const target = Number((el as HTMLElement).dataset.count);
        gsap.fromTo(
          el,
          { textContent: 0 },
          {
            textContent: target,
            duration: 1.5,
            delay: 0.8,
            ease: "power2.out",
            snap: { textContent: 1 },
            onUpdate() {
              (el as HTMLElement).textContent = String(
                Math.round(Number((el as HTMLElement).textContent))
              );
            },
          }
        );
      });
    },
    { scope: statsRef }
  );

  return (
    <HeroScene showHorizon={false}>
      <div className="w-full max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-5">
        {/* Title — LCP element: SSR opacity 1, no animation delay */}
        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1]"
          style={{ opacity: 1 }}
        >
          <span className="text-gradient">{SITE.name}</span>
        </h1>

        {/* Tagline */}
        <p className="text-xl sm:text-2xl text-text-secondary font-medium max-w-xl">
          {PERSONAL.role}
        </p>

        {/* Bio */}
        <p className="text-text-muted text-base sm:text-lg max-w-2xl leading-relaxed">
          {PERSONAL.bio}
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          <Button as="link" href="#projects" variant="primary" shimmer>
            View Projects
          </Button>
          <Button as="link" href="#contact" variant="outline">
            Get in Touch
          </Button>
        </div>

        {/* Social icons */}
        <div className="flex items-center gap-4 mt-1">
          {[
            { href: PERSONAL.github, Icon: FiGithub, label: "GitHub" },
            { href: PERSONAL.linkedin, Icon: FiLinkedin, label: "LinkedIn" },
            { href: PERSONAL.instagram, Icon: FiInstagram, label: "Instagram" },
            { href: PERSONAL.discord, Icon: FaDiscord, label: "Discord" },
          ].map(({ href, Icon, label }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              rel="noopener noreferrer"
              target="_blank"
              className="text-text-muted hover:text-frost transition-colors p-1"
            >
              <Icon size={20} aria-hidden="true" />
            </a>
          ))}
        </div>

        {/* Stats */}
        <div ref={statsRef} className="flex flex-wrap items-center justify-center gap-8 mt-4">
          {HERO_STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-text-primary tabular-nums">
                <span data-count={stat.value}>0</span>
                <span className="text-frost">{stat.suffix}</span>
              </p>
              <p className="eyebrow text-[10px] mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        aria-hidden="true"
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-text-muted animate-bounce"
      >
        <LuChevronDown size={22} />
      </div>
    </HeroScene>
  );
}
