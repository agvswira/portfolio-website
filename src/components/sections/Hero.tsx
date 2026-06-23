"use client";

import { LuChevronDown } from "react-icons/lu";
import { FiGithub, FiLinkedin, FiInstagram } from "react-icons/fi";
import { FaDiscord } from "react-icons/fa";
import { PERSONAL, SITE } from "@/lib/constants";
import HeroScene from "@/components/motion/HeroScene";
import { getLenis } from "@/components/motion/SmoothScroll";

function smoothScrollTo(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
  e.preventDefault();
  const id = href.replace("#", "");
  if (id === "hero") {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    return;
  }
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(el, { offset: -64, duration: 1.2 });
  } else {
    const y = el.getBoundingClientRect().top + window.scrollY - 64;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
}

export default function Hero() {
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
          <a
            href="#projects"
            onClick={(e) => smoothScrollTo(e, "#projects")}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-frost text-bg-base font-semibold hover:bg-frost-cyan hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(136,192,208,0.35)] active:translate-y-0 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-frost focus-visible:outline-offset-2 select-none shimmer-btn"
          >
            View Projects
          </a>
          <a
            href="#contact"
            onClick={(e) => smoothScrollTo(e, "#contact")}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium border border-frost/40 text-frost hover:bg-frost/10 hover:border-frost transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-frost focus-visible:outline-offset-2 select-none"
          >
            Get in Touch
          </a>
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
