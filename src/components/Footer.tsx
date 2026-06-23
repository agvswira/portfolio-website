import Link from "next/link";
import { FiGithub, FiLinkedin, FiTwitter, FiMail } from "react-icons/fi";
import { SITE, PERSONAL } from "@/lib/constants";

const ICONS: Record<string, React.ElementType> = {
  FiGithub,
  FiLinkedin,
  FiTwitter,
  FiMail,
};

const SOCIAL = [
  { label: "GitHub", href: PERSONAL.github, icon: "FiGithub" },
  { label: "LinkedIn", href: PERSONAL.linkedin, icon: "FiLinkedin" },
  { label: "Twitter / X", href: PERSONAL.twitter, icon: "FiTwitter" },
  { label: "Email", href: `mailto:${PERSONAL.email}`, icon: "FiMail" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-nord-border/30 py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="text-sm text-text-muted">
          <span className="text-gradient font-semibold">{SITE.name}</span>
          <span className="mx-2">·</span>
          <span>© {year}</span>
        </div>

        {/* Social links */}
        <nav aria-label="Social links">
          <ul className="flex items-center gap-4" role="list">
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
                    <Icon size={18} aria-hidden="true" />
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Blog link */}
        <div className="text-sm text-text-muted">
          <Link href="/blog" className="hover:text-frost transition-colors">
            Blog →
          </Link>
        </div>
      </div>
    </footer>
  );
}
