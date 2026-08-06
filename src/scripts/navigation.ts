const activeClasses = ["border", "border-nord-border/50", "bg-bg-elevated", "text-text-primary"];
const inactiveClasses = ["text-text-muted"];

function setActiveLink(links: HTMLAnchorElement[], id: string): void {
  for (const link of links) {
    const active = link.hash === `#${id}`;
    if (active) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
    activeClasses.forEach((name) => link.classList.toggle(name, active));
    inactiveClasses.forEach((name) => link.classList.toggle(name, !active));
  }
}

export function initNavigation(): void {
  const header = document.querySelector<HTMLElement>("[data-navbar]");
  const toggle = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
  const mobileNav = document.querySelector<HTMLElement>("[data-mobile-nav]");
  const closedIcon = document.querySelector<SVGElement>("[data-menu-closed-icon]");
  const openIcon = document.querySelector<SVGElement>("[data-menu-open-icon]");
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-nav-link]"));
  const scrollLinks = Array.from(
    document.querySelectorAll<HTMLAnchorElement>("[data-nav-link], [data-chapter-link]")
  );
  if (!header || !toggle || !mobileNav) return;

  const setMenuOpen = (open: boolean, returnFocus = false) => {
    mobileNav.classList.toggle("hidden", !open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
    closedIcon?.classList.toggle("hidden", open);
    openIcon?.classList.toggle("hidden", !open);

    if (open) {
      mobileNav.querySelector<HTMLAnchorElement>("a")?.focus();
    } else if (returnFocus) {
      toggle.focus();
    }
  };

  toggle.addEventListener("click", () => {
    setMenuOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setMenuOpen(false, true);
    }
  });

  for (const link of scrollLinks) {
    link.addEventListener("click", (event) => {
      const target = document.querySelector<HTMLElement>(link.hash);
      if (!target) return;
      event.preventDefault();
      setMenuOpen(false);
      window.history.pushState(null, "", link.hash);
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (link.hash === "#hero") {
        window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
      } else {
        target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      }
    });
  }

  const sections = links
    .map((link) => document.querySelector<HTMLElement>(link.hash))
    .filter((section): section is HTMLElement => section !== null);
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.find((entry) => entry.isIntersecting);
      if (visible?.target.id) setActiveLink(links, visible.target.id);
    },
    { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
  );
  sections.forEach((section) => observer.observe(section));

  const updateHeader = () => {
    header.dataset.scrolled = String(window.scrollY > 40);
  };
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}
