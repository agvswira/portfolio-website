"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LuX, LuMenu } from "react-icons/lu";
import { NAV_ITEMS, SITE } from "@/lib/constants";
import { getLenis } from "@/components/motion/SmoothScroll";

export default function Navbar() {
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Scrollspy via IntersectionObserver
  useEffect(() => {
    const sectionIds = NAV_ITEMS.map((n) => n.href.replace("#", ""));

    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // Scrolled state for glass effect
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Smooth anchor scroll (accounts for Lenis)
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (!el) return;

    // Use Lenis if available, else native
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(el, { offset: 0, duration: 1.2 });
    } else {
      el.scrollIntoView({ behavior: "smooth" });
    }
    setMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? "border-b border-frost/10 bg-bg-base/80 backdrop-blur-md" : ""
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="#hero"
          onClick={(e) => handleNavClick(e, "#hero")}
          className="text-lg font-semibold tracking-tight"
          aria-label={`${SITE.name} — go to top`}
        >
          <span className="text-gradient">{SITE.name.split(" ")[0]}</span>
          <span className="text-frost">.</span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main navigation" className="hidden md:block">
          <ul className="flex items-center gap-1 relative" role="list">
            {NAV_ITEMS.map((item) => {
              const id = item.href.replace("#", "");
              const isActive = activeSection === id;
              return (
                <li key={item.href} className="relative">
                  <a
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    aria-current={isActive ? "location" : undefined}
                    className={`relative px-4 py-2 rounded-lg text-sm transition-colors duration-200 z-10 block ${
                      isActive ? "text-text-primary" : "text-text-muted hover:text-text-secondary"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-lg bg-bg-elevated border border-nord-border/50"
                        style={{ zIndex: -1 }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={menuOpen}
          className="md:hidden p-2 rounded-lg text-text-muted hover:text-frost hover:bg-bg-elevated transition-colors"
        >
          {menuOpen ? <LuX size={20} /> : <LuMenu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            aria-label="Mobile navigation"
            className="md:hidden bg-bg-surface/95 backdrop-blur-md border-b border-frost/10"
          >
            <ul className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-1" role="list">
              {NAV_ITEMS.map((item) => {
                const id = item.href.replace("#", "");
                const isActive = activeSection === id;
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                      aria-current={isActive ? "location" : undefined}
                      className={`block px-4 py-3 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-bg-elevated text-text-primary border border-nord-border/50"
                          : "text-text-muted hover:text-text-secondary hover:bg-bg-elevated/50"
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
