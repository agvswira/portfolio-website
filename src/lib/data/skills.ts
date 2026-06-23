import type { IconType } from "react-icons";
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiFramer,
  SiHtml5,
  SiJavascript,
  SiSass,
} from "react-icons/si";
import {
  SiNodedotjs,
  SiExpress,
  SiGraphql,
  SiPostgresql,
  SiMongodb,
  SiRedis,
  SiDocker,
  SiGit,
  SiGithubactions,
  SiVercel,
  SiFigma,
  SiLinux,
} from "react-icons/si";
import { LuBrainCircuit, LuUsers, LuMessageSquare, LuRefreshCw, LuLightbulb } from "react-icons/lu";

export interface SkillItem {
  name: string;
  icon: IconType;
}

export interface SkillGroup {
  category: string;
  items: SkillItem[];
}

export const SKILL_GROUPS: SkillGroup[] = [
  {
    category: "Frontend",
    items: [
      { name: "React", icon: SiReact },
      { name: "Next.js", icon: SiNextdotjs },
      { name: "TypeScript", icon: SiTypescript },
      { name: "Tailwind CSS", icon: SiTailwindcss },
      { name: "Framer Motion", icon: SiFramer },
      { name: "JavaScript", icon: SiJavascript },
      { name: "HTML5", icon: SiHtml5 },
      { name: "Sass / CSS", icon: SiSass },
    ],
  },
  {
    category: "Backend",
    items: [
      { name: "Node.js", icon: SiNodedotjs },
      { name: "Express", icon: SiExpress },
      { name: "GraphQL", icon: SiGraphql },
    ],
  },
  {
    category: "Database",
    items: [
      { name: "PostgreSQL", icon: SiPostgresql },
      { name: "MongoDB", icon: SiMongodb },
      { name: "Redis", icon: SiRedis },
    ],
  },
  {
    category: "Tools & DevOps",
    items: [
      { name: "Docker", icon: SiDocker },
      { name: "Git", icon: SiGit },
      { name: "GitHub Actions", icon: SiGithubactions },
      { name: "Vercel", icon: SiVercel },
      { name: "Figma", icon: SiFigma },
      { name: "Linux", icon: SiLinux },
    ],
  },
  {
    category: "Soft Skills",
    items: [
      { name: "Problem Solving", icon: LuBrainCircuit },
      { name: "Kolaborasi Tim", icon: LuUsers },
      { name: "Komunikasi", icon: LuMessageSquare },
      { name: "Adaptabilitas", icon: LuRefreshCw },
      { name: "Kreativitas", icon: LuLightbulb },
    ],
  },
];

// Flat list for marquee strip
export const TECH_MARQUEE = SKILL_GROUPS.flatMap((g) => g.items.filter((_, i) => i < 4)).map(
  (s) => ({ name: s.name, icon: s.icon })
);
