import type { IconType } from "react-icons";
import { SiHtml5, SiCss, SiJavascript } from "react-icons/si";
import { SiNodedotjs } from "react-icons/si";
import { SiMysql, SiMongodb } from "react-icons/si";
import { SiDocker, SiGit, SiLinux, SiFigma } from "react-icons/si";
import { SiPython, SiPandas, SiJupyter, SiTensorflow } from "react-icons/si";
import { LuBrain, LuLanguages } from "react-icons/lu";

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
      { name: "HTML", icon: SiHtml5 },
      { name: "CSS", icon: SiCss },
      { name: "JavaScript", icon: SiJavascript },
    ],
  },
  {
    category: "Backend",
    items: [{ name: "Node.js", icon: SiNodedotjs }],
  },
  {
    category: "Database",
    items: [
      { name: "MySQL", icon: SiMysql },
      { name: "MongoDB", icon: SiMongodb },
    ],
  },
  {
    category: "Tools & DevOps",
    items: [
      { name: "Docker", icon: SiDocker },
      { name: "Git", icon: SiGit },
      { name: "Linux", icon: SiLinux },
      { name: "Figma", icon: SiFigma },
    ],
  },
  {
    category: "AI & Data Science",
    items: [
      { name: "Python", icon: SiPython },
      { name: "Pandas", icon: SiPandas },
      { name: "Jupyter", icon: SiJupyter },
      { name: "TensorFlow", icon: SiTensorflow },
    ],
  },
  {
    category: "English",
    items: [
      { name: "Reading", icon: LuBrain },
      { name: "Writing", icon: LuLanguages },
    ],
  },
];

// Flat list for marquee strip
export const TECH_MARQUEE = SKILL_GROUPS.flatMap((g) => g.items.filter((_, i) => i < 3)).map(
  (s) => ({ name: s.name, icon: s.icon })
);
