import { FiGithub, FiLinkedin, FiInstagram, FiMail } from "react-icons/fi";
import { FaDiscord } from "react-icons/fa";
import { SITE, PERSONAL } from "@/lib/constants";

const ICONS: Record<string, React.ElementType> = {
  FiGithub,
  FiLinkedin,
  FiInstagram,
  FaDiscord,
  FiMail,
};

const SOCIAL = [
  { label: "GitHub", href: PERSONAL.github, icon: "FiGithub" },
  { label: "LinkedIn", href: PERSONAL.linkedin, icon: "FiLinkedin" },
  { label: "Instagram", href: PERSONAL.instagram, icon: "FiInstagram" },
  { label: "Discord", href: PERSONAL.discord, icon: "FaDiscord" },
  { label: "Email", href: `mailto:${PERSONAL.email}`, icon: "FiMail" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-nord-border/10 py-1">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-1" style={{ fontSize: '0.875rem', lineHeight: '1.25' }}>
        {/* Brand */}
        <div className="text-text-muted">
          <span className="text-gradient font-semibold">{SITE.name}</span>
          <span className="mx-2">·</span>
          <span>© {year}</span>
        </div>

        {/* Social links */}
        <nav aria-label="Social links">
          <ul className="flex items-center gap-3" role="list">
            {SOCIAL.map(({ label, href, icon }) => {
              const Icon = ICONS[icon];
              return (
                <li key={label}>
                  <a
                    href={href}
                    aria-label={label}
                    rel="noopener noreferrer"
                    target={href.startsWith("mailto") ? undefined : "_blank"}
                    className="text-text-muted hover:text-frost transition-colors p-1"
                  >
                    <Icon size={16} aria-hidden="true" />
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>


      </div>
    </footer>
  );
}
